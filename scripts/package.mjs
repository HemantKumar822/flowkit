import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { verifyTemplateBundle } from '../skills/flowkit/scripts/lib/templates.mjs';

const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
function plainPath(file) {
  for (let current = path.resolve(file); ; current = path.dirname(current)) {
    try {
      if (fs.lstatSync(current).isSymbolicLink())
        throw Error(`Release refuses linked path: ${current}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (path.dirname(current) === current) break;
  }
}
function safeRelative(value) {
  if (
    typeof value !== 'string' ||
    !value ||
    value.includes('\\') ||
    value.includes('\0') ||
    value.startsWith('/') ||
    value.split('/').some((p) => !p || p === '.' || p === '..') ||
    !/^[A-Za-z0-9_.\-/]+$/.test(value)
  )
    throw Error(`Invalid release allowlist path: ${value}`);
  return value;
}
function collect(root) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'release-files.json'), 'utf8')),
    files = new Map();
  function visit(relative) {
    safeRelative(relative);
    const full = path.join(root, relative);
    plainPath(full);
    const stat = fs.lstatSync(full);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(full).sort()) visit(`${relative}/${name}`);
    } else if (stat.isFile())
      files.set(relative, {
        name: relative,
        bytes: fs.readFileSync(full),
        mode: relative.startsWith('bin/') ? 0o755 : 0o644,
      });
    else throw Error(`Release requires plain regular files: ${relative}`);
  }
  if (!Array.isArray(manifest.required) || !Array.isArray(manifest.optional))
    throw Error('Invalid release allowlist');
  for (const relative of manifest.required) visit(relative);
  for (const relative of manifest.optional) {
    safeRelative(relative);
    plainPath(path.join(root, relative));
    if (fs.existsSync(path.join(root, relative))) visit(relative);
  }
  return [...files.values()].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
// ZIP32, stored entries, fixed 1980 timestamp, UTF-8 names. No ZIP64 or compression.
function zip(files) {
  if (files.length > 65535) throw Error('ZIP32 entry limit exceeded');
  const locals = [],
    centrals = [];
  let offset = 0,
    centralSize = 0;
  for (const file of files) {
    const name = Buffer.from(file.name),
      size = file.bytes.length,
      crc = crc32(file.bytes);
    if (name.length > 65535 || size > 0xffffffff || offset + 30 + name.length + size > 0xffffffff)
      throw Error('ZIP32 size limit exceeded');
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x800, 6);
    local.writeUInt16LE(33, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(size, 18);
    local.writeUInt32LE(size, 22);
    local.writeUInt16LE(name.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50);
    central.writeUInt16LE(0x314, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x800, 8);
    central.writeUInt16LE(33, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(size, 20);
    central.writeUInt32LE(size, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(((0o100000 | file.mode) << 16) >>> 0, 38);
    central.writeUInt32LE(offset, 42);
    locals.push(local, name, file.bytes);
    centrals.push(central, name);
    offset += 30 + name.length + size;
    centralSize += 46 + name.length;
  }
  if (offset + centralSize > 0xffffffff) throw Error('ZIP32 archive limit exceeded');
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, ...centrals, end]);
}
function tar(files) {
  const chunks = [];
  function octal(header, value, start, length) {
    const encoded = value.toString(8);
    if (encoded.length > length - 1) throw Error('TAR numeric limit exceeded');
    header.write(encoded.padStart(length - 1, '0') + '\0', start, length, 'ascii');
  }
  for (const file of files) {
    const full = `package/${file.name}`;
    let name = full,
      prefix = '';
    if (Buffer.byteLength(name) > 100) {
      const at = full.lastIndexOf('/');
      prefix = full.slice(0, at);
      name = full.slice(at + 1);
    }
    if (Buffer.byteLength(name) > 100 || Buffer.byteLength(prefix) > 155)
      throw Error(`TAR path too long: ${full}`);
    const header = Buffer.alloc(512);
    header.write(name, 0, 100, 'utf8');
    octal(header, file.mode, 100, 8);
    octal(header, 0, 108, 8);
    octal(header, 0, 116, 8);
    octal(header, file.bytes.length, 124, 12);
    octal(header, 0, 136, 12);
    header.fill(32, 148, 156);
    header.write('0', 156);
    header.write('ustar\0', 257, 6, 'ascii');
    header.write('00', 263);
    header.write(prefix, 345, 155, 'utf8');
    const checksum = header.reduce((sum, byte) => sum + byte, 0);
    header.write(checksum.toString(8).padStart(6, '0') + '\0 ', 148, 8, 'ascii');
    chunks.push(header, file.bytes, Buffer.alloc((512 - (file.bytes.length % 512)) % 512));
  }
  return Buffer.concat([...chunks, Buffer.alloc(1024)]);
}

export function buildRelease({
  root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
  output = path.join(root, 'dist'),
} = {}) {
  root = path.resolve(root);
  verifyTemplateBundle(path.join(root, 'skills/flowkit'));
  output = path.resolve(output);
  plainPath(root);
  plainPath(output);
  plainPath(path.join(root, 'release-files.json'));
  const files = collect(root),
    byName = new Map(files.map((file) => [file.name, file]));
  const json = (name) => {
    const file = byName.get(name);
    if (!file) throw Error(`Missing release metadata ${name}`);
    return JSON.parse(file.bytes.toString('utf8'));
  };
  const pkg = json('package.json'),
    version = pkg.version;
  if (
    !/^[0-9]+\.[0-9]+\.[0-9]+(?:-[A-Za-z0-9.-]+)?$/.test(version) ||
    !/^[@a-z0-9][@a-z0-9._/-]*$/.test(pkg.name) ||
    pkg.name.includes('..')
  )
    throw Error('Invalid package name or version');
  if (!byName.has('skills/flowkit/LICENSE')) throw Error('Self-contained skill requires LICENSE');
  for (const name of [
    'plugin.json',
    'skills/flowkit/version.json',
    '.claude-plugin/plugin.json',
    '.codex-plugin/plugin.json',
  ]) {
    if (name.startsWith('.') && !byName.has(name)) continue;
    if (json(name).version !== version) throw Error(`Release version mismatch: ${name}`);
  }
  const archiveName = pkg.name.replace(/^@/, '').replaceAll('/', '-');
  const archives = [
    { name: `flowkit-${version}.zip`, bytes: zip(files) },
    { name: `${archiveName}-${version}.tgz`, bytes: gzipSync(tar(files), { level: 9 }) },
  ];
  const metadata = {
    schema: 1,
    package: pkg.name,
    version,
    files: Object.fromEntries(files.map((file) => [file.name, sha256(file.bytes)])),
    artifacts: archives.map(({ name, bytes }) => ({
      name,
      sha256: sha256(bytes),
      bytes: bytes.length,
    })),
  };
  const release = Buffer.from(JSON.stringify(metadata, null, 2) + '\n');
  // Validate and construct all payloads before creating output. Never remove older releases.
  const outputs = [
    ...archives,
    { name: 'release.json', bytes: release },
    {
      name: 'SHA256SUMS',
      bytes: Buffer.from(
        [...archives, { name: 'release.json', bytes: release }]
          .map(({ name, bytes }) => `${sha256(bytes)}  ${name}`)
          .join('\n') + '\n',
      ),
    },
  ];
  for (const artifact of outputs) {
    const target = path.join(output, artifact.name);
    plainPath(target);
    if (fs.existsSync(target) && !fs.lstatSync(target).isFile())
      throw Error(`Output must be a regular file: ${target}`);
    if (
      archives.includes(artifact) &&
      fs.existsSync(target) &&
      !fs.readFileSync(target).equals(artifact.bytes)
    ) {
      throw Error(`Versioned artifact already exists with different contents: ${target}`);
    }
  }
  fs.mkdirSync(output, { recursive: true });
  for (const artifact of outputs) {
    fs.writeFileSync(path.join(output, artifact.name), artifact.bytes);
  }
  return metadata;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = buildRelease();
    console.log(
      `Packaged ${result.package} ${result.version}: ${result.artifacts.map((a) => a.name).join(', ')}`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

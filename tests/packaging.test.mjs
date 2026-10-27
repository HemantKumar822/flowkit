import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildRelease } from '../scripts/package.mjs';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function fixture() {
  const base = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'flowkit-package-')),
    root = path.join(base, 'source');
  fs.mkdirSync(root);
  for (const name of ['bin', 'skills'])
    fs.cpSync(path.join(repository, name), path.join(root, name), { recursive: true });
  const version = JSON.parse(
    fs.readFileSync(path.join(root, 'skills/flowkit/version.json'), 'utf8'),
  ).version;
  for (const name of [
    'README.md',
    'LICENSE',
    'THIRD_PARTY_NOTICES.md',
    'CHANGELOG.md',
    'CONTRIBUTING.md',
    'SECURITY.md',
  ])
    fs.writeFileSync(path.join(root, name), name);
  fs.writeFileSync(path.join(root, 'skills/flowkit/LICENSE'), 'Fixture license');
  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify({
      name: 'flowkit-codex',
      version,
      type: 'module',
      private: true,
      bin: { flowkit: 'bin/flowkit.mjs' },
    }),
  );
  fs.writeFileSync(path.join(root, 'plugin.json'), JSON.stringify({ name: 'flowkit', version }));
  fs.copyFileSync(
    path.join(repository, 'release-files.json'),
    path.join(root, 'release-files.json'),
  );
  fs.mkdirSync(path.join(root, 'docs/private'), { recursive: true });
  fs.writeFileSync(path.join(root, 'docs/private/token.txt'), 'must not ship');
  return { base, root, output: path.join(base, 'dist'), version };
}
function zipNames(bytes) {
  const names = [];
  let at = 0;
  while (bytes.readUInt32LE(at) === 0x04034b50) {
    const size = bytes.readUInt32LE(at + 18),
      length = bytes.readUInt16LE(at + 26),
      extra = bytes.readUInt16LE(at + 28);
    names.push(bytes.subarray(at + 30, at + 30 + length).toString('utf8'));
    at += 30 + length + extra + size;
  }
  assert.equal(bytes.readUInt32LE(at), 0x02014b50);
  return names;
}
function command(command, args, cwd) {
  const r = spawnSync(command, args, { cwd, encoding: 'utf8', windowsHide: true, timeout: 30_000 });
  assert.equal(r.status, 0, r.stderr || r.error?.message);
  return r.stdout;
}
test('release payloads are versioned, deterministic, allowlisted and hash-bound', () => {
  const f = fixture(),
    result = buildRelease(f),
    release = JSON.parse(fs.readFileSync(path.join(f.output, 'release.json'), 'utf8'));
  assert.equal(release.version, f.version);
  assert.equal(release.package, 'flowkit-codex');
  const names = zipNames(fs.readFileSync(path.join(f.output, `flowkit-${f.version}.zip`)));
  assert.ok(names.includes('LICENSE'));
  assert.ok(names.includes('skills/flowkit/LICENSE'));
  assert.ok(names.includes('skills/flowkit/SKILL.md'));
  assert.ok(names.includes('skills/flowkit/third-party/sources.json'));
  for (const upstream of ['bmad', 'superpowers', 'gstack']) {
    assert.ok(names.includes(`skills/flowkit/third-party/${upstream}/LICENSE`));
  }
  assert.ok(
    !names.some((n) => n.startsWith('package/') || n.includes('private') || n.startsWith('tests/')),
  );
  assert.deepEqual(names, Object.keys(release.files));
  for (const artifact of release.artifacts) {
    const sum = crypto
      .createHash('sha256')
      .update(fs.readFileSync(path.join(f.output, artifact.name)))
      .digest('hex');
    assert.equal(sum, artifact.sha256);
  }
  const hashes = fs.readFileSync(path.join(f.output, 'SHA256SUMS'), 'utf8');
  assert.ok(hashes.includes('release.json'));
  const before = fs.readFileSync(path.join(f.output, `flowkit-${f.version}.zip`));
  buildRelease(f);
  assert.deepEqual(fs.readFileSync(path.join(f.output, `flowkit-${f.version}.zip`)), before);
  assert.equal(result.version, f.version);
});
test('a versioned release cannot silently replace different previously built bytes', () => {
  const f = fixture();
  buildRelease(f);
  const archive = path.join(f.output, `flowkit-${f.version}.zip`);
  const before = fs.readFileSync(archive);
  const inventory = fs.readFileSync(path.join(f.output, 'release.json'));
  fs.appendFileSync(path.join(f.root, 'README.md'), '\nDifferent release content');
  assert.throws(() => buildRelease(f), /already exists|different|version/i);
  assert.deepEqual(fs.readFileSync(archive), before);
  assert.deepEqual(fs.readFileSync(path.join(f.output, 'release.json')), inventory);
});

test('npm tarball extracts and its real CLI installs, repeats and removes in isolated paths', () => {
  const f = fixture();
  buildRelease(f);
  const extracted = path.join(f.base, 'extract');
  fs.mkdirSync(extracted);
  command(
    'tar',
    ['-xzf', path.join(f.output, `flowkit-codex-${f.version}.tgz`), '-C', extracted],
    f.base,
  );
  const packed = path.join(extracted, 'package'),
    cli = path.join(packed, 'bin/flowkit.mjs'),
    options = [
      '--skills-dir',
      path.join(f.base, 'home', 'skills'),
      '--backup-root',
      path.join(f.base, 'home', 'backups'),
    ];
  assert.equal(JSON.parse(command(process.execPath, [cli, 'help'], f.base)).version, f.version);
  assert.equal(JSON.parse(command(process.execPath, [cli, 'templates'], f.base)).length, 5);
  assert.match(command(process.execPath, [cli, 'template', 'brief'], f.base), /BMAD Method/);
  assert.equal(
    JSON.parse(command(process.execPath, [cli, 'install', ...options], f.base)).changed,
    true,
  );
  assert.equal(
    JSON.parse(command(process.execPath, [cli, 'install', ...options], f.base)).changed,
    false,
  );
  const removed = JSON.parse(command(process.execPath, [cli, 'uninstall', ...options], f.base));
  assert.equal(removed.changed, true);
  assert.ok(fs.existsSync(path.join(removed.backup, 'SKILL.md')));
  const backupCli = path.join(removed.backup, 'scripts/flowkit.mjs');
  assert.equal(
    JSON.parse(command(process.execPath, [backupCli, 'install', ...options], f.base)).changed,
    true,
  );
  assert.equal(
    JSON.parse(command(process.execPath, [cli, 'uninstall', ...options], f.base)).changed,
    true,
  );
});
test('release refuses traversal, source links and mismatched versions before output', () => {
  const f = fixture();
  fs.writeFileSync(
    path.join(f.root, 'release-files.json'),
    JSON.stringify({ required: ['../outside'], optional: [] }),
  );
  assert.throws(() => buildRelease(f), /path|allowlist/i);
  const g = fixture();
  fs.symlinkSync(path.join(g.root, 'docs'), path.join(g.root, 'assets'), 'junction');
  assert.throws(() => buildRelease(g), /link|regular/i);
  assert.ok(!fs.existsSync(g.output));
  const h = fixture();
  fs.writeFileSync(path.join(h.root, 'plugin.json'), '{}');
  assert.throws(() => buildRelease(h), /version/i);
});

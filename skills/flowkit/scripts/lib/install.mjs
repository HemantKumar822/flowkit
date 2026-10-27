import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { hash, readJSON, atomicJSON, assertPlainPath, now } from './common.mjs';
const marker = '.flowkit-install.json';
export function tree(root) {
  assertPlainPath(root);
  const result = {};
  function walk(dir) {
    for (const e of fs
      .readdirSync(dir, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name))) {
      const file = path.join(dir, e.name),
        rel = path.relative(root, file).split(path.sep).join('/');
      if (rel === marker) continue;
      assertPlainPath(file);
      if (e.isDirectory()) {
        result[rel + '/'] = 'directory';
        walk(file);
      } else if (e.isFile()) result[rel] = hash(fs.readFileSync(file));
      else throw Error('Unsupported install file');
    }
  }
  walk(root);
  return result;
}
function validate(target) {
  const file = path.join(target, marker);
  assertPlainPath(file);
  if (!fs.existsSync(file)) throw Error('Missing owned installation manifest');
  const m = readJSON(file);
  if (m.owner !== 'flowkit' || m.schema !== 1) throw Error('Not an owned FlowKit manifest');
  if (JSON.stringify(tree(target)) !== JSON.stringify(m.files))
    throw Error('Installation modified; preserve edits before update/removal');
  return m;
}
function paths(target, backupRoot) {
  target = path.resolve(target);
  backupRoot = path.resolve(backupRoot || path.join(os.homedir(), '.codex', 'flowkit', 'backups'));
  if (path.basename(target) !== 'flowkit')
    throw Error('Managed target directory must be named flowkit');
  if (backupRoot === target || backupRoot.startsWith(target + path.sep))
    throw Error('Backups must be outside target');
  assertPlainPath(target);
  assertPlainPath(backupRoot);
  return { target, backupRoot };
}
function locked(target, fn) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const file = path.join(path.dirname(target), '.flowkit-install.lock');
  assertPlainPath(file);
  let fd;
  try {
    try {
      fd = fs.openSync(file, 'wx');
    } catch (e) {
      if (e.code === 'EEXIST') throw Error('Installation lock exists');
      throw e;
    }
    return fn();
  } finally {
    if (fd !== undefined) {
      fs.closeSync(fd);
      fs.unlinkSync(file);
    }
  }
}
function backupName(root) {
  fs.mkdirSync(root, { recursive: true });
  return path.join(root, `${now().replace(/[:.]/g, '-')}-${crypto.randomUUID().slice(0, 8)}`);
}
export function install(source, target, options = {}) {
  source = path.resolve(source);
  ({ target } = paths(target, options.backupRoot));
  const { backupRoot } = paths(target, options.backupRoot);
  if (
    source === target ||
    source.startsWith(target + path.sep) ||
    target.startsWith(source + path.sep)
  )
    throw Error('Source and target must be independent');
  const files = tree(source);
  if (!files['SKILL.md']) throw Error('Source requires SKILL.md');
  return locked(target, () => {
    let previous;
    if (fs.existsSync(target)) {
      previous = validate(target);
      if (JSON.stringify(previous.files) === JSON.stringify(files))
        return { changed: false, target };
      if (!options.update) throw Error('Different version: explicitly pass --update after review');
    }
    const stage = path.join(path.dirname(target), `.flowkit-stage-${crypto.randomUUID()}`);
    fs.cpSync(source, stage, { recursive: true, errorOnExist: true, force: false });
    atomicJSON(path.join(stage, marker), {
      schema: 1,
      owner: 'flowkit',
      installedAt: now(),
      files,
    });
    if (JSON.stringify(tree(stage)) !== JSON.stringify(files))
      throw Error(`Staging mismatch. Preserve staging path ${stage}`);
    let backup;
    if (previous) {
      backup = backupName(backupRoot);
      fs.renameSync(target, backup);
    }
    try {
      fs.renameSync(stage, target);
    } catch (e) {
      if (backup && !fs.existsSync(target)) fs.renameSync(backup, target);
      throw e;
    }
    return { changed: true, target, backup: backup || null };
  });
}
export function uninstall(target, options = {}) {
  const checked = paths(target, options.backupRoot);
  target = checked.target;
  return locked(target, () => {
    if (!fs.existsSync(target)) return { changed: false, target };
    validate(target);
    const backup = backupName(checked.backupRoot);
    fs.renameSync(target, backup);
    return { changed: true, target, backup };
  });
}

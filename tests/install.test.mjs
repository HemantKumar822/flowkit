import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { install, uninstall } from '../skills/flowkit/scripts/lib/install.mjs';
function fixture() {
  const root = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'flowkit-install-'));
  const source = path.join(root, 'source');
  fs.mkdirSync(source);
  fs.writeFileSync(path.join(source, 'SKILL.md'), 'v1');
  return {
    root,
    source,
    target: path.join(root, 'skills', 'flowkit'),
    backupRoot: path.join(root, 'backups'),
  };
}
test('repeat install no-op; uninstall preserves neighbors and backup', () => {
  const f = fixture();
  install(f.source, f.target, f);
  const neighbor = path.join(f.root, 'skills', 'superpowers');
  fs.mkdirSync(neighbor);
  fs.writeFileSync(path.join(neighbor, 'x'), 'keep');
  assert.equal(install(f.source, f.target, f).changed, false);
  const r = uninstall(f.target, f);
  assert.ok(fs.existsSync(r.backup));
  assert.equal(fs.existsSync(f.target), false);
  assert.equal(fs.readFileSync(path.join(neighbor, 'x'), 'utf8'), 'keep');
});
test('edited or foreign install blocks mutation', () => {
  const f = fixture();
  fs.mkdirSync(f.target, { recursive: true });
  fs.writeFileSync(path.join(f.target, 'SKILL.md'), 'foreign');
  assert.throws(() => install(f.source, f.target, f), /owned|manifest/i);
  assert.throws(() => uninstall(f.target, f), /owned|manifest/i);
  const g = fixture();
  install(g.source, g.target, g);
  fs.writeFileSync(path.join(g.target, 'SKILL.md'), 'edited');
  assert.throws(() => uninstall(g.target, g), /modified/i);
  assert.throws(() => install(g.source, g.target, { ...g, update: true }), /modified/i);
});
test('explicit update backs up prior version, rejects unexpected extra files', () => {
  const f = fixture();
  install(f.source, f.target, f);
  fs.writeFileSync(path.join(f.source, 'SKILL.md'), 'v2');
  assert.throws(() => install(f.source, f.target, f), /update/i);
  const result = install(f.source, f.target, { ...f, update: true });
  assert.equal(fs.readFileSync(path.join(result.backup, 'SKILL.md'), 'utf8'), 'v1');
  assert.equal(fs.readFileSync(path.join(f.target, 'SKILL.md'), 'utf8'), 'v2');
  fs.writeFileSync(path.join(f.target, 'personal.txt'), 'keep');
  assert.throws(() => uninstall(f.target, f), /modified/i);
});
test('linked source and target paths refused without touching real files', () => {
  const f = fixture();
  const real = path.join(f.root, 'real');
  fs.mkdirSync(real);
  fs.writeFileSync(path.join(real, 'personal'), 'keep');
  fs.mkdirSync(path.dirname(f.target), { recursive: true });
  fs.symlinkSync(real, f.target, 'junction');
  assert.throws(() => install(f.source, f.target, f), /link|reparse/i);
  assert.throws(() => uninstall(f.target, f), /link|reparse/i);
  assert.equal(fs.readFileSync(path.join(real, 'personal'), 'utf8'), 'keep');
});
test('linked ownership manifest blocks uninstall without moving the installation', () => {
  const f = fixture();
  install(f.source, f.target, f);
  const marker = path.join(f.target, '.flowkit-install.json'),
    external = path.join(f.root, 'manifest.json');
  fs.renameSync(marker, external);
  fs.symlinkSync(external, marker, 'file');
  assert.throws(() => uninstall(f.target, f), /link|reparse/i);
  assert.ok(fs.existsSync(f.target));
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  initProject,
  readProject,
  addTask,
  moveTask,
  configureCheck,
  setGoal,
} from '../skills/flowkit/scripts/lib/project.mjs';
import { verify, releaseStatus, fingerprint } from '../skills/flowkit/scripts/lib/verify.mjs';
const setup = () => {
  const r = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'flowkit-verify-'));
  initProject(r);
  return r;
};

test('verification preserves literal whitespace and empty process arguments', () => {
  const root = setup(),
    script =
      "const a=require('node:assert/strict');a.deepEqual(process.argv.slice(1),['  literal text  ','']);";
  configureCheck(root, {
    name: 'literal-argv',
    argv: [process.execPath, '-e', script, '--', '  literal text  ', ''],
  });
  assert.deepEqual(readProject(root).config.checks[0].argv.slice(-2), ['  literal text  ', '']);
  const evidence = verify(root);
  assert.equal(evidence.passed, true, evidence.checks[0]?.output);
  assert.throws(
    () => configureCheck(root, { name: 'nul', argv: [process.execPath, 'bad\0value'] }),
    /argv/i,
  );
});
test('missing checks cannot count as passed', () => {
  const r = setup();
  assert.equal(verify(r).passed, false);
  assert.equal(releaseStatus(r).ready, false);
});
test('real commands record success, fail and timeout with exit information', () => {
  const r = setup();
  configureCheck(r, { name: 'pass', argv: [process.execPath, '-e', 'process.exit(0)'] });
  assert.equal(verify(r).passed, true);
  configureCheck(r, { name: 'fail', argv: [process.execPath, '-e', 'process.exit(7)'] });
  const v = verify(r);
  assert.equal(v.passed, false);
  assert.equal(v.checks.find((c) => c.name === 'fail').exitCode, 7);
  configureCheck(r, {
    name: 'slow',
    argv: [process.execPath, '-e', 'setTimeout(()=>{},10000)'],
    timeoutMs: 100,
  });
  assert.equal(verify(r).checks.find((c) => c.name === 'slow').timedOut, true);
});
test('completion rejects stale source and config evidence, then accepts current evidence', () => {
  const r = setup();
  fs.writeFileSync(path.join(r, 'app.js'), 'original');
  configureCheck(r, { name: 'test', argv: [process.execPath, '-e', 'process.exit(0)'] });
  const t = addTask(r, { title: 'feature', acceptance: ['observable outcome'] });
  for (const s of ['ready', 'in_progress', 'review', 'qa']) moveTask(r, t.id, s);
  verify(r);
  fs.writeFileSync(path.join(r, 'app.js'), 'changed');
  assert.throws(() => moveTask(r, t.id, 'done'), /stale/i);
  verify(r);
  configureCheck(r, { name: 'other', argv: [process.execPath, '-e', 'process.exit(0)'] });
  assert.throws(() => moveTask(r, t.id, 'done'), /stale/i);
  verify(r);
  moveTask(r, t.id, 'done');
  assert.equal(readProject(r).state.tasks[0].status, 'done');
});
test('unsafe argv and timeouts rejected; source changes during checks cannot pass', () => {
  const r = setup();
  assert.throws(() => configureCheck(r, { name: 'bad', argv: 'echo ok' }), /argv/i);
  assert.throws(
    () => configureCheck(r, { name: 'bad', argv: ['node'], timeoutMs: -1 }),
    /timeout/i,
  );
  configureCheck(r, {
    name: 'mutator',
    argv: [process.execPath, '-e', "require('fs').writeFileSync('changed.txt','x')"],
  });
  assert.equal(verify(r).passed, false);
});
test('fingerprint includes ignored source/config and excludes operational evidence', () => {
  const r = setup();
  const a = fingerprint(r);
  fs.writeFileSync(path.join(r, '.flowkit', 'note.txt'), 'note');
  assert.equal(fingerprint(r), a);
  fs.writeFileSync(path.join(r, 'source.txt'), 'new');
  assert.notEqual(fingerprint(r), a);
});
test('nested build source changes invalidate evidence; excluded roots remain deliberate', () => {
  const r = setup();
  fs.mkdirSync(path.join(r, 'src', 'build'), { recursive: true });
  const f = path.join(r, 'src', 'build', 'module.js');
  fs.writeFileSync(f, 'v1');
  const a = fingerprint(r);
  fs.writeFileSync(f, 'v2');
  assert.notEqual(fingerprint(r), a);
});
test('source links fail closed, including links introduced after successful verification', () => {
  const r = setup(),
    other = setup();
  configureCheck(r, { name: 'test', argv: [process.execPath, '-e', 'process.exit(0)'] });
  verify(r);
  fs.symlinkSync(other, path.join(r, 'src-link'), 'junction');
  assert.throws(() => fingerprint(r), /link/i);
  assert.throws(() => verify(r), /link/i);
});
test('changing the project goal invalidates old acceptance scope', () => {
  const r = setup();
  configureCheck(r, { name: 'test', argv: [process.execPath, '-e', 'process.exit(0)'] });
  setGoal(r, 'MVP');
  verify(r);
  setGoal(r, 'Production authorization');
  assert.equal(releaseStatus(r).current, false);
});

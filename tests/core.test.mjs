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
  mutate,
  setGoal,
} from '../skills/flowkit/scripts/lib/project.mjs';
import { route } from '../skills/flowkit/scripts/lib/routing.mjs';
const temp = () => fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'flowkit-core-'));
test('small edits stay quick; uncertainty/security increase depth; release wins', () => {
  assert.equal(route('Fix typo in button label').mode, 'QUICK');
  assert.equal(route('Add backend endpoint').mode, 'STANDARD');
  assert.equal(route('Start a new application from an unclear idea').mode, 'DEEP');
  assert.equal(route('Tiny change to payment authorization').mode, 'DEEP');
  assert.equal(route('Prepare production release').mode, 'RELEASE');
  assert.equal(route('fix label', { uncertainty: 'high' }).mode, 'DEEP');
  const override = route('change authentication', { mode: 'QUICK' });
  assert.equal(override.mode, 'QUICK');
  assert.ok(override.warnings.length);
  assert.throws(() => route('x', { mode: 'UNKNOWN' }));
});
test('onboarding preserves existing instructions and idempotent state', () => {
  const root = temp();
  fs.writeFileSync(path.join(root, 'AGENTS.md'), 'existing');
  initProject(root, 'team');
  setGoal(root, 'Ship MVP');
  initProject(root, 'solo');
  assert.equal(fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8'), 'existing');
  assert.equal(readProject(root).config.profile, 'team');
  assert.equal(readProject(root).state.goal, 'Ship MVP');
});
test('tasks require acceptance and enforce ready dependencies and transition order', () => {
  const root = temp();
  initProject(root, 'solo');
  assert.throws(() => addTask(root, { title: 'vague' }), /acceptance/i);
  const a = addTask(root, { title: 'API', acceptance: ['returns expected JSON'] });
  const b = addTask(root, { title: 'UI', acceptance: ['renders response'], dependencies: [a.id] });
  assert.throws(() => moveTask(root, b.id, 'in_progress'), /transition|depend/i);
  moveTask(root, b.id, 'ready');
  assert.throws(() => moveTask(root, b.id, 'in_progress'), /depend/i);
  assert.throws(() => moveTask(root, a.id, 'done'), /transition|evidence/i);
  assert.throws(
    () => addTask(root, { title: 'bad', acceptance: ['x'], dependencies: ['missing'] }),
    /depend/i,
  );
  assert.equal(readProject(root).state.tasks.length, 2);
});
test('exclusive mutation lock fails closed without overwriting state', () => {
  const root = temp();
  initProject(root);
  const before = readProject(root).state;
  fs.writeFileSync(path.join(root, '.flowkit', 'write.lock'), 'another writer');
  assert.throws(() => setGoal(root, 'wrong'), /lock/i);
  assert.deepEqual(readProject(root).state, before);
});
test('invalid mutations and callback failure do not damage prior state', () => {
  const root = temp();
  initProject(root);
  const before = readProject(root).state;
  assert.throws(() =>
    mutate(root, (s) => {
      s.goal = 'partial';
      throw Error('failure');
    }),
  );
  assert.deepEqual(readProject(root).state, before);
  assert.throws(() => initProject(temp(), 'nonsense'), /profile/i);
});

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  initProject,
  setGoal,
  addTask,
  moveTask,
  configureCheck,
  readProject,
  record,
} from '../skills/flowkit/scripts/lib/project.mjs';
import { route } from '../skills/flowkit/scripts/lib/routing.mjs';
import { verify, releaseStatus } from '../skills/flowkit/scripts/lib/verify.mjs';
import { install, uninstall } from '../skills/flowkit/scripts/lib/install.mjs';
import { issueDraft, prDraft, applyIssue } from '../skills/flowkit/scripts/lib/github.mjs';
const started = performance.now(),
  root = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'flowkit-evaluation-')),
  results = [];
function trial(name, fn) {
  const t = performance.now();
  const detail = fn();
  results.push({ name, passed: true, elapsedMs: Math.round(performance.now() - t), detail });
}
trial('workflow matrix', () => {
  for (const [request, expected] of [
    ['Fix typo in button label', 'QUICK'],
    ['Add export endpoint', 'STANDARD'],
    ['Start a new application from an unclear idea', 'DEEP'],
    ['Tiny payment permission change', 'DEEP'],
    ['Prepare release', 'RELEASE'],
  ])
    assert.equal(route(request).mode, expected);
  return '5 explicit routing cases; heuristic only, not implicit skill selection';
});
const app = path.join(root, 'app');
trial('onboarding and new Git repository', () => {
  initProject(app, 'hackathon');
  const git = spawnSync('git', ['init', '-b', 'main'], { cwd: app, encoding: 'utf8' });
  assert.equal(git.status, 0, git.stderr);
  setGoal(app, 'Correct integer addition MVP');
  return app;
});
trial('real failure, evidence-based correction, regression check', () => {
  fs.writeFileSync(path.join(app, 'sum.cjs'), 'module.exports=(a,b)=>a-b;\n');
  fs.writeFileSync(
    path.join(app, 'sum.test.cjs'),
    "const {test}=require('node:test');const a=require('node:assert/strict');const sum=require('./sum.cjs');test('sum preserves both operands',()=>a.equal(sum(2,3),5));\n",
  );
  configureCheck(app, { name: 'unit', argv: [process.execPath, '--test', 'sum.test.cjs'] });
  const red = verify(app);
  assert.equal(red.passed, false);
  assert.match(red.checks[0].output, /-1/);
  record(
    app,
    'decisions',
    'Reproduced 2+3 = -1. Implementation subtracts; fix addition operator rather than weakening expected 5.',
  );
  fs.writeFileSync(path.join(app, 'sum.cjs'), 'module.exports=(a,b)=>a+b;\n');
  assert.equal(verify(app).passed, true);
  return {
    redExit: red.checks[0].exitCode,
    greenExit: readProject(app).state.verification.checks[0].exitCode,
  };
});
trial('acceptance task, fresh evidence, interrupted resume and release preparation', () => {
  const task = addTask(app, {
    title: 'Integer addition',
    acceptance: ['2 + 3 returns 5'],
    owner: 'solo',
  });
  for (const next of ['ready', 'in_progress', 'review', 'qa']) moveTask(app, task.id, next);
  verify(app);
  moveTask(app, task.id, 'done');
  assert.equal(releaseStatus(app).ready, true);
  const fresh = spawnSync(
    process.execPath,
    [path.resolve('bin/flowkit.mjs'), 'status', '--project', app],
    { encoding: 'utf8' },
  );
  assert.equal(fresh.status, 0, fresh.stderr);
  assert.equal(JSON.parse(fresh.stdout).state.tasks[0].status, 'done');
  fs.appendFileSync(path.join(app, 'sum.cjs'), '// later source change\n');
  assert.equal(releaseStatus(app).ready, false);
  return 'Fresh process resumes goal/task/checks; later source change revokes readiness';
});
trial('actionable issue and PR drafts without external mutations', () => {
  const d = issueDraft({
    title: 'Add integer addition',
    purpose: 'Correct arithmetic',
    user: 'calculator user',
    want: 'add two integers',
    benefit: 'get a correct total',
    acceptance: ['2 + 3 returns 5'],
    validation: ['node --test sum.test.cjs'],
  });
  assert.equal(applyIssue(d, 'example/private-evaluation').applied, false);
  const pr = prDraft({
    title: 'Implement addition',
    summary: 'Correct subtraction to addition',
    issue: 12,
    validation: ['Unit case 2 + 3 passed'],
    limitations: ['No remote issue or PR was created'],
  });
  return { issueMarker: d.key, prLinksIssue: pr.body.includes('Closes #12'), liveWrite: false };
});
trial('clean skill home install, repeat, uninstall and rollback', () => {
  const source = path.resolve('skills/flowkit'),
    target = path.join(root, 'skills', 'flowkit'),
    backupRoot = path.join(root, 'backups');
  install(source, target, { backupRoot });
  assert.equal(install(source, target, { backupRoot }).changed, false);
  const removed = uninstall(target, { backupRoot });
  assert.equal(fs.existsSync(target), false);
  assert.ok(fs.existsSync(removed.backup));
  install(removed.backup, target, { backupRoot });
  assert.ok(fs.existsSync(path.join(target, 'SKILL.md')));
  return { target, backup: removed.backup, rollback: true };
});
console.log(
  JSON.stringify(
    {
      date: new Date().toISOString(),
      root,
      passed: results.length,
      total: results.length,
      elapsedMs: Math.round(performance.now() - started),
      results,
      limits: [
        'No live GitHub mutations',
        'No deployment',
        'Model implicit activation not measured',
        'Qualitative Superpowers baseline, no productivity claim',
        'This script complements actual app/browser/independent agent trials',
      ],
    },
    null,
    2,
  ),
);

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const script = path.resolve('bin/flowkit.mjs');
const cli = (...args) =>
  spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', timeout: 20000 });
test('CLI initializes and resumes project state between processes', () => {
  const root = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'flowkit-cli-'));
  let r = cli('init', '--project', root, '--profile', 'hackathon', '--new');
  assert.equal(r.status, 0, r.stderr);
  r = cli('goal', 'Ship notes MVP', '--project', root);
  assert.equal(r.status, 0, r.stderr);
  r = cli('status', '--project', root);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(JSON.parse(r.stdout).state.goal, 'Ship notes MVP');
  assert.ok(fs.existsSync(path.join(root, '.git')));
  assert.ok(fs.existsSync(path.join(root, 'README.md')));
});
test('CLI returns nonzero for missing checks and invalid flags', () => {
  const root = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'flowkit-cli-'));
  assert.equal(cli('init', '--project', root).status, 0);
  assert.equal(cli('verify', '--project', root).status, 1);
  assert.equal(cli('route', 'typo', '--surprise').status, 1);
  assert.equal(cli('route', 'tiny payment fix').status, 0);
  assert.equal(JSON.parse(cli('route', 'tiny payment fix').stdout).mode, 'DEEP');
});

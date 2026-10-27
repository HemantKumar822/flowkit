import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { installationTarget, discoverIntegrations } from '../skills/flowkit/scripts/lib/hosts.mjs';

test('host targets are isolated, scopes explicit and legacy paths preserved', () => {
  const home = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'flowkit-hosts-')),
    project = path.join(home, 'project');
  for (const [host, dir] of [
    ['codex', '.agents'],
    ['claude', '.claude'],
    ['cursor', '.cursor'],
  ]) {
    assert.equal(
      installationTarget({ host, home }).target,
      path.join(home, dir, 'skills', 'flowkit'),
    );
    assert.equal(
      installationTarget({ host, home, scope: 'project', project }).target,
      path.join(project, dir, 'skills', 'flowkit'),
    );
  }
  assert.equal(installationTarget({ home }).host, 'codex');
  assert.equal(
    installationTarget({ home, skillsDir: path.join(home, 'custom') }).target,
    path.join(home, 'custom', 'flowkit'),
  );
  assert.throws(() => installationTarget({ host: 'unknown', home }), /host/i);
  assert.throws(() => installationTarget({ host: 'custom', home }), /skills-dir/i);
  assert.throws(() => installationTarget({ scope: 'project', home }), /project/i);
  assert.throws(() => installationTarget({ scope: 'shared', home }), /scope/i);
  assert.throws(
    () => installationTarget({ scope: 'project', skillsDir: home, home, project }),
    /scope|custom/i,
  );
});

test('optional methods are discovered without requiring or installing them', () => {
  const home = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'flowkit-methods-'));
  assert.equal(discoverIntegrations({ home }).find((x) => x.id === 'superpowers').available, false);
  const skill = path.join(
    home,
    '.claude',
    'skills',
    'superpowers',
    'using-superpowers',
    'SKILL.md',
  );
  fs.mkdirSync(path.dirname(skill), { recursive: true });
  fs.writeFileSync(skill, 'present');
  assert.equal(discoverIntegrations({ home }).find((x) => x.id === 'superpowers').available, true);
  assert.equal(discoverIntegrations({ home }).find((x) => x.id === 'superpowers').required, false);
});

test('actual CLI installs only the chosen project host and removes it recoverably', () => {
  const project = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'flowkit-host-cli-'));
  const run = (...args) =>
    spawnSync(process.execPath, [path.resolve('bin/flowkit.mjs'), ...args], {
      encoding: 'utf8',
      timeout: 20000,
    });
  const flags = [
    '--host',
    'claude',
    '--scope',
    'project',
    '--project',
    project,
    '--backup-root',
    path.join(project, 'backups'),
  ];
  let r = run('install', ...flags);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(fs.existsSync(path.join(project, '.claude', 'skills', 'flowkit', 'SKILL.md')));
  assert.equal(fs.existsSync(path.join(project, '.agents')), false);
  assert.equal(fs.existsSync(path.join(project, '.cursor')), false);
  r = run('install', ...flags);
  assert.equal(JSON.parse(r.stdout).changed, false);
  r = run('uninstall', ...flags);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(fs.existsSync(JSON.parse(r.stdout).backup));
  r = run('install', '--host', 'claude', '--scope', 'project');
  assert.notEqual(r.status, 0);
});

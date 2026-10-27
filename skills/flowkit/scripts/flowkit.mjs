#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  initProject,
  readProject,
  addTask,
  moveTask,
  mutate,
  setGoal,
  configureCheck,
  record,
} from './lib/project.mjs';
import { route } from './lib/routing.mjs';
import { verify, releaseStatus } from './lib/verify.mjs';
import { install, uninstall } from './lib/install.mjs';
import { hosts, installationTarget, discoverIntegrations } from './lib/hosts.mjs';
import { listTemplates, readTemplate } from './lib/templates.mjs';
import { issueDraft, applyIssue, prDraft, applyPR, readIssue } from './lib/github.mjs';
import { readJSON, nonempty, now, boundedText } from './lib/common.mjs';
const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = readJSON(path.join(skillRoot, 'version.json')).version;
const bools = new Set(['new', 'update', 'record', 'apply', 'live', 'optional']);
const values = new Set([
  'project',
  'profile',
  'mode',
  'risk',
  'uncertainty',
  'skills-dir',
  'backup-root',
  'file',
  'repo',
  'number',
  'head',
  'base',
  'name',
  'argv-json',
  'timeout',
  'reason',
  'owner',
  'issue',
  'host',
  'scope',
]);
function parse(args) {
  const opts = {},
    positionals = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!a.startsWith('--')) {
      positionals.push(a);
      continue;
    }
    const k = a.slice(2);
    if (bools.has(k)) {
      opts[k] = true;
      continue;
    }
    if (!values.has(k)) throw Error(`Unknown flag --${k}`);
    if (!args[i + 1] || args[i + 1].startsWith('--')) throw Error(`Value required for --${k}`);
    opts[k] = args[++i];
  }
  return { opts, positionals };
}
const print = (x) => process.stdout.write(JSON.stringify(x, null, 2) + '\n');
function git(root, args) {
  const r = spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    shell: false,
    windowsHide: true,
    timeout: 10000,
  });
  return {
    ok: !r.error && r.status === 0,
    output: boundedText(r.stdout || r.stderr || r.error?.message),
  };
}
function scaffold(root) {
  const exists = git(root, ['rev-parse', '--show-toplevel']);
  if (
    exists.ok &&
    path.resolve(exists.output.trim()).toLowerCase() !== path.resolve(root).toLowerCase()
  )
    throw Error('New project is nested inside another Git repository; choose a separate directory');
  const files = {
    'README.md': `# ${path.basename(root)}\n\nDescribe the problem, intended users, setup and verification commands.\n`,
    'CONTRIBUTING.md':
      '# Contributing\n\nChoose a ready issue, agree acceptance criteria and owner, work on a separate branch, run checks, and open a small PR. Review sensitive architecture/security decisions with a human.\n',
    '.gitignore':
      'node_modules/\n.env\n.env.*\n!.env.example\ndist/\ncoverage/\n.flowkit/write.lock\n.flowkit/*.tmp\n',
  };
  for (const [file, body] of Object.entries(files))
    if (!fs.existsSync(path.join(root, file)))
      fs.writeFileSync(path.join(root, file), body, { flag: 'wx' });
  if (!exists.ok) {
    const result = git(root, ['init', '-b', 'main']);
    if (!result.ok) throw Error(result.output);
  }
  return {
    created: true,
    license: 'Choose a license before publishing; none applied automatically',
  };
}
try {
  if (Number(process.versions.node.split('.')[0]) < 22) throw Error('Node.js >=22 required');
  const { opts: o, positionals: p } = parse(process.argv.slice(2)),
    command = p.shift() || 'help',
    root = path.resolve(o.project || process.cwd());
  const input = () => {
    if (!o.file) throw Error('--file is required');
    return readJSON(path.resolve(o.file));
  };
  switch (command) {
    case 'help':
      print({
        version,
        usage: 'node <flowkit-skill>/scripts/flowkit.mjs COMMAND [arguments] [--project PATH]',
        commands: {
          templates: 'List bundled product, architecture and review templates with provenance',
          template: 'NAME (print a template; no files are created or code executed)',
          init: '[--profile solo|team|hackathon|production] [--new]',
          goal: 'TEXT',
          route:
            'REQUEST [--mode QUICK|STANDARD|DEEP|RELEASE] [--risk high] [--uncertainty high] [--record]',
          status: '[--live] (live adds GitHub issue reads)',
          stage:
            'discovery|requirements|architecture|design|backlog|implementation|qa|review|release|maintenance',
          task: 'add --file task.json | move ID STATUS [--reason TEXT]',
          check: '--name NAME --argv-json JSON_ARRAY [--timeout MS] [--optional]',
          verify: 'Run trusted configured checks; failed/unknown exits 1',
          release: 'Engineering readiness; failed/unknown exits 1',
          decision: 'TEXT',
          lesson: 'TEXT',
          capabilities: 'List selectively available tools; no installs',
          github:
            'issue-draft|pr-draft --file INPUT.json | issue --repo owner/name --number N | issue-apply|pr-apply --file DRAFT.json --repo owner/name [--head BRANCH --base BRANCH] [--apply]',
          install:
            '[--host codex|claude|cursor|custom] [--scope user|project --project PATH] [--skills-dir PATH] [--update] [--backup-root PATH]',
          uninstall: 'Same host/scope/path flags as install; preserves backup',
          hosts: 'List installation targets and evidence tiers',
          doctor: 'Local tool and project checks',
        },
        note: 'No model calls, auto-updates, remote repository creation, issue closing, merging or deployment. --apply is an explicit remote write; obtain scoped user authorization first.',
      });
      break;
    case 'init': {
      initProject(root, o.profile || 'solo');
      const created = o.new ? scaffold(root) : null;
      print({ project: root, ...readProject(root), scaffold: created });
      break;
    }
    case 'goal':
      print(setGoal(root, p.join(' ')));
      break;
    case 'stage': {
      const stage = p[0];
      if (
        ![
          'discovery',
          'requirements',
          'architecture',
          'design',
          'backlog',
          'implementation',
          'qa',
          'review',
          'release',
          'maintenance',
        ].includes(stage)
      )
        throw Error('Invalid stage');
      print(
        mutate(root, (s) => {
          s.stage = stage;
          return { stage };
        }),
      );
      break;
    }
    case 'route': {
      const result = route(p.join(' '), o);
      if (o.record)
        mutate(root, (s) => {
          s.workflow = { ...result, request: p.join(' '), at: now() };
        });
      print(result);
      break;
    }
    case 'task':
      if (p[0] === 'add') print(addTask(root, input()));
      else if (p[0] === 'move') print(moveTask(root, p[1], p[2], o.reason));
      else throw Error('task add or move required');
      break;
    case 'check':
      print(
        configureCheck(root, {
          name: o.name,
          argv: JSON.parse(o['argv-json'] || 'null'),
          timeoutMs: o.timeout ? Number(o.timeout) : undefined,
          required: !o.optional,
        }),
      );
      break;
    case 'verify': {
      const result = verify(root);
      print(result);
      if (!result.passed) process.exitCode = 1;
      break;
    }
    case 'release': {
      const result = releaseStatus(root);
      print(result);
      if (!result.ready) process.exitCode = 1;
      break;
    }
    case 'status': {
      const project = readProject(root);
      const ready = project.state.tasks.filter(
        (t) =>
          t.status === 'ready' &&
          t.dependencies.every(
            (d) => project.state.tasks.find((x) => x.id === d)?.status === 'done',
          ),
      );
      const live = [];
      if (o.live)
        for (const task of project.state.tasks) {
          if (task.issue?.repo && task.issue?.number)
            live.push({ task: task.id, issue: readIssue(task.issue.repo, task.issue.number) });
        }
      print({
        ...project,
        ready: ready.map((t) => t.id),
        blocked: project.state.tasks.filter((t) => t.status === 'blocked'),
        git: git(root, ['status', '--short']),
        recentCommits: git(root, ['log', '-5', '--oneline']),
        release: releaseStatus(root),
        liveIssues: live,
        missing: [
          ...(!project.state.goal ? ['goal'] : []),
          ...(!project.config.checks.length ? ['verification commands'] : []),
        ],
      });
      break;
    }
    case 'decision':
      print(record(root, 'decisions', p.join(' ')));
      break;
    case 'lesson':
      print(record(root, 'lessons', p.join(' ')));
      break;
    case 'capabilities': {
      const registry = readJSON(path.join(skillRoot, 'references', 'capabilities.json'));
      print(
        registry.map((c) => ({
          ...c,
          discoveredSkillPaths: (c.skillPaths || [])
            .map((s) => path.join(os.homedir(), s))
            .filter((s) => fs.existsSync(s)),
        })),
      );
      break;
    }
    case 'github': {
      const action = p[0];
      if (action === 'issue-draft') print(issueDraft(input()));
      else if (action === 'pr-draft') print(prDraft(input()));
      else if (action === 'issue') print(readIssue(o.repo, Number(o.number)));
      else if (action === 'issue-apply' || action === 'pr-apply') {
        const operation = () =>
          action === 'issue-apply'
            ? applyIssue(input(), o.repo, { apply: !!o.apply })
            : applyPR(input(), o.repo, { apply: !!o.apply, head: o.head, base: o.base });
        if (o.apply) {
          print(
            mutate(root, (s) => {
              const r = operation();
              s.events.push({ at: now(), type: action, repo: o.repo, result: r });
              return r;
            }),
          );
        } else print(operation());
      } else throw Error('Unknown github action');
      break;
    }
    case 'templates':
      print(listTemplates(skillRoot));
      break;
    case 'template':
      process.stdout.write(readTemplate(skillRoot, p[0]));
      break;
    case 'hosts':
      print(hosts);
      break;
    case 'install':
    case 'uninstall': {
      const target = installationTarget({
        host: o.host,
        scope: o.scope,
        project: o.project,
        skillsDir: o['skills-dir'],
        backupRoot: o['backup-root'],
      });
      const result =
        command === 'install'
          ? install(skillRoot, target.target, { update: !!o.update, backupRoot: target.backupRoot })
          : uninstall(target.target, { backupRoot: target.backupRoot });
      print({ ...result, host: target.host, scope: target.scope, evidence: target.evidence });
      break;
    }
    case 'doctor': {
      const tools = {};
      for (const [tool, args] of [
        ['node', ['--version']],
        ['git', ['--version']],
        ['gh', ['--version']],
        ['codex', ['--version']],
      ]) {
        const r = spawnSync(tool, args, {
          encoding: 'utf8',
          shell: false,
          windowsHide: true,
          timeout: 10000,
        });
        tools[tool] = {
          available: !r.error && r.status === 0,
          version: boundedText(r.stdout?.split('\n')[0] || r.error?.message),
        };
      }
      let project;
      try {
        project = { onboarded: true, release: releaseStatus(root) };
      } catch (e) {
        project = { onboarded: false, detail: e.message };
      }
      print({
        version,
        tools,
        skillRoot,
        project,
        optionalIntegrations: discoverIntegrations({ project: root }),
        hostSupport: hosts,
        codexHome: process.env.CODEX_HOME || path.join(os.homedir(), '.codex'),
        skillHome: path.join(os.homedir(), '.agents', 'skills'),
        notes: [
          'Commands configured in a repository execute trusted code; inspect them first',
          'Windows .cmd/.ps1 commands require an explicit trusted interpreter; prefer node with a script path',
          'CLI MCP inventory can differ from active desktop tool availability',
        ],
      });
      break;
    }
    default:
      throw Error(`Unknown command ${command}`);
  }
} catch (e) {
  process.stderr.write(`FlowKit: ${boundedText(e.message)}\n`);
  process.exitCode = 1;
}

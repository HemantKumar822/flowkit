import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { atomicJSON, readJSON, assertPlainPath, nonempty, strings, now } from './common.mjs';
import { fingerprint } from './verify.mjs';
const transitions = {
  backlog: ['ready', 'blocked'],
  ready: ['in_progress', 'blocked'],
  in_progress: ['review', 'blocked'],
  review: ['in_progress', 'qa', 'blocked'],
  qa: ['in_progress', 'done', 'blocked'],
  blocked: ['ready'],
  done: [],
};
export const projectFile = (root) => path.join(path.resolve(root), '.flowkit', 'project.json');
export function readProject(root) {
  const file = projectFile(root);
  assertPlainPath(file);
  if (!fs.existsSync(file)) throw Error('Not onboarded. Run init first.');
  const p = readJSON(file);
  if (p.schema !== 1) throw Error('Unsupported project schema');
  return p;
}
export function initProject(root, profile = 'solo') {
  if (!['solo', 'team', 'hackathon', 'production'].includes(profile))
    throw Error('Invalid profile');
  root = path.resolve(root);
  assertPlainPath(root);
  fs.mkdirSync(root, { recursive: true });
  const dir = path.dirname(projectFile(root));
  assertPlainPath(dir);
  fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync(projectFile(root))) return readProject(root);
  const p = {
    schema: 1,
    config: {
      profile,
      checks: [],
      fingerprintExclude: [
        'node_modules',
        '.git',
        '.flowkit',
        'dist',
        'build',
        'coverage',
        'test-results',
        'playwright-report',
      ],
      taskAuthority: 'local',
    },
    state: {
      project: path.basename(root),
      goal: '',
      stage: 'discovery',
      tasks: [],
      decisions: [],
      lessons: [],
      workflow: null,
      verification: null,
      events: [],
    },
  };
  const lock = path.join(dir, 'write.lock');
  let fd;
  try {
    fd = fs.openSync(lock, 'wx');
    if (fs.existsSync(projectFile(root))) return readProject(root);
    atomicJSON(projectFile(root), p);
  } finally {
    if (fd !== undefined) {
      fs.closeSync(fd);
      fs.unlinkSync(lock);
    }
  }
  const agents = path.join(root, 'AGENTS.md');
  if (!fs.existsSync(agents))
    fs.writeFileSync(
      agents,
      '# Project guidance\n\nUse `$flowkit` for coordinated engineering. Read `.flowkit/project.json` for current goal, acceptance criteria and evidence. Preserve repository conventions. Run explicitly configured checks before completion. Remote writes and deployment require applicable user authorization.\n',
      { flag: 'wx' },
    );
  return p;
}
export function mutate(root, callback) {
  const file = projectFile(root);
  assertPlainPath(file);
  const lock = path.join(path.dirname(file), 'write.lock');
  let fd;
  try {
    try {
      fd = fs.openSync(lock, 'wx');
    } catch (e) {
      if (e.code === 'EEXIST')
        throw Error(
          'Project write lock exists. Inspect owner and running process before manual recovery.',
        );
      throw e;
    }
    fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, started: now() }));
    const p = readProject(root);
    const result = callback(p.state, p.config);
    p.state.updatedAt = now();
    atomicJSON(file, p);
    return result;
  } finally {
    if (fd !== undefined) {
      fs.closeSync(fd);
      fs.unlinkSync(lock);
    }
  }
}
export function setGoal(root, goal) {
  nonempty(goal, 'goal');
  return mutate(root, (s) => {
    s.goal = goal;
    return s;
  });
}
export function addTask(root, input) {
  const title = nonempty(input.title, 'title'),
    acceptance = strings(input.acceptance, 'acceptance');
  const dependencies = input.dependencies || [];
  if (!Array.isArray(dependencies) || dependencies.some((x) => typeof x !== 'string'))
    throw Error('Invalid dependencies');
  return mutate(root, (s) => {
    for (const id of dependencies)
      if (!s.tasks.some((t) => t.id === id)) throw Error(`Unknown dependency ${id}`);
    const task = {
      id: crypto.randomUUID().slice(0, 8),
      title,
      acceptance,
      dependencies: [...new Set(dependencies)],
      owner: input.owner || null,
      status: 'backlog',
      blocker: null,
      issue: input.issue || null,
      createdAt: now(),
    };
    s.tasks.push(task);
    return task;
  });
}
export function moveTask(root, id, next, reason) {
  return mutate(root, (s) => {
    const task = s.tasks.find((t) => t.id === id);
    if (!task) throw Error('Unknown task');
    if (!transitions[task.status]?.includes(next))
      throw Error(`Invalid transition ${task.status} -> ${next}`);
    if (next === 'blocked') nonempty(reason, 'blocker reason');
    if (
      next === 'in_progress' &&
      task.dependencies.some((dep) => s.tasks.find((t) => t.id === dep)?.status !== 'done')
    )
      throw Error('Dependencies are not done');
    if (next === 'done') {
      if (!s.verification?.passed) throw Error('Successful verification evidence required');
      if (s.verification.fingerprint !== fingerprint(root))
        throw Error('Verification evidence is stale');
    }
    task.status = next;
    task.blocker = next === 'blocked' ? reason : null;
    s.events.push({ at: now(), type: 'task-transition', id, next });
    return task;
  });
}
export function configureCheck(root, check) {
  const name = nonempty(check.name, 'check name');
  if (
    !Array.isArray(check.argv) ||
    !check.argv.length ||
    typeof check.argv[0] !== 'string' ||
    !check.argv[0].trim() ||
    check.argv.some((value) => typeof value !== 'string' || value.includes('\0'))
  )
    throw Error('argv must contain a nonempty executable and literal string arguments without NUL');
  const argv = [...check.argv],
    timeoutMs = check.timeoutMs ?? 120000;
  if (!Number.isInteger(timeoutMs) || timeoutMs < 50 || timeoutMs > 600000)
    throw Error('timeout must be 50..600000ms');
  return mutate(root, (s, c) => {
    c.checks = c.checks.filter((x) => x.name !== name);
    c.checks.push({ name, argv, timeoutMs, required: check.required !== false });
    return c.checks;
  });
}
export function record(root, kind, text) {
  nonempty(text, kind);
  if (!['decisions', 'lessons'].includes(kind)) throw Error('Invalid record kind');
  return mutate(root, (s) => {
    const item = { at: now(), text };
    s[kind].push(item);
    return item;
  });
}

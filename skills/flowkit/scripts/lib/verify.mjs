import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readProject, mutate } from './project.mjs';
import { boundedText, now } from './common.mjs';
export function fingerprint(root) {
  root = path.resolve(root);
  const { config, state } = readProject(root),
    digest = crypto.createHash('sha256');
  digest.update(JSON.stringify(config));
  digest.update(
    JSON.stringify({
      goal: state.goal,
      tasks: state.tasks.map((t) => ({
        id: t.id,
        acceptance: t.acceptance,
        dependencies: t.dependencies,
      })),
    }),
  );
  const skip = new Set(config.fingerprintExclude);
  function walk(dir) {
    for (const ent of fs
      .readdirSync(dir, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name))) {
      const file = path.join(dir, ent.name),
        rel = path.relative(root, file).split(path.sep).join('/');
      if (skip.has(rel) || ent.name === 'node_modules' || ent.name === '.git') continue;
      digest.update(rel + '\0');
      const st = fs.lstatSync(file);
      if (st.isSymbolicLink()) throw Error(`Source link cannot be content-verified: ${rel}`);
      else if (st.isDirectory()) walk(file);
      else if (st.isFile()) {
        digest.update(String(st.mode));
        const fd = fs.openSync(file, 'r');
        try {
          const buffer = Buffer.alloc(65536);
          let size;
          while ((size = fs.readSync(fd, buffer, 0, buffer.length, null)) > 0)
            digest.update(buffer.subarray(0, size));
        } finally {
          fs.closeSync(fd);
        }
      }
    }
  }
  walk(root);
  return digest.digest('hex');
}
export function verify(root) {
  return mutate(root, (state, config) => {
    const before = fingerprint(root),
      started = now(),
      checks = [];
    for (const c of config.checks) {
      const result = spawnSync(c.argv[0], c.argv.slice(1), {
        cwd: path.resolve(root),
        shell: false,
        timeout: c.timeoutMs,
        maxBuffer: 1024 * 1024,
        encoding: 'utf8',
        windowsHide: true,
      });
      checks.push({
        name: c.name,
        argv: c.argv,
        required: c.required,
        exitCode: result.status,
        signal: result.signal,
        timedOut: result.error?.code === 'ETIMEDOUT',
        error: result.error ? boundedText(result.error.message) : null,
        output: boundedText((result.stdout || '') + (result.stderr || '')),
        passed: !result.error && result.status === 0,
      });
    }
    const after = fingerprint(root),
      required = checks.filter((c) => c.required);
    const evidence = {
      started,
      finished: now(),
      fingerprint: after,
      sourceStable: before === after,
      checks,
      passed: required.length > 0 && required.every((c) => c.passed) && before === after,
    };
    state.verification = evidence;
    state.events.push({ at: now(), type: 'verification', passed: evidence.passed });
    return evidence;
  });
}
export function releaseStatus(root) {
  const { state, config } = readProject(root),
    verification = state.verification,
    current = !!verification && verification.fingerprint === fingerprint(root),
    reasons = [];
  if (!verification?.passed || !current) reasons.push('Required checks missing, failed or stale');
  if (!state.tasks.length) reasons.push('No scoped acceptance tasks recorded');
  if (state.tasks.some((t) => t.status !== 'done'))
    reasons.push('Incomplete or blocked tasks remain');
  if (!state.goal) reasons.push('Project goal is missing');
  return {
    ready: reasons.length === 0,
    meaning: 'Engineering evidence ready for human release review; deployment is not authorized',
    current,
    reasons,
    profile: config.profile,
    humanReview: [
      'Critical user journeys',
      'UI at mobile and desktop viewports',
      'Accessibility and security appropriate to risk',
      'Environment and rollback plan',
      'Known limitations and deployment authorization',
    ],
  };
}

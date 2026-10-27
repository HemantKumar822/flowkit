import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { nonempty } from './common.mjs';

export const hosts = [
  {
    id: 'codex',
    directory: '.agents',
    evidence: 'Workflow exercised in Codex; installation behavior tested',
    invocation: '$flowkit',
  },
  {
    id: 'claude',
    directory: '.claude',
    evidence: 'Installation adapter only; host workflow unverified',
    invocation: '/flowkit',
  },
  {
    id: 'cursor',
    directory: '.cursor',
    evidence: 'Installation adapter only; host workflow unverified',
    invocation: 'Ask to use the flowkit skill',
  },
  {
    id: 'custom',
    directory: null,
    evidence: 'Manual skill-directory fallback; host behavior unverified',
    invocation: 'Use host discovery or read SKILL.md explicitly',
  },
];

export function installationTarget(options = {}) {
  const { skillsDir, project } = options,
    home = path.resolve(options.home || os.homedir());
  const host = options.host ?? (skillsDir ? 'custom' : 'codex'),
    scope = options.scope ?? 'user';
  const adapter = hosts.find((x) => x.id === host);
  if (!adapter) throw Error('Unknown host; use codex, claude, cursor or custom');
  if (!['user', 'project'].includes(scope)) throw Error('scope must be user or project');
  if (skillsDir && host !== 'custom')
    throw Error('A custom --skills-dir must use --host custom or omit --host');
  if (host === 'custom' && !skillsDir) throw Error('Custom host requires --skills-dir');
  if (host === 'custom' && scope !== 'user')
    throw Error('Custom skills directory already defines scope; omit --scope project');
  if (scope === 'project' && !project)
    throw Error('Project scope requires explicit --project PATH');
  const parent =
    host === 'custom'
      ? path.resolve(nonempty(skillsDir, 'skills-dir'))
      : path.join(scope === 'project' ? path.resolve(project) : home, adapter.directory, 'skills');
  const backupRoot = path.resolve(
    options.backupRoot ||
      (host === 'codex'
        ? path.join(home, '.codex', 'flowkit', 'backups')
        : path.join(home, '.flowkit', 'backups')),
  );
  return {
    host,
    scope,
    target: path.join(parent, 'flowkit'),
    backupRoot,
    evidence: adapter.evidence,
  };
}

export function discoverIntegrations({ home = os.homedir(), project } = {}) {
  const roots = [home, ...(project ? [project] : [])].flatMap((root) =>
    ['.agents', '.claude', '.cursor', '.codex'].map((dir) => path.join(root, dir, 'skills')),
  );
  return [
    {
      id: 'superpowers',
      names: ['superpowers/using-superpowers', 'using-superpowers'],
      purpose: 'Expanded engineering methods; baseline FlowKit procedure remains available',
    },
    {
      id: 'frontend-design',
      names: ['frontend-design'],
      purpose: 'Specialist visual design guidance',
    },
    { id: 'ui-ux-pro-max', names: ['ui-ux-pro-max'], purpose: 'Targeted interface reference' },
  ].map(({ names, ...item }) => {
    const paths = roots
      .flatMap((root) => names.map((name) => path.join(root, name, 'SKILL.md')))
      .filter((file) => fs.existsSync(file));
    return { ...item, required: false, available: paths.length > 0, paths };
  });
}

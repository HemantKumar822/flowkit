import { spawnSync } from 'node:child_process';
import { hash, nonempty, strings, boundedText } from './common.mjs';
export function gh(args, input) {
  const r = spawnSync('gh', args, {
    input,
    encoding: 'utf8',
    shell: false,
    windowsHide: true,
    timeout: 60000,
    maxBuffer: 8 * 1024 * 1024,
  });
  if (r.error || r.status !== 0)
    throw Error(
      `GitHub failed (mutation outcome may be unknown; inspect remote before retry): ${boundedText(r.error?.message || r.stderr)}`,
    );
  const text = r.stdout.trim();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
function repoName(repo) {
  if (
    !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo) ||
    repo.split('/').some((x) => x === '.' || x === '..' || x.startsWith('-'))
  )
    throw Error('repo must be explicit owner/name');
  return repo;
}
export function issueDraft(input) {
  const title = nonempty(input.title, 'title'),
    purpose = nonempty(input.purpose, 'purpose'),
    acceptance = strings(input.acceptance, 'acceptance'),
    validation = strings(input.validation, 'validation');
  const story = `As a ${nonempty(input.user, 'user')}, I want ${nonempty(input.want, 'want')}, so that ${nonempty(input.benefit, 'benefit')}.`;
  const dependencies = input.dependencies || [];
  if (!Array.isArray(dependencies) || dependencies.some((x) => !Number.isInteger(x) || x < 1))
    throw Error('Dependencies must be issue numbers');
  const key = hash(JSON.stringify({ title, purpose, story, acceptance })).slice(0, 32);
  return {
    schema: 1,
    type: 'issue',
    title,
    key,
    body: `${story}\n\nPurpose: ${purpose}\n\nAcceptance criteria:\n${acceptance.map((x) => '- [ ] ' + x).join('\n')}\n\nDependencies: ${dependencies.length ? dependencies.map((x) => '#' + x).join(', ') : 'None'}\nPriority: ${input.priority || 'normal'}\nOwner: ${input.owner || 'unassigned'}\n\nSuggested validation:\n${validation.map((x) => '- ' + x).join('\n')}\n\n<!-- flowkit:${key} -->`,
  };
}
function draftValid(d, type) {
  if (d.schema !== 1 || d.type !== type) throw Error('Invalid draft schema/type');
  nonempty(d.title, 'title');
  nonempty(d.body, 'body');
}
export function applyIssue(d, repo, { apply = false, transport = gh } = {}) {
  repoName(repo);
  draftValid(d, 'issue');
  if (!/^[a-f0-9]{32}$/.test(d.key) || !d.body.includes(`<!-- flowkit:${d.key} -->`))
    throw Error('Invalid issue identity');
  if (!apply) return { applied: false, repo, draft: d };
  const pages = transport([
    'api',
    `repos/${repo}/issues?state=all&per_page=100`,
    '--paginate',
    '--slurp',
  ]);
  if (!Array.isArray(pages) || !pages.every(Array.isArray))
    throw Error('Unexpected issue list response');
  const existing = pages
    .flat()
    .find((i) => !i.pull_request && i.body?.includes(`<!-- flowkit:${d.key} -->`));
  if (existing)
    return {
      applied: false,
      duplicate: true,
      issue: { number: existing.number, url: existing.html_url, state: existing.state },
    };
  const url = transport(
    ['issue', 'create', '--repo', repo, '--title', d.title, '--body-file', '-'],
    d.body,
  );
  return { applied: true, url };
}
export function readIssue(repo, number, transport = gh) {
  repoName(repo);
  if (!Number.isInteger(Number(number)) || Number(number) < 1) throw Error('Invalid issue number');
  return transport([
    'issue',
    'view',
    String(number),
    '--repo',
    repo,
    '--json',
    'number,title,body,state,url,assignees,labels',
  ]);
}
export function prDraft(input) {
  const title = nonempty(input.title, 'title'),
    summary = nonempty(input.summary, 'summary');
  if (!Number.isInteger(input.issue) || input.issue < 1)
    throw Error('A positive issue number is required');
  const validation = strings(input.validation, 'validation'),
    limitations = strings(input.limitations, 'limitations');
  return {
    schema: 1,
    type: 'pr',
    title,
    body: `${summary}\n\nCloses #${input.issue}\n\nValidation:\n${validation.map((x) => '- ' + x).join('\n')}\n\nLimitations:\n${limitations.map((x) => '- ' + x).join('\n')}`,
  };
}
export function applyPR(d, repo, { apply = false, head, base, transport = gh } = {}) {
  repoName(repo);
  draftValid(d, 'pr');
  for (const v of [head, base])
    if (typeof v !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_./-]*$/.test(v) || v.includes('..'))
      throw Error('Explicit safe head/base branch names required');
  if (!apply) return { applied: false, repo, head, base, draft: d };
  const existing = transport([
    'pr',
    'list',
    '--repo',
    repo,
    '--head',
    head,
    '--base',
    base,
    '--state',
    'all',
    '--json',
    'number,url,state',
  ]);
  if (!Array.isArray(existing)) throw Error('Unexpected PR list response');
  if (existing.length) return { applied: false, duplicate: true, pr: existing[0] };
  return {
    applied: true,
    url: transport(
      [
        'pr',
        'create',
        '--draft',
        '--repo',
        repo,
        '--head',
        head,
        '--base',
        base,
        '--title',
        d.title,
        '--body-file',
        '-',
      ],
      d.body,
    ),
  };
}

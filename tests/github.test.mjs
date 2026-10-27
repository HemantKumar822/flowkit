import { test } from 'node:test';
import assert from 'node:assert/strict';
import { issueDraft, applyIssue, prDraft, applyPR } from '../skills/flowkit/scripts/lib/github.mjs';
const input = {
  title: 'Export notes',
  user: 'researcher',
  want: 'download notes as JSON',
  benefit: 'archive my work',
  purpose: 'Portable data',
  acceptance: ['GET /export returns JSON', 'No other user data is returned'],
  validation: ['API isolation test'],
  dependencies: [],
};
test('actionable issue drafts preserve acceptance, story and stable identity', () => {
  const d = issueDraft(input);
  assert.match(d.body, /As a researcher/);
  assert.match(d.body, /No other user/);
  assert.equal(d.key, issueDraft(input).key);
  assert.throws(() => issueDraft({ ...input, acceptance: [] }), /acceptance/i);
});
test('dry run performs no remote calls; apply deduplicates closed and open issues', () => {
  const d = issueDraft(input);
  let calls = 0;
  const transport = () => {
    calls++;
    return [
      [{ number: 12, body: d.body, html_url: 'https://github.com/o/r/issues/12', state: 'closed' }],
    ];
  };
  assert.equal(applyIssue(d, 'o/r', { transport }).applied, false);
  assert.equal(calls, 0);
  const r = applyIssue(d, 'o/r', { apply: true, transport });
  assert.equal(r.duplicate, true);
  assert.equal(r.issue.number, 12);
  assert.equal(calls, 1);
});
test('remote error propagated; shell characters stay data in body, repo is validated', () => {
  const d = issueDraft({ ...input, title: '$(danger) `literal`' });
  let seen;
  const transport = (args, body) => {
    seen = { args, body };
    if (args[0] === 'api') return [[]];
    return 'https://github.com/o/r/issues/8';
  };
  const r = applyIssue(d, 'o/r', { apply: true, transport });
  assert.equal(r.applied, true);
  assert.ok(seen.args.includes('$(danger) `literal`'));
  assert.match(seen.body, /flowkit:/);
  assert.throws(() => applyIssue(d, '--bad', { apply: true, transport }), /repo/i);
  assert.throws(
    () =>
      applyIssue(d, 'o/r', {
        apply: true,
        transport: () => {
          throw Error('network failed');
        },
      }),
    /network/,
  );
});
test('PR requires acceptance/check evidence and explicit apply', () => {
  assert.throws(() => prDraft({ title: 'x' }), /issue|summary/i);
  const d = prDraft({
    title: 'Export notes',
    summary: 'Add isolated JSON export',
    issue: 12,
    validation: ['node --test: 4 pass'],
    limitations: ['Browser download not exercised'],
  });
  assert.match(d.body, /Closes #12/);
  assert.match(d.body, /not exercised/);
  assert.equal(applyPR(d, 'o/r', { head: 'feat/export', base: 'main' }).applied, false);
});

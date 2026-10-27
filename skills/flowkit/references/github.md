# GitHub workflow

Use the connected GitHub plugin when sufficient; use Git/gh for local branches and repeatable CLI operations. Authentication does not authorize arbitrary remote writes. Before applying a draft, obtain the user's target repository and authorization for the concrete operation if not already supplied. Never publicly publish, change visibility, merge or deploy on inferred authorization.

For significant product work, capture intended users/problem, useful MVP, prioritized stories and acceptance. Avoid vague placeholder issues. Input for `github issue-draft --file story.json`:

```json
{"title":"Export personal notes","user":"researcher","want":"download my notes as JSON","benefit":"keep a portable archive","purpose":"User-owned data export","acceptance":["Export contains only current user's notes","Empty exports return an empty array"],"validation":["API authorization/isolation tests"],"dependencies":[],"priority":"normal"}
```

Save the resulting JSON as a reviewable draft. `github issue-apply --file draft.json --repo owner/repo` is dry-run; `--apply` performs the write. It scans open and closed issues for the stable marker before creation. An edited requirement creates a different identity; search related issues before approving it. Concurrent writers outside the project lock can still race: GitHub has no transactional create-if-absent here. On timeout inspect the remote before retrying; never loop blind writes. Large repositories can exceed the bounded response buffer; report failure and use a scoped connector query.

Use `github issue --repo owner/repo --number 12` to read requirements. Add local execution task from an inspected issue with `issue: {"repo":"owner/repo","number":12}`. Use `status --live` for current remote state. Local `done` means local execution checks passed, not merged/closed on GitHub. Do not manually mirror Projects columns without reliable synchronization.

Choose ready work only when dependencies are satisfied. Start a separate branch/worktree, implement the smallest complete change, verify, independently review important work, and create a draft PR. `github pr-draft` accepts title, summary, positive issue number, validation array and limitations array. `pr-apply` needs explicit repo/head/base; dry-run until `--apply`. The CLI does not push branches or prove draft validation text: review evidence and push only within user authorization. Link returned PRs to the current Codex chat with the app attachment tool when available.

Use native Git/GitHub tools for milestones, assignees, labels, Projects, CI inspection, pushing and issue closing; those are not automated by FlowKit 0.2. Require real acceptance and merge evidence before closing. Keep owner and dependencies visible for teams up to four people. Unknown owner stays unassigned.

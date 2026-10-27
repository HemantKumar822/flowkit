# Work with FlowKit

FlowKit is one invocable coordinator with focused references and a bundled CLI. It uses existing skills when available and a self-contained baseline when they are absent. You do not need to choose a long roster of personas before starting.

## Start with an outcome

```text
$flowkit add CSV export to this app. Follow its existing conventions.
Agree observable acceptance criteria and verify the finished behavior.
```

The agent inspects project instructions, code, Git status, available tools and saved state before choosing a mode. It should explain that choice briefly.

The bundled product and review procedures are self-contained. Use `node bin/flowkit.mjs templates` to list them, or `node bin/flowkit.mjs template brief` to read one. They are starting structures for evidence-based documents, not pre-filled requirements or automatic acceptance. Upstream license credits remain in the package; users invoke FlowKit rather than install each source framework.

| Mode | Appropriate work | Expected depth |
| --- | --- | --- |
| QUICK | A clear, low-risk edit | Inspect, change, verify |
| STANDARD | A bounded feature or bug | Acceptance, implementation, testing and review |
| DEEP | Significant uncertainty, migration or trust boundary | Research, requirements, architecture/design, tasks and delivery |
| RELEASE | Demo/release preparation | Fresh checks, user journeys, risk review and handoff |

Risk and uncertainty matter more than file count. Ask for a different mode when useful; necessary correctness and security checks still apply. The CLI's English keyword routing is advisory, not an intelligent classifier.

## Keep a small project memory

Ask the agent to onboard the project, or run from a source/release root:

```sh
node bin/flowkit.mjs init --project PATH_TO_PROJECT --profile solo
node bin/flowkit.mjs goal "Export current user's notes as CSV" --project PATH_TO_PROJECT
node bin/flowkit.mjs status --project PATH_TO_PROJECT
```

Profiles are `solo`, `team`, `hackathon` and `production`; they provide context rather than silently installing a stack. Add `--new` only when scaffolding a new project: it creates missing basic files and initializes Git, without creating a remote repository or choosing that application's license.

The `.flowkit/project.json` envelope stores goal, stage, tasks, dependencies, owners, acceptance criteria, decisions, lessons and verification results. Commit it for shared continuity after reviewing it for sensitive output. Ignore `.flowkit/write.lock` and temporary files. Existing project instructions remain authoritative.

Meaningful work can move through `backlog → ready → in_progress → review → qa → done`, with blockers and dependency checks. A tiny edit does not need a fabricated backlog. CLI completion gates require current successful configured checks; the agent must still inspect actual acceptance behavior.

## Documents are part of the work

The agent creates or updates the documents needed for the chosen scope: a brief and requirements for an unclear product, architecture/decision notes for consequential choices, a plan for multi-step work, and QA/release/handoff evidence when relevant. Existing project locations take priority. A QUICK edit should not produce a full document set.

This is agent-authored documentation guided by the workflow, not a CLI that automatically generates a complete PRD or architecture. The CLI's new-project scaffolding is limited to basic repository files. Review documents against implemented behavior rather than treating their existence as completion.

The saved project state is persistent working memory, not the entire chat. There is no automatic cross-project learning, vector database or model training. An installed global skill shares the procedure; each project's memory stays in that project unless explicitly shared.

## Run relevant checks

Configure checks that test the project rather than merely agreeing with the implementation. Ask the agent to inspect commands before executing them. CLI check definitions are executable/argument arrays with `shell: false`; they are trusted code, not a safe execution boundary.

```sh
node bin/flowkit.mjs verify --project PATH_TO_PROJECT
node bin/flowkit.mjs release --project PATH_TO_PROJECT
```

No configured checks, failed checks, or changed tracked inputs prevent a passing readiness claim. The fingerprint includes source content, goal, acceptance criteria and configuration. Generated-path exclusions and external environments limit that guarantee. Source symlinks/junctions fail closed.

Browser journeys, accessibility, security and performance checks should match the change. If a capability or environment is unavailable, record the gap. Test success alone does not prove user acceptance or authorize deployment.

## Resume and collaborate

```text
$flowkit read the saved state, inspect current code, and resume the next ready task.
```

A good handoff identifies what changed, acceptance evidence, checks actually run, blockers and the next action. Saved state supports that handoff; it does not preserve the whole conversation or eliminate the need to inspect code.

When GitHub is the team backlog, it owns remote issue state. Use live reads before reporting remote status. FlowKit can draft issues and PRs locally; remote writes require explicit scoped authorization. It does not automatically create repositories, merge, publish or deploy.

## Useful requests

- `$flowkit turn this idea into a small useful MVP.`
- `$flowkit reproduce this failure before proposing a fix.`
- `$flowkit improve this screen and verify mobile behavior.`
- `$flowkit prepare actionable issues for this feature.`
- `$flowkit review this permission change for security risks.`
- `$flowkit report release readiness and anything still unverified.`

For available CLI commands, run `node bin/flowkit.mjs help`. See [maintenance](maintenance.md) to upgrade or remove FlowKit.

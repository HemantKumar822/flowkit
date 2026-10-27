---
name: flowkit
description: Use when the user invokes FlowKit, resumes a FlowKit project, or requests coordinated project onboarding, issue implementation, project health, or release preparation. Does not apply to unrelated questions or isolated edits outside a FlowKit workflow.
---

# FlowKit

Coordinate work using project evidence, proportionate process and selected existing capabilities. This skill is the judgment layer; the bundled CLI supplies local state and mechanical checks. It is not an autonomous service or a security boundary. One entry point routes to relevant procedures; external skills are optional integrations, not bundled components.

## Begin with the project
Locate the repository and read applicable instructions. Read `.flowkit/project.json` if present. Inspect code, Git status, available tools and the requested outcome before selecting depth. Do not overwrite existing conventions. If state is missing and onboarding is requested, run the bundled CLI with `init --project <root> --profile solo|team|hackathon|production`; add `--new` only for a new project. It creates local scaffolding and Git, never a remote repository or license.

Resolve `<skill>` to the directory containing this SKILL.md. Run helpers using their interpreter:

```text
node <skill>/scripts/flowkit.mjs help
node <skill>/scripts/flowkit.mjs status --project <root>
node <skill>/scripts/flowkit.mjs route "Add an export endpoint" --project <root> --record
```

The route command is an English keyword heuristic. Use actual risk, uncertainty and context to make the final choice; pass explicit `--mode`, `--risk high`, or `--uncertainty high` when needed. Explain the choice briefly. Natural-language skill selection is model-dependent; `$flowkit` is the explicit invocation fallback. If discovery is unavailable, read this file directly.

| Mode | Process | Choose when |
| --- | --- | --- |
| QUICK | Inspect → change → verify | Narrow, understood, low-risk edit |
| STANDARD | Understand → acceptance → implement → test → review | Bounded feature or investigation |
| DEEP | Research → requirements → architecture/design → backlog → implementation → QA/review | New product, uncertainty, migrations or trust boundaries |
| RELEASE | Checks → quality/security review → real user flows → deployment preparation → handoff | Demo or release readiness |

User overrides are supported. A shorter mode does not remove necessary security or correctness checks. Do not invent product approvals. Ask only for consequential unresolved product/security/architecture decisions or actions outside existing authorization. The user's explicit delegated decisions take priority over skill defaults. Other skills remain applicable according to their scope; FlowKit cannot cancel a higher-priority instruction. If an installed workflow conflicts with proportional execution, disclose the conflict and resolve it using applicable authority instead of secretly skipping or weakening it.

## Execute and preserve evidence
For meaningful tasks set a goal, acceptance criteria, owner and dependencies; inspect `help` for task/check commands. Use repository issue conventions when available. Track operational state in `.flowkit/project.json`, commit it for team/session continuity, and ignore its lock/temp files. QUICK edits need no fabricated backlog or design document. Existing GitHub issues own their remote open/closed state; local tasks record execution only. Fetch live state before reporting remote status.

Inspect configured commands before running them: they execute trusted project code. Checks are executable/argument arrays, not shell strings. Select real checks appropriate to the change. Use `verify` after the final source change. Missing, failing, or stale evidence cannot support task completion. Record observed acceptance evidence in the handoff/decision record; check success alone does not prove every criterion. `release` only reports engineering readiness for human review. It neither approves nor performs deployment.

Follow the [baseline methods](references/methods.md) and the relevant bundled product/review procedures below. They work without another framework installed. Applicable installed skills can add depth; report missing integrations without pretending they ran. Load only the needed capability, using `doctor`, `capabilities` and the host's actual skill discovery. Do not install tools, load all registry entries, or create agents automatically just because they appear in a list. Host instructions, permissions and actual tool schemas take precedence over example commands. Do not invent a browser, subagent, hook or approval capability on another host. Read [host portability](references/portability.md) when onboarding or changing hosts.

For a new or unclear product, use the [product brief](references/templates/product-brief.md), [story/acceptance](references/templates/story.md) and [architecture decisions](references/templates/architecture.md) only as needed. For substantial plans/changes use the [engineering review](references/templates/engineering-review.md), and for important completed work use the [independent review](references/templates/independent-review.md) when a reviewer is available and authorized. Fill these from project evidence; empty templates are not completed artifacts. `templates` lists the bundled procedures; `template NAME` prints one without writing files. Upstream attribution and licenses are retained in the package, not required as separate user invocations.

Read only the relevant procedure:
- [Project documents and memory](references/artifacts.md): right-sized requirements, plans, decisions, QA evidence and handoffs.
- [GitHub](references/github.md): user stories, issue/PR drafts, branches and remote authority.
- [Design and QA](references/design.md): substantial interfaces and rendered browser evidence.
- [Teamwork](references/teamwork.md): independent delegated work and reviews.
- [Release](references/release.md): risk-based checks and deployment handoff.
- [Maintenance](references/maintenance.md): lessons, evaluation, upgrades, rollback and removal.

Finish with outcome, checks actually run, failures/unverified work and next action. Update stage, blockers and useful decisions. If interrupted, another developer should resume from repository files without reconstructing chat history. Never turn a missing tool, unrun browser flow or unavailable remote operation into a success claim.

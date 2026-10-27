# Compatibility and integrations

FlowKit separates portable instructions and a Node CLI from host-specific installation paths. A host can expose different tools, permissions, context limits and skill-selection behavior. Successful file installation does not prove identical agent behavior.

## Host support

| Host | User skill parent | Project skill parent | Evidence level |
| --- | --- | --- | --- |
| Codex | `~/.agents/skills` | `.agents/skills` | Actual workflow exercises plus installation checks |
| Claude Code | `~/.claude/skills` | `.claude/skills` | Installation adapter only; real host runtime unverified |
| Cursor | `~/.cursor/skills` | `.cursor/skills` | Installation adapter only; real host runtime unverified |
| Custom | Explicit `--skills-dir` | Explicit `--skills-dir` | File placement only; host compatibility is your responsibility |

Each installation ends in a `flowkit` child directory. `~` denotes the user home resolved by Node. Project paths are relative to `--project`. An installation target is not a command alias or a hook.

The portable core requires Node.js 22+. Core and packaging CI has passed on Windows, Linux and macOS with Node 22/24; check the CI status of the exact release commit. That OS-level evidence does not certify an editor's discovery, tool permissions or workflow behavior. Additional host runtimes need direct verification. Older evaluation results do not automatically certify later changes.

## Optional capabilities

| Capability | What it adds | When absent |
| --- | --- | --- |
| Superpowers | Detailed planning, debugging, testing and review procedures | Use the bundled baseline; do not claim Superpowers was invoked |
| Design skills | Specialized interface/design guidance | Follow project conventions and the available design baseline |
| Browser control | Rendered interactions and responsive checks | Record browser validation as unverified |
| GitHub CLI or connector | Live remote issue/PR/CI operations | Prepare local drafts and keep remote status unknown |
| Native subagents/worktrees | Scoped delegation and isolation | Work sequentially and preserve explicit handoffs |

No integration is automatically downloaded or granted permissions. Install third-party tools from their own documented sources, under their own licenses. The capability registry is a discovery aid, not a dependency manager or authorization grant.

## Boundaries

FlowKit respects applicable repository and host instructions. It cannot override the user's permissions, create missing browser APIs, enforce human acceptance, or turn a model into a deterministic workflow engine. Direct configured checks execute trusted repository code with the current user's privileges; there is no sandbox.

GitHub operations require scoped authorization. A local task's status does not establish an issue's current remote status. A ready release report does not grant permission to merge, publish or deploy.

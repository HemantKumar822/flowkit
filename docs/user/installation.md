# Install FlowKit

FlowKit 0.3.0-preview.1 supports explicit host paths and user/project scope. The installer copies one self-contained skill folder. It does not edit host configuration, hooks, model settings, global instructions, or other skills.

## Prerequisites

- Node.js 22 or later.
- Git for repository workflows.
- An AI coding agent with skill discovery and local command execution.
- Optional: GitHub CLI with authentication for CLI GitHub operations; browser, design and Superpowers capabilities for their respective workflows.

Read the [compatibility matrix](compatibility.md) before choosing a host. Download/extract a versioned archive or obtain the source repository. No public repository URL or registry-install command is advertised until publication is available. Do not execute an unreviewed installer copied from an unrelated source.

## Install for one user

From the extracted/source root:

```sh
node bin/flowkit.mjs install --host codex --scope user
```

Choose `claude` or `cursor` instead of `codex` for their skill paths. The installer prints its exact target. It changes only its owned FlowKit directory and related install lock/backup paths. An identical install is a no-op; a different version requires `--update`.

## Install for one project

Replace `PATH_TO_PROJECT` with the project's directory:

```sh
node bin/flowkit.mjs install --host codex --scope project --project PATH_TO_PROJECT
```

Commit project-scoped skill files only when the team wants that distribution method. Keep one installation scope for the same host/project where possible; duplicate catalogs can cause ambiguous selection.

## Custom skill directory

If your agent is not a named target, first consult its documentation. `--skills-dir` means the parent folder containing skill directories; FlowKit appends `flowkit`.

```sh
node bin/flowkit.mjs install --host custom --skills-dir PATH_TO_SKILLS
```

The legacy `--skills-dir PATH_TO_SKILLS` form is retained. Copying to a directory alone does not prove that a host discovers or executes the skill correctly. See [compatibility](compatibility.md).

## Invoke it

Open the target project in Codex and start a new chat if the catalog needs refreshing:

```text
$flowkit onboard this existing project and identify its verification commands.
```

In Claude Code or Cursor select FlowKit through that host's skill interface. Invocation syntax and permission handling belong to the host. If discovery is unavailable, ask the agent to read the installed `flowkit/SKILL.md` by its absolute path; this fallback is manual loading, not a runtime compatibility certification.

## Inspect the CLI

```sh
node bin/flowkit.mjs help
node bin/flowkit.mjs doctor
```

`doctor` reports available local tools and project state; it does not certify host activation. Once installed, the helper is available inside the skill as `scripts/flowkit.mjs`.

For a source checkout, developers can run `npm test` and `npm run check` before installation. Release archives deliberately exclude tests and developer evidence, so those commands are for the source tree. Archive checksums are covered in [maintenance](maintenance.md).

## Troubleshooting

| Symptom | Action |
| --- | --- |
| Skill does not appear | Confirm the printed target, selected host and scope; refresh the host's skill catalog or start a new chat |
| Automatic selection misses FlowKit | Explicitly select/invoke it; implicit activation is a model decision |
| Installation is modified or foreign | Preserve edits, compare files with the ownership manifest, and resolve the conflict before updating |
| An installation lock remains after interruption | Confirm its writer is no longer running before removing only that lock; do not delete the installed skill |
| Shell cannot find Node | Install Node.js 22+ and open a terminal that can run `node --version` |
| Browser or GitHub tools are absent | Use available local checks and disclose the missing validation; optional integrations are not installed automatically |

See [maintenance](maintenance.md) for updates, backups, rollback and uninstall.

Linked ancestor directories are deliberately refused. On macOS, temporary paths under the system /var alias may need their canonical /private/var path instead. This preserves the same link refusal rule on every platform; it does not whitelist source symlinks.

The maintained repository is https://github.com/HemantKumar822/flowkit. It is an MIT-licensed public developer preview. npm registry publication and marketplace listing remain separate maintainer actions.

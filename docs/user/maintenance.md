# Maintain FlowKit

Updates are explicit. FlowKit does not self-update, modify model defaults or silently install third-party skills. Keep application state separate from the FlowKit installation.

## Review and update

Obtain a new version, read its changelog and inspect its source or release inventory. For a source checkout run `npm test` and `npm run check`. From the new version's folder, repeat the original target with `--update`:

```sh
node bin/flowkit.mjs install --host codex --scope user --update
```

For project scope, include `--scope project --project PATH_TO_PROJECT`; for custom installs repeat `--host custom --skills-dir PATH_TO_SKILLS`. The installer validates ownership and content before replacing an installation. It refuses foreign, modified or linked paths. Preserve local edits and resolve that conflict rather than bypassing the refusal.

An identical installation is a no-op. A changed owned installation is moved into a backup; the command prints the exact path. You may choose `--backup-root PATH_TO_BACKUPS` outside the installation. Keep backups until the new version has worked in your host.

## Uninstall

Repeat the host and scope used at installation:

```sh
node bin/flowkit.mjs uninstall --host codex --scope user
```

Uninstall moves the owned skill into a recoverable backup. It does not remove the application's `.flowkit/project.json`, third-party skills, host configuration or repository instructions. Decide separately whether you want to retain project state and project-scoped tracked files.

## Roll back

1. Preserve any local modifications and identify the previous backup printed by the installer.
2. Uninstall the current unmodified owned installation using the same target options.
3. Run the previous backup's helper with the same host/scope options:

```sh
node PATH_TO_PREVIOUS_BACKUP/scripts/flowkit.mjs install --host codex --scope user
```

The backup directory is the skill itself, so its executable is `scripts/flowkit.mjs`, not `bin/flowkit.mjs`. A pre-0.2 helper may only understand `--skills-dir`; use its `help` and supply the original skill parent explicitly. Do not mix a project target with a user target while restoring.

## Verify a release artifact

Release output includes a versioned ZIP, npm `.tgz`, `SHA256SUMS` and `release.json`. Verify each downloaded artifact's SHA-256 against a separately trusted copy of the checksum list. On PowerShell:

```powershell
Get-FileHash ./flowkit-0.3.0-preview.1.zip -Algorithm SHA256
```

On systems providing it, use `sha256sum -c SHA256SUMS` in the artifact directory. Checksums detect corruption or mismatched files; they do not authenticate a maliciously replaced checksum list. No signing or registry-provenance claim is made.

The ZIP places files at its root; extract into an empty version-specific folder. The npm tarball is a packaging artifact, not a claim of a published npm command. Development audits, personal environment evidence and raw upstream downloads are excluded from release payloads.

For maintainers, the builder refuses to replace a versioned archive with different bytes. Rebuilding identical input is allowed. Increment the release version for changed published content; never overwrite a published archive or move its tag. Build reviewed releases from a clean checkout into an empty output directory.

## Project-state care

The current state schema is 1. Back up or commit `.flowkit/project.json` before changing FlowKit versions. No incompatible state-schema migration should happen silently. An older version may not understand a future schema; consult that release's migration notes before rolling back.

If a writer crashes and leaves a lock, read its PID/time and verify the writer is no longer active. Preserve state, then remove only the abandoned lock. Never steal a lock based only on elapsed time.

Captured command output is redacted on a best-effort basis. Review it before committing; project state is not a secret store. Fingerprint exclusions can hide changes inside excluded paths; review them when source/build directories overlap. Rerun checks after external-service or environment changes because those are not content-bound.

## Improve with evidence

Record a concrete defect, missing capability or repeated friction. Propose a small change, test it in isolation, compare actual outcomes and update the changelog. Do not infer productivity gains from more skills or passing unit tests. Keep the [roadmap](roadmap.md) aligned with observed needs.

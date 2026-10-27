# BMAD packaging audit

Inspected 2026-10-27. Read-only source audit; no upstream installer, dependencies, or evaluations were run, and no remote writes were made.

## Pinned sources and the important version split

Repository default checkout: [`61e01f82644c4bb533750cfa0d6d61ab61d2cc9b`](https://github.com/bmad-code-org/BMAD-METHOD/tree/61e01f82644c4bb533750cfa0d6d61ab61d2cc9b), commit dated 2026-10-18. Separately fetched stable `V6.12`: [`bab9082c3e884e0d72c759bcd1a6d90bcc01be84`](https://github.com/bmad-code-org/BMAD-METHOD/tree/bab9082c3e884e0d72c759bcd1a6d90bcc01be84), package version 6.12.4.

Do not describe these as one installer. The default branch calls itself v7 preview alpha and distributes a skills tree. Stable retains an npm installer. The preview README still gives an October 16 release ETA despite a later commit; module manifests say `6.13.0-next`. These are observed inconsistencies, so use commit/version pins rather than promising a finalized v7 release. [README](https://github.com/bmad-code-org/BMAD-METHOD/blob/61e01f82644c4bb533750cfa0d6d61ab61d2cc9b/README.md), [module manifest](https://github.com/bmad-code-org/BMAD-METHOD/blob/61e01f82644c4bb533750cfa0d6d61ab61d2cc9b/skills/bmod-method/bmod.toml).

## How reuse actually works

### Stable: canonical content plus data-driven host adapters

Stable [`package.json`](https://github.com/bmad-code-org/BMAD-METHOD/blob/bab9082c3e884e0d72c759bcd1a6d90bcc01be84/package.json) exposes `bmad` and `bmad-method` binaries through `tools/installer/bmad-cli.js`, with public npm publication metadata. The CLI loads install/status/uninstall commands and performs a best-effort version check using the appropriate npm prerelease/stable tag. This is a distributable executable product, not a downloadable prompt folder alone.

[`tools/installer/ide/platform-codes.yaml`](https://github.com/bmad-code-org/BMAD-METHOD/blob/bab9082c3e884e0d72c759bcd1a6d90bcc01be84/tools/installer/ide/platform-codes.yaml) maps host names to project/global skill locations. `manager.js` constructs handlers from this data; suspended hosts are filtered. Many hosts share `.agents/skills`, while others need `.claude/skills`, `.cursor`-related conventions, or another host-specific location. This does not make every arbitrary editor compatible: the editor must offer appropriate AI-agent discovery/execution capabilities.

[`tools/installer/ide/_config-driven.js`](https://github.com/bmad-code-org/BMAD-METHOD/blob/bab9082c3e884e0d72c759bcd1a6d90bcc01be84/tools/installer/ide/_config-driven.js) implements verbatim skill placement and optional command pointers. GitHub Copilot exposes persona agents through `.github/agents/*.agent.md` with a template directing it to canonical SKILL.md. OpenCode pointers use its skill-reference syntax, with reserved-name collision handling. The generator validates safe IDs and preserves pointer bodies that look user-modified. Host metadata and reusable content are separated rather than maintaining dozens of divergent workflow copies.

### Preview: standard skills discovery plus project runtime

The preview delegates host installation to `npx skills add ... --skill '*'` or separate Claude/Codex plugin marketplaces. It can install a subset, but requires the hub and applicable module records. Its [`pyproject.toml`](https://github.com/bmad-code-org/BMAD-METHOD/blob/61e01f82644c4bb533750cfa0d6d61ab61d2cc9b/pyproject.toml) explicitly says this is development tooling, not the distributed package: the repository tree is the product, and scripts carry inline Python requirements for `uv run`.

The [`bmad` hub](https://github.com/bmad-code-org/BMAD-METHOD/blob/61e01f82644c4bb533750cfa0d6d61ab61d2cc9b/skills/bmad/SKILL.md) discovers help from installed modules. Specialized skills remain independently invocable. BMAD therefore combines one entry point with many domain workflows; it does not require that every request start by selecting a persona.

[`setup.py`](https://github.com/bmad-code-org/BMAD-METHOD/blob/61e01f82644c4bb533750cfa0d6d61ab61d2cc9b/skills/bmad/scripts/setup.py) consumes `bmod.toml` records for versions, required/recommended skills, sources, script inventory, config questions and retired names. It sets up `_bmad/`, separates team config from ignored user config/customizations, and diagnoses missing modules and duplicates. [`setup.md`](https://github.com/bmad-code-org/BMAD-METHOD/blob/61e01f82644c4bb533750cfa0d6d61ab61d2cc9b/skills/bmad/references/setup.md) distinguishes skill-managed updates from plugin-managed updates and offers explicit migration/retirement cleanup. This lifecycle design is more substantial than a one-time copy command.

[`bmad-build/SKILL.md`](https://github.com/bmad-code-org/BMAD-METHOD/blob/61e01f82644c4bb533750cfa0d6d61ab61d2cc9b/skills/bmad-build/SKILL.md) invokes a renderer rather than embedding the full workflow. [`render_skill.py`](https://github.com/bmad-code-org/BMAD-METHOD/blob/61e01f82644c4bb533750cfa0d6d61ab61d2cc9b/skills/bmad/scripts/render_skill.py) combines declared configuration/customization using Jinja, publishes an immutable project snapshot, hashes inputs/renderer/outputs, verifies reused snapshots, and stages publication atomically. It stops on missing setup instead of silently bypassing the runtime. FlowKit need not copy this complexity, but can learn from explicit configuration contracts and reproducibility.

## Maintenance, quality and distribution

The stable uninstall command separates modules, host integration and user artifacts, preserving artifacts by default. Preview removal partly belongs to the external skill/plugin manager; setup handles renamed/removed skills and migration, rather than offering the same stable npm uninstall entry point. [Stable uninstall](https://github.com/bmad-code-org/BMAD-METHOD/blob/bab9082c3e884e0d72c759bcd1a6d90bcc01be84/tools/installer/commands/uninstall.js).

The preview [`release runbook`](https://github.com/bmad-code-org/BMAD-METHOD/blob/61e01f82644c4bb533750cfa0d6d61ab61d2cc9b/tools/release.md) specifies SemVer stamping, clean committed state, quality gates, tested-commit promotion, immutable tags, plugin-repository rebuild, and verification through actual distribution channels. Its own release is not npm publication; npm maintenance remains on V6.12.

The [`quality workflow`](https://github.com/bmad-code-org/BMAD-METHOD/blob/61e01f82644c4bb533750cfa0d6d61ab61d2cc9b/.github/workflows/quality.yaml) declares Ubuntu and Windows Python jobs plus docs build/tests. Pre-commit invokes skill/reference/manifest validators and pytest. Actual source tests cover configuration preservation, symlink rejection, retirement/migration, rendering and validation. These are observed test implementations, not a claim that this checkout's jobs passed during this audit. [Setup tests](https://github.com/bmad-code-org/BMAD-METHOD/blob/61e01f82644c4bb533750cfa0d6d61ab61d2cc9b/tools/tests/test_bmad_setup.py).

BMAD is MIT-licensed, while its name/trademarks have separate treatment. Our own branding and license choice remain necessary. [License](https://github.com/bmad-code-org/BMAD-METHOD/blob/61e01f82644c4bb533750cfa0d6d61ab61d2cc9b/LICENSE).

## Concrete implications for FlowKit

Our current `package.json` is private, our installer targets one global skill directory, and our generic `plugin.json` has not established marketplace distribution. FlowKit is an evaluated Codex-first coordinator, not yet a multi-host distributable comparable to BMAD's packaging.

1. Keep the single FlowKit front door. Add separately invocable modules only for distinct, useful workflows; skill count is not product quality. Existing Superpowers skills remain separate capabilities and must be documented dependencies, not assumed present everywhere.
2. Separate portable coordinator/state CLI from host adapters. Initially support Codex and one additional host, with source-derived install locations, invocation syntax and tool-capability fallbacks. Label support as tested, documented-only, or unsupported. Do not promise every editor.
3. Add project/global scope, deterministic host selection, dry-run plans, exact ownership manifests, conflict detection, backup/rollback and scoped uninstall. Preserve FlowKit's current stronger recoverable removal approach.
4. Make a versioned release artifact containing only runtime files, one authoritative version, reproducible checksums, clean package-file allowlist, documented prerequisites and tagged installation instructions. Choose npm versus repository Skills CLI deliberately; both are optional distribution paths, not prerequisites for portability.
5. Publish an honest compatibility matrix and test install/update/uninstall in clean host homes on supported operating systems. Document runtime versus specialist dependencies and degraded operation when browser/GitHub/agents are absent.
6. Establish release/migration policy before public adoption: schema versions, compatibility rules, changelog, immutable tags, SECURITY.md, contribution guidance, issue templates and license. A beautiful README should show outcome, diagram, quickstart, host table, examples, limitations, updates and removal.

BMAD is broader in product discovery, architecture, specialist workflows and lifecycle packaging. FlowKit's focused design can be preferable for our small Codex workflow, but source inspection cannot establish superior efficiency or universal reliability. The defensible benefit is explicit state, proportionate coordination and stale-evidence rejection; any time/token/productivity claim needs real comparable usage evidence, which this audit does not invent.

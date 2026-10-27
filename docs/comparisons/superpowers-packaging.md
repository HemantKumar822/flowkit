# Superpowers packaging audit for FlowKit

Observed 2026-10-27. Shallow-cloned the actual `obra/superpowers` main tree and inspected implementation, not just installation claims. Pinned commit: **2ce8aa15d05bd57213e6f746f953aafb7ded7a8b**, committed 2026-10-21, release **7.0.1**. No upstream tests or agent behavior evaluations were run for this audit; findings describe source, not independently certified host support.

## Reuse comes from shared content plus real integrations

Superpowers is a methodology distributed as multiple composable skills. `skills/*/SKILL.md` frontmatter supplies discovery metadata, bodies supply behavior, references supply detailed procedures, and selected skills have scripts. Its entry skill teaches discovery and routes to the relevant skill. This is neither a single giant prompt nor an editor-independent executable that magically works everywhere. [Entry skill](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/using-superpowers/SKILL.md).

The porting guide deliberately separates three layers: unchanged skill content, host tool mappings, and bootstrap delivery. It requires real session acceptance evidence, including the actual workflow triggering before implementation, instead of accepting a manifest-only port. It discourages rewriting user-owned global configuration. These are strong practices worth adopting. Its automatic-bootstrap requirement is its own project policy, not a universal prerequisite for useful skills. [Porting guide](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/docs/porting-to-a-new-harness.md).

## Actual integration mechanisms

| Host/integration | Files inspected | What the code actually delivers |
| --- | --- | --- |
| Claude-style plugin | `.claude-plugin/plugin.json`, `hooks/hooks.json`, `hooks/session-start` | SessionStart hook emits bootstrap text in host-specific JSON; matcher includes startup, clear and compact |
| Cursor | `.cursor-plugin/plugin.json`, `hooks/hooks-cursor.json` | Separate manifest and hook output format; shared skills |
| Codex | `.codex-plugin/plugin.json`, `.agents/plugins/marketplace.json`, packaging script | Skills path and rich plugin interface metadata; **hooks is empty**, rather than copying Claude hooks |
| Gemini | `gemini-extension.json`, `GEMINI.md` | Extension-owned context imports entry skill and Gemini mapping |
| OpenCode | `.opencode/plugins/superpowers.js`, `index.js`, `package.json` | Distinct V1/V2 registration/context lifecycle adapters, cached bootstrap and structurally detected child sessions |
| Pi | `.pi/extensions/superpowers.ts`, `package.json` | Registers skill paths and inserts bootstrap in context after session start/compaction; avoids duplicate marker |
| Hermes | `.hermes-plugin/plugin.yaml`, `__init__.py` | Registers skills with descriptions and native pre-LLM hook; handles clone and flattened install layouts |

Primary implementations: [hooks](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/hooks/session-start), [Codex manifest](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/.codex-plugin/plugin.json), [OpenCode](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/.opencode/plugins/superpowers.js), [Pi](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/.pi/extensions/superpowers.ts), [Gemini](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/gemini-extension.json), [Hermes](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/.hermes-plugin/__init__.py).

The guide's ideal of session injection should not be confused with identical code on every host: Codex explicitly ships without these shell hooks; Antigravity documentation relies on entry-skill discovery wording. Adapters must be assessed individually. Tool mappings are version-sensitive: the current Codex mapping even contains tool/override advice that conflicts with this running session's actual tool restrictions. Runtime tool schemas and higher-priority host instructions win. Merely copying the mapping is insufficient.

The Windows polyglot hook locates Git Bash and filters unsuitable WSL launchers. If Bash is unavailable it silently returns successfully without injection. Thus a nominally installed plugin is not proof of functioning bootstrap. [Windows wrapper](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/hooks/run-hook.cmd).

## Packaging, maintenance and evidence

Version 7.0.1 appears in several host manifests. `.version-bump.json` lists the synchronized version fields; `scripts/bump-version.sh` and tests reduce drift. This is a useful release discipline, not a single universal package format. Host-native update mechanisms differ; OpenCode documentation explicitly warns about package lock/cache behavior and provides version pinning. Removal is likewise host-specific; there is no universal uninstall promise. [Version map](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/.version-bump.json), [OpenCode install/update](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/.opencode/INSTALL.md).

`scripts/package-codex-plugin.sh` builds a rootless portal archive from a Git ref, refuses a dirty source tree by default, whitelists runtime files, preserves required OpenAI metadata from a prior official package, rejects unexpected source-only entries and emits SHA-256. Tests check packaging. A generic `plugin.json` is not equivalent to this distribution process. [Packager](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/scripts/package-codex-plugin.sh), [packaging tests](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/tests/codex/test-package-codex-plugin.sh).

The root package declares no runtime npm dependencies; integration scripts still require host runtimes (Bash, Node, Python or a host-supplied TypeScript environment). Optional brainstorming has an actual local web server, with dedicated auth/lifecycle/protocol tests. Optional visual-companion remote-logo telemetry is disclosed with opt-outs. Core skill text does not require that service.

Testing distinguishes infrastructure tests from real model-behavior evaluations. `docs/testing.md` points to a separate evaluation lab; this clone contains no `evals/` tree. Numerous shell/Node/Python tests and explicit skill-trigger prompts exist, but their existence does not establish current pass rates or superiority. [Testing policy](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/docs/testing.md). Distribution is MIT licensed, requiring preserved notice for copied substantial portions. [License](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/LICENSE).

## Concrete consequences for FlowKit

FlowKit currently has one public coordinator skill, progressive references, a Node CLI and Codex-specific discovery metadata. It reuses external Superpowers skills rather than containing their full methodology. That is a reasonable small interface; it is not a self-contained equivalent installation. Its current root `plugin.json` is a candidate manifest, and `package.json` is private. It lacks the host adapters, native manifests and tested release artifacts shown above.

Recommended structure: retain a portable core (`skills/flowkit`, CLI, state schema); add thin host adapters and host-specific installation artifacts; keep third-party capabilities optional and report missing ones. Add specialist entry skills only when users need independent discovery/invocation, not to inflate a skill count. Separate compatibility tiers: actually exercised host, adapter statically tested, and manual generic fallback.

Before public release: choose a license and attribution policy; produce versioned allowlisted archives with checksums; synchronize manifest versions; test installs from the artifact rather than the working tree; document exact runtimes, update/rollback/removal; prove fresh-session discovery, explicit invocation, capability degradation and resume on each supported host. Preserve the safer owned-directory backups already implemented. Do not change global instructions to force invocation.

The strongest recommendation is to adopt Superpowers' **integration engineering**, not its marketing breadth. FlowKit's evidence freshness and durable state plausibly reduce repeated reconstruction and accidental stale-success claims. Its extra state/process may cost effort on small work. No measured cross-framework efficiency advantage follows from source comparison, and no numerical productivity claim is warranted.

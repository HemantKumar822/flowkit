# Contributing to FlowKit

Keep FlowKit small, portable and honest about what it verifies. In a source checkout, read `AGENTS.md` for repository engineering instructions, [the roadmap](docs/user/roadmap.md) for scope, and [security guidance](SECURITY.md) before reporting a vulnerability.

## Set up

Use Node.js 22 or later and Git. Runtime dependencies are currently zero.

```sh
npm test
npm run check
npm run evaluate
npm run package
```

Tests and evaluations run local filesystem/process examples; they do not measure model productivity. Inspect online tests before running them. Never create remote issues, branches or PRs in someone else's repository without explicit scoped authorization.

## Propose a change

Start with a reproducible problem, desired behavior and acceptance criteria. Use the repository's issue template when hosted. For a small fix, keep the PR focused and explain the trigger, resulting behavior and validation. For a new host, integration, dependency or state format, discuss its maintenance and compatibility impact first.

Use a feature branch and clear commits. Include behavioral tests for meaningful bugs and features, especially real filesystem, process, interrupted-operation and archive boundaries. Preserve existing user files. Do not add global config rewrites, hooks, automatic third-party installs, model defaults or self-update behavior without explicit design/security review.

## Code and documentation

Runtime helpers stay inside `skills/flowkit/scripts` so an installed skill is self-contained. Host adapters should select paths and describe capabilities rather than duplicate workflows. `AGENTS.md` is the canonical repository instruction file; there are currently no host-specific instruction aliases to synchronize.

Update user docs, CLI help and changelog when behavior changes. Keep source/package version metadata consistent. State changes require a compatibility/migration plan. Release payloads must exclude private environment reports and raw research downloads. Preserve license attribution when incorporating external material; optional integrations are not permission to vendor their code.

Mark support accurately: installation tests, documented expectations and real host runtime trials are different evidence. Never claim universal compatibility or efficiency gains from passing packaging tests. In a source checkout, `docs/comparisons/` contains source comparison reports explaining architectural lessons; dated snapshots are not promises of current upstream behavior.

## Curated upstream material

Select the smallest component that solves a concrete need. Inspect its file-level license, dependencies and host assumptions at a pinned commit. Preserve full copyright/license notices and linked contributor/trademark references. Rebranding is not permission to remove attribution or claim upstream endorsement.

For bundled adaptations, update `skills/flowkit/third-party/sources.json`: exact upstream Git-blob SHA-256, derivative SHA-256 and what changed. Use Git blob bytes rather than platform-converted checkout bytes for source hashes. Review the adapted text against FlowKit's authority, state and host contracts. Do not copy an upstream hook, binary, service, model wrapper or auto-updater just to inherit a feature name.

`npm run check` and `npm run package` verify bundled derivative and license integrity. A changed adapted file needs a reviewed inventory update; checks must not be bypassed to hide changes. Add tests for missing notices and ensure they survive packed installation. Preserve the source trail through later modifications.

## Review and release process

Before a PR, run the applicable checks above, inspect the diff and review package contents/checksums. Explain unrun checks and limitations. Human review still owns acceptance of product behavior and consequential security/architecture choices.

A release should come from a reviewed, tested commit, carry a version and changelog, and include a verified file inventory and SHA-256 checksums. Do not move published version tags. Keep npm `private: true` until publication is explicitly authorized. Publishing, registry ownership and marketplace listing are separate maintainer actions.

FlowKit's original code is MIT-licensed. Contributions are accepted under the repository's [MIT license](LICENSE); ensure you have the right to contribute them.

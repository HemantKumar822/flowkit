# A coherent, attributed FlowKit core

Decision date: 2026-10-27. The user authorizes selective upstream reuse, a product plan and making the clean repository public. Attribution and license preservation are requirements, not optional branding choices. Original code remains MIT; copied/adapted material retains its upstream notices.

## Approaches

- Wholesale fork/bundle: fast apparent breadth, but inherits host-specific tools, policy conflicts, runtime dependencies and ongoing merge obligations. Rejected.
- Thin wrappers requiring separate framework installations: preserves upstream updates but does not meet the requested self-contained experience. Keep only as optional integrations.
- Curated reusable components behind FlowKit contracts: selected under delegated product decisions. One invocable coordinator; internally scoped procedures/templates; own durable state and checks; explicit host capabilities. Adapt only useful audited files, not entire frameworks.

## Version 0.3 scope

Bundle BMAD-derived product brief, story/acceptance and architecture templates; a Superpowers-derived independent-review procedure; and a gstack-derived engineering-review checklist. Preserve copyright/license files, exact input commit/path/hash, changes and derivative hashes. Remove upstream runtime/tool assumptions. Make templates discoverable through CLI commands and load only the relevant procedure. Templates are starting structures; agents must fill them with project evidence. Empty documents are not deliverables.

Update source notices, user docs, roadmap and package validation. Keep license/provenance files inside the self-contained installed skill. No upstream binaries, hooks, auto-updaters, browser servers, model orchestration or copied test-pressure prompts. Avoid conflicting workflow authorities: host/repository/user instructions remain authoritative.

## Product path

0.3 makes useful baseline methods self-contained; it does not implement full lifecycle automation. Later phases need real artifact registration/freshness, state migrations, team merge/conflict recovery, project-specific QA/security recipes and fresh-host behavioral evidence. Preserve existing project state schema1 until a tested migration is introduced. Do not imply retraining, automatic cross-project knowledge or broad model-performance gains.

## Publication

Inspect the clean repository files, reachable history and GitHub-visible records before publication. Publish the reviewed source at HemantKumar822/flowkit with a fresh root and GitHub noreply identity; retain earlier development history and its draft release in a private archive to avoid disclosing personal commit metadata. Keep npm publishing separate because registry ownership/package name has not been established. Public source availability does not require promising stable production support.

## Acceptance

- A new installation can discover the curated templates without any other framework installed.
- Each derivative maps to exact audited upstream source and full license notices in both install and release payload.
- CLI rejects unknown template identifiers and never executes template content.
- Document/review guidance stays proportional and does not claim planned state gates exist.
- Real filesystem/package tests pass; full CI and independent review precede any released 0.3 artifact.
- Public repository confirmed by live metadata; no private workbench history exposed.

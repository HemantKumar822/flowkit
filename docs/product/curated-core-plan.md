# Curated core implementation plan

**Goal:** An attributed, self-contained FlowKit core with a credible public product roadmap.
**Architecture:** Existing one-skill/Node core plus curated templates, provenance inventory and package checks; no third-party runtime dependency.
**Design:** curated-core-design.md. Routine implementation delegated by user; public visibility explicitly authorized.

1. Inspect exact source files and licenses. Select only useful permissively licensed components. Preserve full notices and input hashes.
2. Write behavioral tests for template discovery/read, unknown identifiers, provenance integrity and required license files in installed/packed payloads; observe missing capability fail.
3. Add curated templates and registry, CLI read-only discovery, and scoped entry-skill guidance. Distinguish templates from completed documents and methods from mechanical enforcement.
4. Update MIT/third-party notices, public README/install/maintenance guidance and phased roadmap; sync version metadata.
5. Independently review source attribution, scope, packaging and public-history hygiene. Run checks and CI; correct important findings.
6. Push reviewed source, make only the requested repository public and verify anonymous visibility. Publish a clearly labeled 0.3 preview only after actual checks; do not publish npm or merge unrelated dependency PRs.

Release validation is real software behavior, not simulated efficiency data. The next phases in roadmap.md remain proposals until implemented and evaluated.

# Roadmap and current limits

FlowKit is an early, maintained engineering coordinator. Its focus is a small self-contained core, attributed curated methods, optional integrations and reliable lifecycle behavior. This page is a priority order, not a delivery-date promise. The source checkout's `docs/product/roadmap.md` contains detailed user stories, dependencies, acceptance criteria and evidence gates.

## Current direction

- One entry skill with a bundled baseline and optional specialist integrations.
- Portable Node core, explicit host paths and user/project scope.
- Owned installation, recoverable replacement/removal and versioned artifacts.
- Persistent task/decision state and verification freshness checks.
- Clear separation between passing checks, human acceptance and release authorization.
- Bundled product/story/architecture and review procedures with exact upstream provenance and full MIT notices; no separate framework installation required.

## Next improvements

| Priority | Work | Evidence needed before claiming it works |
| --- | --- | --- |
| First | Real Claude Code and Cursor runtime onboarding | Actual discovery, invocation, implementation and resume in each host |
| First | Supported public releases and registry ownership | Reviewed repository, tagged artifact, license/notices and verified release instructions; npm and marketplace ownership remain separate |
| Next | Project-specific browser/accessibility/security recipes | Real application failures caught by relevant checks |
| Next | Concise product-discovery procedures | Useful decisions and artifacts on genuinely unclear projects |
| Next | State validation/migration recovery, then artifact-aware stage gates | Invalid/old state preserves original bytes; artifact/source changes correctly revoke evidence; no empty-document completion |
| Next | Team conflict recovery | Concurrent writers and divergent Git branches preserve both changes or report a conflict |
| Later | Broader host support | Source-verified adapter plus direct runtime evidence, rather than a path-only claim |

## How we assess value

FlowKit should make goals, evidence and handoffs easier to recover, keep small edits proportionate, and prevent stale-check completion claims. Those mechanisms are useful without a numeric speedup claim.

BMAD offers broader product/architecture workflows; gstack offers a richer opinionated toolkit; Superpowers provides detailed engineering methods. FlowKit coordinates a focused subset and can reuse independent capabilities. There is no demonstrated overall ranking or efficiency percentage. A fair comparison would use actual comparable projects, disclose differences in environment/model/intervention, and report failures as well as successes. We have not invented such a benchmark.

## Explicit gaps

Automatic activation is model-dependent. Installation adapters do not certify equivalent behavior across editors. Tests do not prove all acceptance criteria. External services are not covered by source fingerprints. Public marketplace/npm distribution and production deployment require separate work and authorization.

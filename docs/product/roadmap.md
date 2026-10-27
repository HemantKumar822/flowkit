# FlowKit product roadmap

Status: proposed product direction, 2026-10-27. Phases describe work to earn through evidence, not shipped functionality or delivery dates. Read the [current user roadmap](../user/roadmap.md), [compatibility matrix](../user/compatibility.md), and [curated core design](curated-core-design.md) for the release's actual scope.

## Product promise and boundary

FlowKit should be a useful open-source engineering product in its own right: one `$flowkit` entry point that helps a person turn an outcome into working software, retain project decisions, and understand which evidence supports completion. Its portable skill and dependency-free Node.js runtime remain usable without BMAD, gstack, Superpowers, a browser service, GitHub, or subagents installed. Existing project conventions take priority; specialist integrations improve particular work when available.

The intended lifecycle is inspect/onboard → discover → define acceptance → design when needed → implement → review → exercise user behavior → prepare release → resume/maintain. These are responsibilities, not a mandatory document factory. QUICK work can stay inspect/change/verify; DEEP work earns the extra artifacts and review.

Product success means that another person can install a reviewed release, make a bounded change, recover its rationale in a fresh session, and identify an unverified requirement without guessing from chat history. Evidence should come from actual use, reproducible filesystem/process tests, and disclosed host sessions. No productivity percentage or universal superiority claim follows from a smaller prompt library.

### User stories

| User and situation | Desired outcome | Observable acceptance |
| --- | --- | --- |
| Solo builder returns after a break | Resume the right work with useful context | Fresh session finds goal, ready tasks, decisions, changed inputs and current gaps from repository state |
| Builder starts with an unclear idea | Choose a small useful product scope | Brief identifies users, problem, scope, exclusions and observable acceptance; unresolved assumptions remain visible |
| Engineer makes a bounded change | Spend effort in proportion to risk | Existing conventions are inspected; small work avoids unnecessary planning; relevant checks and acceptance behavior are reported |
| Reviewer inherits a feature | Trace a requirement through a decision, change and check | Links resolve to the relevant version of each artifact; stale evidence is visibly rejected |
| Two contributors work independently | Preserve both changes or surface a conflict | Concurrent updates and Git merges cannot silently erase decisions, ownership or evidence |
| Maintainer upgrades or releases | Recover from upgrade failure and report readiness honestly | Supported migrations preserve original state; release report distinguishes checks, acceptance, unresolved risks and publication authorization |
| User works in another host | Know which behavior has been exercised | Compatibility states host/version, tested workflow, optional-tool gaps and evidence date |

### Non-goals

- Repackage three complete upstream frameworks, maintain their personas, or require users to install them for the baseline.
- Replace the host's permissions, tools, repository instructions, or human product judgment with prompt rules.
- Treat files existing, review prose, a green test suite, or a release-readiness report as proof of user acceptance or authority to publish/deploy.
- Generate a complete product specification automatically, silently rewrite existing documentation, or claim intelligent routing from keyword matching.
- Introduce cross-project learning, a hosted memory service, autonomous remote writes, telemetry, or paid model/browser dependencies as core requirements.

## Curated adoption policy

Prefer a small, readable adaptation with a named source over a wholesale fork or a wrapper that assumes the upstream installation exists. FlowKit owns the resulting user contract, tests, documentation and maintenance burden. Attribution remains visible in source, distributed skill files and third-party notices; FlowKit branding must not imply upstream authors created or endorsed it.

| Source and selected material | Proposed FlowKit use | Retain locally / optional | Maintenance cost and exclusion |
| --- | --- | --- | --- |
| BMAD product brief, ticket and architecture templates at `61e01f82644c4bb533750cfa0d6d61ab61d2cc9b` | Concise brief, acceptance-oriented story and architecture decision templates for uncertain or consequential work | Small attributed templates in the self-contained core | Review upstream changes deliberately; translate identifiers and remove unused sections. Do not inherit BMAD's renderer, Python/Jinja setup, ticket integrations or entire module runtime |
| Superpowers reviewer prompt at `2ce8aa15d05bd57213e6f746f953aafb7ded7a8b` | Independent review against requirements and actual change range, with actionable severity and evidence | Attributed core prompt; native independent reviewer is optional | Adapt tool dispatch to the actual host. Sequential self-review must be labeled as such and must not be reported as independent review |
| gstack engineering review sections at `a50cf589656c0dc3f785af9b7c483861b13c8288` | Scope, architecture, code quality, testing, failure modes and relevant performance questions | Attributed checklist in core; upstream specialist runtime remains optional | Remove runner/tool-specific contracts. Do not copy its browser daemon, model wrappers, telemetry, auto-install behavior or generated host system without a separate need and lifecycle review |

These selections are the 0.3 curated-core scope, subject to that release's checks. Full upstream skills remain optional for users who want deeper methods. Installing an integration must not change baseline completion semantics or grant permissions.

The [source comparisons](../comparisons/README.md) explain the pinned inspections. Primary source references: BMAD [brief](https://github.com/bmad-code-org/BMAD-METHOD/blob/61e01f82644c4bb533750cfa0d6d61ab61d2cc9b/skills/bmad-product-brief/assets/brief-template.md), [ticket](https://github.com/bmad-code-org/BMAD-METHOD/blob/61e01f82644c4bb533750cfa0d6d61ab61d2cc9b/skills/bmad-agent-po/assets/ticket-template.md), [architecture](https://github.com/bmad-code-org/BMAD-METHOD/blob/61e01f82644c4bb533750cfa0d6d61ab61d2cc9b/skills/bmad-architecture/assets/spine-template.md); Superpowers [reviewer](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/requesting-code-review/code-reviewer.md); gstack [engineering review](https://github.com/garrytan/gstack/blob/a50cf589656c0dc3f785af9b7c483861b13c8288/plan-eng-review/sections/review-sections.md.tmpl).

## Baseline versus proposed work

The existing runtime has a schema-1 `.flowkit/project.json`, goals, tasks, owners, dependencies, decisions, lessons, check configuration, verification fingerprints, task transitions, an exclusive local write lock and atomic JSON replacement. This is useful working memory. A schema number alone is not full document validation or a migration system; a write lock alone does not solve divergent Git branches; a task gate is not an artifact-aware lifecycle gate.

The 0.3 work adds curated procedures and templates, not automatic artifact generation, a typed artifact registry, stage enforcement, conflict merging, new host certification or an intelligent planner. The phases below should become separate reviewed specifications and implementation plans before coding. Version numbers beyond the curated release should follow delivered scope rather than force a promised schedule.

## Priority and dependency order

| Order | Workstream | Dependency | Exit decision |
| --- | --- | --- | --- |
| P0 | Curated 0.3 baseline and public release hygiene | Existing installation, packaging and verification core | Is the distributed product self-contained, attributed and accurately documented? |
| P0, alongside later development | Real host conformance | A versioned packed artifact and access to the actual host | Which exact hosts may be advertised as exercised? |
| P1 | State contract, validation and migrations | Stable documented schema-1 behavior | Can new features evolve state without losing user data? |
| P1 | Artifact registry and explicit lifecycle gates | State validation and migration policy | Can a requirement be traced to current evidence without forcing paperwork? |
| P2 | Team conflicts and recovery | Stable identifiers, revisions and artifact model | Can independent contributors preserve or explicitly reconcile changes? |
| P2 | Project QA packs and release evidence | Current evidence model; artifact links for richer reports | Do recommended checks catch relevant real application failures? |
| P3 | Broader integrations and distribution channels | Maintainer capacity, conformance and recovery evidence | Does each addition solve a recurring need worth its ongoing cost? |

## Phase 0 — curated public preview

Deliver the brief/story/architecture templates, independent-review prompt and engineering-review checklist through one entry skill and progressive references. Keep their source commits, upstream paths, adaptations and MIT notices beside the distributed content. Documentation must say when to use each procedure and distinguish agent-authored documents from CLI behavior.

Acceptance and evidence gate:

- A packed release installed outside the source tree contains the baseline procedures, notices, runtime and usable help; no external framework is needed to read or execute the core workflow.
- Existing core tests, static checks, packed-install/update/removal checks and version/license consistency checks pass for the release commit.
- A maintainer reviews a real small change and a real ambiguous feature for document usefulness and process overhead. Record what was actually tried; missing use evidence remains a disclosed gap rather than an invented success.
- Public repository/release instructions identify owner, exact tag/archive/checksum, install/update/remove paths, issue/security contact and known support limits. Repository visibility and a published release are distinct states; neither is inferred from a local archive.

Cost: each adapted file becomes a maintained product surface. Keep a change log for upstream updates, review license changes before importing more, and prefer fewer useful sections to copying entire methods.

## Phase 1 — durable state contract and migrations

Define a complete schema contract before adding registry or collaboration fields. Validate nested tasks, acceptance lists, ownership, dependency references, transition states, configured commands and evidence records, with actionable field-level errors. Specify compatibility for unknown optional fields and reject unsupported newer schema versions without writing them.

Add explicit, versioned migration tooling with a preview, an original-state backup, deterministic transformations and recovery instructions. Migration should be a local maintainer/user action, not an implicit destructive rewrite on every read. Separate schema version from product version. Document which released schema versions can upgrade and how backup restoration affects evidence freshness.

Acceptance and evidence gate:

- Versioned fixtures cover valid existing schema-1 state, malformed nested fields, duplicate/missing task IDs, dependency cycles, corrupt JSON and unsupported future schemas. Invalid reads leave original bytes unchanged.
- Migration preserves goals, decisions, lessons, task IDs, acceptance and owners; incompatible evidence is invalidated with a reason. Running the supported migration again is harmless.
- Tests interrupt or fail a write and migration at meaningful boundaries using real temporary files; either the original valid file or the complete new file is recoverable. Locked and linked paths fail safely.
- A recovery walkthrough restores a copied real project state from backup and resumes it. Tests and documented recovery limits must precede a data-safety claim.

Likely change owners: `skills/flowkit/scripts/lib/project.mjs`, shared filesystem helpers, a dedicated schema/migration module, CLI commands, state fixtures and maintenance docs. Keep runtime modules within the installed skill. No database or runtime package dependency is assumed.

## Phase 2 — traceable artifacts and explicit stage gates

Add a small artifact registry that references existing project files rather than replacing their authoring tools. Proposed records need a stable ID, kind, project-relative path, content digest, related task/acceptance IDs, status, superseded record and review/evidence references. Final fields belong in the phase specification. Preserve the project's established docs locations. Generated output and arbitrary external URLs must not silently become trustworthy acceptance evidence.

Represent a stage change as a deliberate request with a human-readable report of missing, current, stale and waived requirements. Define selectable policies for QUICK, STANDARD, DEEP and RELEASE; profiles provide context and must not silently impose enterprise paperwork. Default gates should check minimum required artifacts/evidence and recorded acceptance status. Content correctness still needs review. A waiver needs scope, reason and author; it must remain visible in release reports and cannot grant remote-write authorization.

Acceptance and evidence gate:

- A real bounded feature connects an acceptance criterion to a story, applicable decision, implementation/check evidence and handoff; users can inspect those links without reconstructing chat.
- Missing files, changed content, changed acceptance, broken references, outside-project paths and symlink/junction paths are exercised against temporary projects. A changed required artifact invalidates the affected gate.
- A low-risk QUICK change can complete with relevant checks and recorded acceptance without a product brief or architecture document. A DEEP change with missing required design evidence reports exactly what is missing.
- Gate results separate machine check success, recorded user/maintainer acceptance, independent review, self-review, waived items and unavailable validation. A document's existence does not satisfy semantic acceptance.
- Existing schema-1 projects upgrade through Phase 1; uninstalling the skill preserves project artifacts. Existing task-gate behavior has regression coverage.

Cost: linking artifacts creates upkeep. Start with a short artifact vocabulary and local files; defer graph databases, document editors, automatic PRD generation and model-scored completeness.

## Phase 3 — team edits, conflict handling and recovery

Keep GitHub or another explicit backlog authoritative for its remote status. Local state describes FlowKit coordination and last observed remote facts; it does not silently close issues or reconcile unknown remote changes.

Add revision-aware mutations so a stale client cannot overwrite newer state, then define a reviewable merge/recovery procedure for independently edited branches. Investigate whether stable per-record storage is justified by real merge friction before splitting the state file. Preserve decision history, supersession and provenance. Locks need inspectable ownership and deliberate stale-lock recovery; elapsed time alone does not prove another writer is gone.

Acceptance and evidence gate:

- Actual concurrent local processes demonstrate exclusive writes and explicit stale-revision rejection; neither successful process silently loses the other's committed records.
- Divergent Git branches cover independent task additions, conflicting acceptance edits, task deletion versus update, owner changes and conflicting artifact revisions. Safe merges preserve both records; ambiguous merges report a conflict for review.
- Tests cover crashed writers, abandoned lock files, interrupted recovery and unknown lock owners on supported operating systems. Recovery never guesses that a live owner is dead.
- A two-contributor real project records the conflict and the resolution, and resumes with evidence invalidated where inputs changed. Until that exercise exists, label team behavior as unverified.

Cost: concurrency semantics and recoverability become a continuing support commitment. Do not add a synchronization server, automatic issue mirroring or background remote writes merely to avoid documenting conflicts.

## Continuous gate — actual host conformance

Retain separate evidence levels: file-placement adapter, structural/CLI conformance, and exercised host workflow. Test the artifact users install, record FlowKit version/commit, host/version, OS, date, optional capabilities and limitations. Certification applies to that evidence, not every future host release.

For each advertised exercised host, use a real fresh session to prove discovery, explicit invocation, project inspection, a bounded implementation, configured verification, saved state and fresh-session resume. Also demonstrate missing optional tools, a failing check and stale evidence after a source edit. Exercise owned update/removal and preserve foreign/modified installation files. Record auto-activation only if separately observed; explicit invocation is the baseline contract.

Prioritize Codex regression coverage and one real additional host before expanding the adapter list. Claude Code and Cursor remain installation-only until such sessions are performed. CI path tests cannot substitute for these sessions. If host access is unavailable, keep the gap visible and continue core work; do not invent a conformance transcript.

## Phase 4 — project QA packs and release evidence

Offer opt-in recipes for common project risks, starting with recurring needs from real FlowKit projects. A recipe declares prerequisites, proposed commands, expected environment, relevant user journeys, evidence outputs and known blind spots. It recommends configuration for review; it does not install packages or execute newly discovered commands silently.

Initial candidates are web interaction/responsive/accessibility journeys; API authentication, authorization and data-validation checks; and migration/data-integrity checks. Performance checks need a defined scenario and baseline before any threshold is meaningful. Security scanners and browser checks remain optional capabilities and must report unavailable environments honestly.

Acceptance and evidence gate:

- Each published pack is applied to a real matching application and catches a documented relevant failure or regression. Deterministic negative fixtures may supplement that evidence and are identified as fixtures.
- The pack distinguishes automated checks from manual/browser observations, records exact commands and environments, invalidates outdated outputs and reports skipped checks with reasons.
- An absent browser, unreachable service, empty test suite, failing optional tool and changed test configuration cannot produce a misleading fully validated release report.
- Release output ties acceptance, check results, unresolved review findings, waivers, environment gaps and rollback guidance to the tested change. PR/merge/publication/deployment remain separate authorized operations.

Cost: recipes age with project tools. Version them, name a maintainer, and retire recipes that no longer have current evidence. Keep broad labels such as “secure” or “production-ready” out of check results.

## Later choices requiring their own case

Consider npm publication, host marketplaces, additional host adapters and deeper optional framework integrations only after clean-artifact install/recovery and ownership policies are demonstrated. A new specialist entry point needs a distinct invocation need and validation contract; a new external runtime needs an identified maintainer and removal/update story.

Consider richer discovery facilitation, visual planning, design-system integrations or semantic routing only when ordinary use shows a concrete gap. Each needs an evaluation method with disclosed inputs, failures and interventions. Do not call an English keyword heuristic intelligent routing or claim a generated document is a complete specification.

## Release and documentation policy

- Keep product and schema compatibility explicit. Before 1.0, announce breaking changes and migration/recovery requirements in the changelog; do not assume a minor version permits silent loss of project state.
- Tag immutable reviewed commits; publish allowlisted artifacts with checksums, synchronized versions, included licenses/notices and checks run against those artifacts. Verify actual channel installation before advertising a channel as supported.
- Upstream imports use pinned revisions and an adaptation record. Review source/license differences before updating; never periodically copy upstream main without review.
- Document current behavior in user docs and upcoming behavior here. An agent updates docs as part of a change; FlowKit does not promise autonomous documentation synchronization.
- Retain sanitized, reviewable engineering evidence without committing credentials or private application data. Disclose missing environments and checks that were not run.
- Give each public release an owner, support statement, known limits, security reporting path and rollback instructions. Prefer delaying a support claim to publishing an unverified one.

## Deciding what to build next

After each phase, review ordinary project use: what context was lost, which acceptance claim was unsupported, which gate prevented a real mistake, which documents helped a later contributor, and which process steps were unnecessary. Record negative outcomes too. Choose the next small improvement from that evidence and maintainer capacity. Neither a larger skill count nor more generated artifacts is the product's success criterion.

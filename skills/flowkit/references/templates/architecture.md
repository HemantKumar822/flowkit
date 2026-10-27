# Architecture decisions

Adapted from BMAD Method's architecture spine template, copyright (c) 2025 BMad Code, LLC and contributors. MIT; [full notice](../../third-party/bmad/LICENSE). Exact source and changes: [provenance](../../third-party/sources.json).

Keep the decisions future implementers cannot safely infer from code. Follow the project's existing ADR/architecture convention. A small change may need only one decision; a platform needs more coverage.

## Scope and design pattern
What does this architecture govern? Name the approach and map its boundaries to actual components. Separate the current system from the proposed change.

## Existing constraints
Link inherited rules, existing interfaces, data contracts and relevant requirements. Surface conflicts rather than silently replacing parent decisions.

## Durable decisions
Assign stable decision IDs. For each record:
- **Binds:** affected requirement or component.
- **Prevents:** divergence or failure being avoided.
- **Rule:** the enforceable constraint.
- **Reason and alternatives:** why this choice, and its cost.
- **Evidence/status:** observed, accepted, delegated or still proposed.

## Boundaries and structure
Show dependency direction, data ownership and trust boundaries using a meaningful diagram when helpful. Identify storage, external services, deployment/environment boundaries and failure handling that this scope owns. Do not leave empty diagrams or mirror every source file.

## Consistency conventions
Record only conventions likely to diverge between implementers: IDs, dates, error shapes, naming, configuration, logging, authorization and mutation rules.

## Requirement mapping
Map each important capability to its component and governing decision. Record real versions from project evidence when a version matters; no guessed latest dependencies.

## Deferred choices
Explain what can wait, why it is safe to defer, and which later task or owner must resolve it.

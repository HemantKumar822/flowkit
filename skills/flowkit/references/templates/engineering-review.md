# Engineering review checklist

Adapted from gstack's engineering-review runner checklist and review sections, copyright (c) 2026 Garry Tan. MIT; [full notice](../../third-party/gstack/LICENSE). Exact source and changes: [provenance](../../third-party/sources.json).

Use for a substantial plan or change. Scale depth to risk. This adaptation uses FlowKit/project files and available host tools, not gstack helper programs, telemetry, fixed home directories or required outside-model services.

## Fix the scope first
Name the target, what already exists and what is outside scope. For a plan, distinguish future implementation from existing behavior. For a diff, trace actual entry points and affected callers. Identify evidence for important claims; mark unknowns explicitly.

## Review the relevant dimensions
1. **Architecture:** ownership, dependencies, contracts, trust boundaries, operational environment and failure recovery.
2. **Code quality:** clarity, duplication, complexity, error handling and compatibility. Prefer a focused complete solution over premature machinery.
3. **Tests:** acceptance mapping, negative/boundary cases, integration paths and what a unit check cannot establish. Separate the proposed test plan from observed results.
4. **Performance, when relevant:** identify the real bottleneck, affected workload and measurement needed. Do not invent latency or savings; do not turn a harmless edit into a benchmark project.

## Keep a usable review record
Use the requested destination or the project's existing review convention. Include scope, evidence, diagrams only when useful, failure modes, test plan, findings, decisions and unresolved questions. Permission to write a report does not authorize editing implementation or other files. If persistence is unavailable, label the report not persisted.

For each finding, record severity, confidence, file/line or plan section, impact and disposition. Existing user decisions remain authoritative unless contradictory evidence or a new consequential risk requires revisiting them. An independent opinion is optional and must actually run before being claimed.

## Finish
Summarize blockers and acceptance evidence. State a dependency/ownership plan only when parallel work adds value. Leave the next useful implementation or QA task, and save a concise reusable lesson only when supported. A written checklist is not a mechanically enforced release gate; FlowKit's configured checks and human acceptance remain separate.

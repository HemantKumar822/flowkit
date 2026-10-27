# Baseline engineering methods

These original, compact procedures let FlowKit function without a separately installed method framework. They do not reproduce the full Superpowers library or its depth. Prefer applicable installed methods and repository conventions when present.

For a clear narrow change: inspect the affected code and callers, make the smallest complete edit, then inspect the diff and run the relevant existing check. Do not manufacture a backlog or permanent test for a trivial prose correction.

For a feature: define an observable outcome and acceptance, inspect existing patterns and failure paths, split only genuinely independent work, and select checks that distinguish correct behavior from the actual failure. For meaningful behavior changes, observe a failing regression before implementation when feasible; implement, rerun, then inspect the integrated result. A passing assertion that mirrors code is weak evidence.

For uncertainty: identify users/problem and constraints, inspect project evidence, compare plausible approaches and record the choice. Ask about consequential unresolved policy/product decisions; use delegated choices where authorized. Save concise requirements, architecture decisions and next tasks that another developer can use.

For debugging: reproduce the symptom, capture actual failure evidence, inspect the data/control path, form a specific hypothesis and test it. Correct the cause, run the regression and relevant neighboring checks. Stop random edits when evidence contradicts the hypothesis.

For review: inspect the diff against acceptance, input/trust boundaries, callers, error paths and test coverage. Use a separate reviewer for important changes when available and authorized. Otherwise disclose self-review. Interface work requires real rendered interaction evidence when browser access exists; if unavailable, report the gap. Security-sensitive work needs denial/isolation/abuse cases appropriate to the project.

For handoff: after final source changes, run current checks, distinguish observed acceptance from inferred behavior, record failures/unknowns, and leave the next useful action. Readiness is engineering evidence for human review, not authorization to merge or deploy.

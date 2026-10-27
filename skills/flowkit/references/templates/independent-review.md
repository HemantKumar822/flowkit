# Independent change review

Adapted from Superpowers' code-reviewer prompt, copyright (c) 2025 Jesse Vincent. MIT; [full notice](../../third-party/superpowers/LICENSE). Exact source and changes: [provenance](../../third-party/sources.json).

Use for a meaningful completed change. Select a separate reviewer when the host supports it and current authority permits it; otherwise disclose self-review. Do not simulate an independent reviewer or recursively add review seats without authorization.

## Give the reviewer
- The intended outcome and acceptance requirements.
- The plan/architecture constraints and actual implementation summary.
- Verified base/head revisions or the precise uncommitted diff/file scope.
- Relevant evidence, known limitations and permitted read-only tools.

## Reviewer contract
Inspect actual changed code, surrounding callers and tests. Keep the checkout, index, HEAD and branch read-only; use a separate temporary checkout for experiments if needed and authorized. Do not treat a source's silence as permission for unreasonable user-visible behavior, or invent unrelated product requirements.

Assess requirement alignment, justified deviations, separation of concerns, error paths, trust boundaries, backward compatibility, migrations and documentation. Tests must distinguish correct behavior from the failure, with integration coverage where it matters. Proposed tests and passing tests are different evidence.

## Return
1. Specific strengths supported by inspected code.
2. Findings grouped as critical, important or minor, calibrated by actual impact.
3. For each finding: file/line, trigger, wrong behavior, consequence, evidence and a focused remedy when clear.
4. Behaviors considered but declined to judge, with reasons; do not silently discard them.
5. Check results, unrun work and unknowns.
6. A clear assessment: ready, ready after named fixes, or not ready, with technical reasoning.

Do not endorse code you did not inspect or label every style preference critical. A merge assessment is review evidence, not authority to merge, publish or deploy. The implementer triages findings, records disposition and reruns relevant checks after fixes.

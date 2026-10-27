# Project documents and memory

Use existing project locations and conventions first. The following are examples of useful artifacts, not a requirement to generate every file. Update existing documents rather than create competing copies.

| Situation | Document or record | Keep it useful |
| --- | --- | --- |
| New product or unclear scope | Brief/requirements, such as docs/requirements.md | Intended users, problem, MVP, constraints and observable acceptance |
| Meaningful architectural choice | Architecture notes or an ADR | Chosen approach, alternatives and consequences |
| Work spanning several changes | Implementation plan and scoped tasks | Order, dependencies, owner, acceptance and verification |
| New repository | README, contributor guidance and repository instructions | Setup, operation, conventions and actual checks |
| User-facing or risky change | QA/review evidence | Actual journeys, failures, screenshots when relevant and unresolved risks |
| Release or interrupted work | Release checklist or handoff | Current checks, environment/rollback needs, blockers and next action |
| Every meaningful coordinated task | .flowkit/project.json | Goal, lifecycle, acceptance, dependencies, decisions, lessons and check results |

QUICK edits normally need only the relevant change and verification. STANDARD work records acceptance and updates affected documentation. DEEP work needs enough requirements, architecture and planning to resolve its uncertainty. RELEASE collects evidence and a usable handoff. Do not call an unrun check complete or manufacture approval text.

The agent writes semantic project documents; the CLI does not generate a complete PRD or architecture automatically. The CLI creates basic scaffolding with init --new and persists structured state through its commands. Verify the documents agree with implemented behavior and update stale decisions.

Memory is explicit and local to the project. Save concise decisions and lessons, not the whole conversation. Read saved state and inspect current source when resuming; old check results may be stale. Commit reviewed state/documents for shared continuity. There is no vector database, model retraining, automatic cross-project memory or background synchronization. Global installation shares procedures, not private project content.

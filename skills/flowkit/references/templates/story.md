# Story and acceptance

Adapted from BMAD Method's ticket template, copyright (c) 2025 BMad Code, LLC and contributors. MIT; [full notice](../../third-party/bmad/LICENSE). Exact source and changes: [provenance](../../third-party/sources.json).

Use this as a project story or issue draft. FlowKit's task state owns execution status; GitHub owns remote issue status. Do not introduce a second tracker file format merely because the source template had one.

## Outcome
As a [user], I want [capability], so that [benefit]. Explain how it advances the project goal.

## Requirements and sources
Name the requirements this story proves and link their actual source sections. Mark assumptions or conflicting requirements explicitly.

## Observable acceptance
For each behavior:
- Given [relevant starting state].
- When [one action occurs].
- Then [observable result].
- Include failure, denial, empty and boundary behavior where applicable.

## Boundaries
List adjacent behavior that must remain unchanged. State exclusions and constraints beyond the parent requirement.

## Dependencies and owner
Identify prerequisites, why they block this work, and the responsible person/agent. Use actual returned FlowKit task IDs or real issue numbers; do not invent identifiers.

## Validation
State how each criterion will be checked: an existing command, a regression, a real user journey or manual evidence. Keep proposed checks separate from observed passing results.

## Open questions and handoff
Record assumptions, unknowns, deferred decisions and acceptance evidence. Once answered, update the source of truth and link it rather than accumulating stale notes.

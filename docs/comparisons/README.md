# What the source comparison supports

Inspected 2026-10-27. These are implementation comparisons, not benchmark scores or simulated productivity trials. Full reports link pinned primary source files:

- [BMAD](bmad-packaging.md): preview `61e01f8` differs from stable installer `bab9082`; canonical skills/modules plus host adapters, configuration/setup lifecycle and versioned releases.
- [gstack](gstack-packaging.md): `a50cf589656c0dc3f785af9b7c483861b13c8288`; templates/generation, explicit host capabilities, conformance tests, install ownership and host certification tiers.
- [Superpowers](superpowers-packaging.md): `2ce8aa15d05bd57213e6f746f953aafb7ded7a8b`; shared skill library with distinct host bootstrap/tool mapping, manifests and versioned allowlisted release tooling.

The detailed reports describe the initial FlowKit 0.1 distribution gaps at audit time. The 0.2 work addresses a subset: explicit install targets/scopes, optional dependency discovery with a bundled baseline, manifests, MIT license/notices, version synchronization, allowlisted archives/checksums, real packed-install tests and user documentation. It does not inherit upstream workflow breadth or host certification.

## Recommendation

Keep one clear FlowKit entry skill and separate procedures. Skill count is not a measure of capability. Split a specialist into another entry skill only when it needs independent user invocation, discovery or lifecycle. Keep integrations optional rather than maintaining copied upstream frameworks.

Recommend FlowKit now for our own Codex work and as an early developer preview for users who want durable local state and current check evidence. Do not recommend it as a universal replacement for BMAD, gstack or Superpowers. BMAD offers deeper product/architecture workflows; gstack supplies a richer opinionated toolkit; Superpowers supplies detailed engineering methods that FlowKit can use. Broad host support requires actual fresh-session workflows beyond path tests.

Its plausible efficiency benefit is avoiding lost context, unclear next tasks, unnecessary process on small changes and stale-success handoffs. Those mechanisms can reduce rework. Their net effect depends on the project: maintaining state and running tools also costs effort, and stricter verification may make an individual task take longer while improving reliability. Source comparison establishes no speed, token/cost saving or overall ranking. No such numbers or fabricated benchmark have been produced.

Next evidence should come from ordinary real use: observe recurring friction and defects, keep useful changes small, and validate them. Publication is a separate maintainer decision; a package can be ready for review without being ready to promise support to everyone.

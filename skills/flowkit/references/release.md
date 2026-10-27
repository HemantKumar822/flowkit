# Release preparation

Select checks based on project and risk: existing unit/integration tests, build/type/lint, main user journeys, responsive screenshots, keyboard/accessibility, and appropriate security checks. Auth/payment/data boundaries require abuse and isolation cases plus review. Use Gitleaks CLI and a focused dependency/SAST tool when applicable; inspect provenance/version/license before installing. No scanner is a guarantee.

Run `verify` after final changes. `release` rejects failed/stale evidence and unfinished tasks; its `ready` field means engineering evidence is ready for human review. It does not record human signoff, authorize a release, or replace checking production configuration.

Review: secrets and environment variables, migrations/backups, health checks, least privilege, rate limits where needed, dependency licenses, critical journeys, deployment/rollback commands, monitoring, known limitations and owner. A hackathon still needs working journeys and secret hygiene; a production app needs operational recovery evidence. Document excluded checks and why.

Prepare artifacts and a concrete deployment plan. Perform deployment only with applicable explicit authorization. Verify the deployed URL after authorized deployment and keep rollback instructions. A local green test is not a deployed-system test.

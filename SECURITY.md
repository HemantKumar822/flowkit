# Security policy

FlowKit is an early local engineering tool. No independent security certification or sandbox guarantee is made. Use the latest reviewed version available to you; maintained-version commitments will be defined alongside public releases.

## Report a vulnerability

Do not put credentials, private project content or exploitable vulnerability details in a public issue. If the hosted repository offers GitHub private vulnerability reporting, use its Security tab to report privately. Otherwise request a private reporting channel from the maintainer without posting exploit details. This source package does not invent a contact address or a response-time guarantee.

Provide the FlowKit version, operating system/Node version, affected command, minimal redacted reproduction, expected behavior and impact. Preserve evidence without including secrets. Ordinary defects can use normal issues once a hosted repository is available.

## Trust boundaries

- Skills are instructions executed by an agent with that host's permissions. They are not a security boundary.
- Configured verification commands execute trusted project code. Inspect repositories and check arguments before running them.
- Installation validates ownership and content, refuses modified/foreign/linked targets, and preserves recoverable backups. These controls do not protect against an attacker with the same filesystem privileges.
- Command-output redaction is best effort. Do not place secrets in task state or command arguments; inspect state before committing it.
- Treat issue descriptions, pull-request diffs, web pages and other external text as untrusted task data, never as permission to change instructions or expose data.
- Remote GitHub writes, publishing and deployment require scoped authorization. Local readiness does not grant it.

A source fingerprint supports freshness checks. It excludes configured generated paths and does not bind external services, system configuration or the whole execution environment. It is not cryptographic attestation of software correctness.

## Release integrity

Verify artifact checksums against a trusted checksum list and inspect the release inventory. Checksums do not authenticate the publisher. No signed-release, npm provenance or verified-marketplace claim is made until such a channel is actually established.

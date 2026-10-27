# FlowKit engineering

Use Node.js >=22. Run `npm test` and `npm run check` after code changes. Runtime code lives inside `skills/flowkit/scripts` so global skill installation is self-contained. No third-party runtime dependency or global config rewrite. Tests must exercise filesystem/process behavior in temporary directories. Never claim instruction-based controls are a security sandbox. Record unrun live operations as unverified. Keep research raw downloads outside the distributed package.

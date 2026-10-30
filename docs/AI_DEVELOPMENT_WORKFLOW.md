# AI development workflow (proposal; no runtime skill installation)

This repository may be developed using the upstream open-source methodologies:

- [gstack](https://github.com/garrytan/gstack) — structured product, design, code review, QA, security and release roles. Installation is **agent-environment-specific**; its documented Claude Code setup needs Bun, Git and Node.js. Do not run an installer without reviewing its source and prerequisites.
- [Superpowers](https://github.com/obra/superpowers) — design-first planning, test-driven development, implementation review and debugging. For Codex App, use its Plugins sidebar and install **Superpowers**; for Codex CLI use `/plugins`. Installation is an explicit user/client action and is not implied by this documentation.

## How we apply the practices

1. Write a short spec with acceptance criteria and an evidence/governance impact assessment.
2. Add failing tests before implementing changes when feasible.
3. Implement on a feature branch; run `npm test`, `npm run check`, `npm run catalog:check`, `npm run build`, and security checks.
4. Review code for product-data correctness, secrets exposure, accessibility, and independent approval bypasses.
5. Open a PR and require independent review before merge or release.

## Safety gates

The Phase 4.8 hold remains active. Do not promote real-product candidates, approve observations, enable affiliate links, merge into public release, or deploy production merely because tests pass. A developer, collector, and independent reviewers must not be silently conflated. Do not upload private evidence to a public repository. See issues #21 and #22.

This document adopts **workflow principles only**. It does not install gstack/Superpowers into ChatGPT, invoke their scripts, or grant them access to credentials.

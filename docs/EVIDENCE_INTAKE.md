# Research evidence intake — draft quarantine

The research planner creates **assignments only**. Research collectors may later submit JSON arrays to `scripts/research-evidence-intake.mjs`, passing a generated queue JSON file and a submission JSON file. The intake validates task identity, market, source kind, HTTPS source URL, SKU, price format and observation timestamp. Valid records are marked `pending_review` and `publicationAuthorized: false`.

This is a **local validation and review-artifact interface**, not a live crawler, secure evidence vault, authorization decision, or affiliate integration. Input is untrusted; do not use source URLs to fetch arbitrary content without SSRF defenses and explicit allowed domains. Avoid putting personal data, secrets or licensed media into GitHub Actions artifacts. Evidence files and reviewer credentials must move to private versioned encrypted storage before operational collection. Independent reviewers and the Phase 4.8 hold remain required.

Example: `node scripts/research-evidence-intake.mjs artifacts/research-queue-2026-10-31.json private-submissions.json`.

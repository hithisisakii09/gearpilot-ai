# Evidence ledger — offline integrity only

`scripts/evidence-ledger.mjs` converts a fully validated `research-evidence-review.json` intake artifact into a deterministic SHA-256 hash-chained ledger. It rejects records not pending review or with publication permission, and verifies its own integrity. Run `npm test -- --run scripts/evidence-ledger.test.mjs` before using it.

This is **not** an immutable audit log: anyone who can replace both the ledger and its hash can rewrite history. The ledger is neither encrypted nor access-controlled, and it is **not** evidence of third-party approval. For production, anchor hashes outside the mutable artifact, sign attestations, store evidence in private versioned encrypted storage, enforce authenticated independent approvals and retention policies. Do not place secrets, personal data, or copyrighted page copies in CI artifacts. Phase 4.8 hold remains in force.

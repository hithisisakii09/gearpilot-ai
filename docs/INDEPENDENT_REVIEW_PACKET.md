# Independent evidence review packet (preparation only)

Run `node scripts/evidence-review-packet.mjs artifacts/evidence-ledger.json` after generating and verifying a ledger. The output is a **local unapproved packet**, not a review decision. It includes evidence hashes, a ledger root, provenance fields, and a proposed two-authenticated-reviewer plus independent-collector policy. No reviewer identity, credential, approval or authorization is inferred or issued.

The audit detects packet modifications relative to a supplied verified ledger, but **does not independently authenticate or secure either file**. The output is not encrypted, signed, immutable, or suitable for storing sensitive source content. Independent reviewer selection remains undecided; do not bypass Phase 4.8, activate affiliate links, publish offers, or launch production.

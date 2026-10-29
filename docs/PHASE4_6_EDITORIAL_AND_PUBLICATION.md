# Phase 4.6 editorial and publication status

No new product evidence, collector identity, independent reviewer, or explicit product-scoped owner authorization was supplied. No observation was ingested, reviewed, approved, or promoted.

Existing workflow remains authoritative:

1. A real collector records exact configuration facts and primary manufacturer source URLs with actual UTC capture times. Any unknown field remains unknown.
2. The existing `observations:ingest` command validates the collection and keeps new evidence pending review. Do not use invented identities, sample data, or timestamps.
3. A different authorized human reviews provenance and exact variant through `observations:review`. Approval of a commercial observation does not itself verify the product.
4. Product verification/editorial approval and explicit owner authorization are separate requirements for `buildPublicProductProfile`.
5. A product-only informational profile remains separate from offer eligibility and affiliate approval. Branch remains pending; no affiliate URL or offer was enabled.

There is no Phase 4.6 real profile or production route. The existing synthetic preview remains development-only and excluded from production.

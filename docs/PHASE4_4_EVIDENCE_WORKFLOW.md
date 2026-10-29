# Phase 4.4 evidence intake and review workflow

The existing observation CLI and Zod contracts remain the source of truth. No parallel evidence store or automatic approval path was added.

## Manual collection

1. On the normal official US manufacturer website, choose one purchasable variant. Record the exact model, frame, desktop size/material/finish, selected accessories/options, and displayed SKU or an unambiguous variant identifier.
2. Record separate source URLs and the actual UTC time observed for identity/specifications, price, mandatory shipping to a defined US delivery region, availability, warranty, and returns. Leave unsupported fields UNKNOWN/null; do not infer them from generic policy text.
3. Use the actual named human collector in `collectedBy`. Keep observation status `draft` or `pending_review`, `reviewer` and `reviewedAt` null, and include source URL, evidence notes, and non-sensitive provenance. Do not commit screenshots containing account, address, order, tax, payment, or identity information.
4. When a candidate assessment has an exact configuration, update it in the intake JSON to exactly match the observation configuration, including ID, label, model, SKU, dimensions, and selected options. Assessment updates are merged by product ID; future-dated or older-than-current assessments are rejected.

## Validate and ingest

```powershell
npm.cmd run observations:ingest -- --input path\to\intake.json --collector "REAL COLLECTOR NAME" --ingested-at "ACTUAL-CANONICAL-UTC-TIMESTAMP" --dry-run
npm.cmd run observations:ingest -- --input path\to\intake.json --collector "REAL COLLECTOR NAME" --ingested-at "ACTUAL-CANONICAL-UTC-TIMESTAMP" --write --confirm-ingest
```

Replace placeholders with genuine values; do not execute with placeholder identities or timestamps. Review the dry-run output and validate the resulting collection before proceeding. Ingestion records observations as pending and does not approve or promote an offer.

## Independent editorial review

An authorized human other than the collector reviews source, exact variant, observation time, price/shipping/availability completeness and freshness. A reviewer's decision uses the existing separate CLI command:

```powershell
npm.cmd run observations:review -- --id OBSERVATION_ID --decision approved --reviewer "DIFFERENT AUTHORIZED HUMAN" --reviewed-at "ACTUAL-CANONICAL-UTC-TIMESTAMP" --dry-run
```

Only after reviewing the dry run may the reviewer deliberately use `--write --confirm-review`. Approval is not product verification, offer eligibility, owner publication authorization, or affiliate-program approval. The existing catalog promotion and affiliate safeguards remain separate.

## Phase 4.4 intake hardening

When an intake package includes a non-null candidate assessment configuration, observations must match the complete assessed configuration. Intake packages may update assessments by product ID, enabling a newly observed exact variant to be recorded in the same package. Incoming observations still require an explicit collector and remain unreviewed; reviewer identity cannot equal collector identity.

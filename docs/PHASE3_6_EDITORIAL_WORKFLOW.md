# Phase 3.6 editorial evidence review workflow

## Implemented

- `CommercialObservationSchema` now records an explicit `rejectionReason`; rejected records require a non-empty reason, and approval/unreviewed states cannot carry one.
- `CommercialObservationSchema` records `collectedBy`. A terminal editorial decision requires a named collector and a different named reviewer.
- `EditorialReviewEventSchema` defines a review event with observation ID, collector, decision, named reviewer, UTC review timestamp, source URL, evidence timestamp, and rejection rationale.
- `ObservationCollectionSchema` defaults a missing `reviewEvents` list to empty for backward compatibility. Terminal decisions require a matching audit event. It rejects duplicate event IDs, multiple terminal decisions for one observation, unknown observation references, and event/observation provenance mismatches.
- `applyEditorialDecision` permits only a single transition from `draft`/`pending_review` to `approved` or `rejected`. It rejects future/pre-evidence decision times and requires a reason for rejection.
- Approval is blocked unless price is present and fresh within seven days, shipping amount/status is known, and availability is known and fresh within three days. Existing source-quality schema checks still reject `unverified` evidence.
- The new `observations:ingest` command accepts only identified, unreviewed evidence, performs reference/duplicate/conflict checks, and defaults to non-mutating `--dry-run`; persistence requires `--write --confirm-ingest`. Ingesting evidence cannot supply an editorial decision.
- The new `observations:review` CLI command defaults to non-mutating `--dry-run`; persistence requires `--write --confirm-review`. It changes only review state and appends the corresponding event. It never updates the product catalog, offers, or affiliate registry.
- Existing duplicate/conflict detection remains part of observation validation. It prevents accepting duplicate/conflicting batches; it does not assert that every discrepancy can be resolved automatically.

## Reviewer procedure

1. Evidence collector records the exact product/configuration/SKU, source URL, UTC observation timestamp, source notes, explicit `collectedBy` identity, and unknown fields. Collection alone must leave the record `pending_review`.
2. Prepare a collection JSON containing the new observations and no review events, then preview and explicitly persist it:

   ```powershell
   npm.cmd run observations:ingest -- --input "C:\path\to\prepared-observations.json" --collector "Named collector" --ingested-at "2026-10-29T12:00:00.000Z" --dry-run
   ```

   Replace `--dry-run` with `--write --confirm-ingest` only after reviewing the validation output. Evidence timestamps must not postdate ingestion.
3. A different authorized human independently checks the exact source and relevant commercial/policy facts. Do not use the collector identity as an implicit review.
4. Preview the decision before writing:

   ```powershell
   npm.cmd run observations:review -- --id vari-essential-401512-20261029 --decision rejected --reviewer "Authorized reviewer name" --reviewed-at "2026-10-29T12:00:00.000Z" --reason "Current source did not expose the selected SKU facts." --dry-run
   ```

5. After confirming the review evidence, persist explicitly by replacing `--dry-run` with `--write --confirm-review`. Approved evidence requires fresh price/shipping and stock evidence; a rejection requires an explanatory reason.
6. Run `npm.cmd run observations:validate` and inspect the appended event. A review decision is not product verification or offer promotion.
7. Keep any later product verification, offer publication, structured data, and affiliate activation as separately approved changes under their own eligibility gates.

## Limitations

The event list is an append-only application workflow, not tamper-proof storage: a repository editor could modify JSON or rewrite Git history. Collector/reviewer identities are supplied names and are not cryptographically authenticated. Enforce identity through normal repository access controls, protected review practices, and GitHub audit history. Never store secrets or private reviewer data here.

## Current state

No event has been recorded. Both existing Vari observations remain pending and have no named collector identity in the persisted records (`sourceMetadata.capturedBy` is only `manual_review`). Do not retrofit an assumed identity to those old observations; collect fresh evidence as new records with an attributable collector before independent review. All ten candidate products remain partially verified, and no product/offer was promoted.

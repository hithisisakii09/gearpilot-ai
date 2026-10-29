# Phase 3.3 price and availability architecture

## Safety boundary

Phase 3.3 adds a local, Git-reviewed evidence pipeline. It does not scrape on a schedule, call private APIs, store credentials, alter production, approve affiliate programs, or turn technically valid evidence into a verified offer automatically. The public finder continues to render only `src/data/demo.json`.

## Data flow

1. `src/data/candidates.json` remains the ten-product research catalog.
2. `src/data/observations.json` stores configuration-bound commercial observations and one assessment per candidate.
3. `ObservationCollectionSchema` validates shape, HTTPS provenance, UTC timestamps, USD cents, review metadata, shipping semantics, and unique IDs.
4. `validateObservationReferences()` checks product/manufacturer/model relationships. Duplicate and conflict detectors run separately so structurally valid but contradictory evidence cannot pass review unnoticed.
5. `getOfferEvidenceIssues()` is the shared real-offer gate used by recommendations and affiliate resolution. It requires an exact configuration plus matching, approved, fresh price/shipping and in-stock observations.
6. Quality reporting counts evidence completeness independently from affiliate approval.

## Contracts

- Unknown price and mandatory shipping remain `null`; `shippingStatus: "unknown"` may never carry zero cents.
- Explicit free shipping is `shippingStatus: "free"` with `mandatoryShippingCents: 0`.
- Availability supports `in_stock`, `out_of_stock`, `preorder`, `discontinued`, and `unknown`.
- Every commercial observation identifies product, offer, manufacturer, merchant, exact model/configuration, selected options, URLs, UTC observation time, evidence quality, review state, and source metadata.
- `pending_review` evidence can be fresh and useful for research, but only `approved` evidence with reviewer identity and timestamp can make a verified offer eligible.
- Affiliate approval remains an additional independent gate; it never affects ranking score.

## Freshness

- Price and mandatory shipping: seven days.
- In-stock availability: three days.
- Specification review: due on a documented change or at 180 days.
- A timestamp after the supplied clock is never fresh. Schema ingestion also rejects timestamps more than 36 hours ahead of system time.

All freshness functions accept an explicit `Date`, so CI and reporting are deterministic across timezones.

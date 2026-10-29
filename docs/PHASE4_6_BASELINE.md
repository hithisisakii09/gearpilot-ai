# Phase 4.6 baseline

- Fetched `origin/main`; clean baseline is `bde1c8a61c0b15c8ac6fdf92bedd758267ebcff1` (Phase 4.5 PR #17).
- Created `feature/phase4-6-first-verified-product` from that commit.
- Existing state: 10 partially verified research candidates, 0 verified real products, 0 offers, 2 historical Vari observations pending review. Branch CJ advertiser 5885920 remains `pending`.
- Reused architecture is already present: `ProductSchema` and source references, `ObservationCollectionSchema`, `observations:ingest` / `observations:review`, `buildPublicProductProfile`, and `ProductProfile.astro`.
- The profile builder separately requires a verified exact product, cited official manufacturer evidence, independent product editorial approval, current specifications, and product-scoped owner authorization. It creates no offer or commerce action.
- Owner-confirmed contact remains `gearpilotai.contact@gmail.com`.

No product or affiliate records were changed during research.

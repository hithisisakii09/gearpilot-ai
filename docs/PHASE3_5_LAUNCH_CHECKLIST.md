# Phase 3.5 human launch checklist

## Repository and CI

- [x] Start from latest fetched `origin/main` and preserve clean initial worktree.
- [x] Create Phase 3.5 feature branch from merged Phase 3.4.
- [x] Run all Phase 3.5 validation commands and record actual results in `PHASE3_5_TEST_REPORT.md`.
- [ ] Push branch and open a draft PR; confirm CI completes with least privilege.
- [ ] Review changes and PR independently; do not merge/deploy without release authorization.

## Owner, privacy, and legal

- [ ] Supply legal site operator identity, jurisdiction, and a monitored public privacy/corrections contact.
- [ ] Verify Cloudflare account/zone, applicable data processing terms, request log/security data handling, retention, sub-processors/transfers, and relevant user rights procedures.
- [ ] Obtain qualified legal/privacy review of notices, privacy/cookie requirements, affiliate disclosures, merchant terms, and target jurisdictions.
- [ ] Keep analytics disabled until the owner authorizes a specific configuration and counsel/privacy review approves disclosures and retention.

## Product and affiliate data

- [ ] Independently review/reject both pending Vari observations against exact current SKU/source and price/shipping/stock context.
- [ ] Capture all missing exact configurations, current prices, mandatory shipping, availability, warranty and return policy evidence candidate by candidate. Retire invalid sources rather than guess.
- [ ] Require separate editorial promotion to verified status after all schema, provenance, freshness, and human approval gates pass.
- [ ] Do not create real product/offer schema or landing pages unless verified facts are visible and current.
- [ ] Keep all eight programs not applied unless owner explicitly approves applications; record official approval and safe credential references before any link.
- [ ] Verify destination domains, current offer, disclosure placement, and ranking independence before any monetization.

## Accessibility, security, and performance

- [ ] Human keyboard-only and screen-reader testing; test actual 200%/400% zoom, contrast states, high contrast/reduced motion, touch interactions, and validation/error messages.
- [ ] Verify CSP/security headers and Workers `404-page` behavior in an authorized preview; assess the inline-style CSP exception.
- [ ] Run Lighthouse on authorized preview and record actual mobile/desktop scores; measure field Core Web Vitals only with approved privacy configuration.
- [ ] Review the existing finder JavaScript bundle before adding further client features.

## Production and search

- [ ] Verify rendered public URLs and headers on preview before production.
- [ ] Confirm intended sitemap/indexability after privacy/contact/legal copy is finalized.
- [ ] Submit to Search Console only with owner authorization; do not claim indexing/ranking before evidence.
- [ ] Deployment, production settings, analytics activation, offer promotion, and affiliate activation are NOT authorized by Phase 3.5.

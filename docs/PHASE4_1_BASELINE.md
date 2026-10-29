# Phase 4.1 baseline

## Repository

- Baseline: Phase 4.0 PR #12 merge commit `34b34715751b6e37660d5896d806166a5ef06e9f`.
- Fetched `origin/main`, confirmed it matched local `main`, and confirmed a clean worktree before creating `feature/phase4-first-launch-blockers`.
- No production settings, account, tracking, application, or catalog records were changed at baseline.

## Repository data counts

Verified from the checked-in JSON at baseline:

- Research candidates: 10.
- Historical observation records: 2; both are `pending_review` (Vari records).
- Verified real products: 0.
- Commercial eligible offers: 0.
- Affiliate registry: 8 merchants, all `not_applied`; 0 approved programs and no active affiliate link state.
- Synthetic demo catalog: 3 products and 3 offers, separated from research candidates and clearly labeled in the UI.

The demo offer records are not commercial offers and must not be counted as verified products or eligible affiliate offers.

## Existing gates and public surfaces

Existing product eligibility, evidence freshness, independent editorial review, approved-program destination checks, and commission-independent ranking are retained. The public routes include Home, About, Contact, Privacy, Affiliate Disclosure, Methodology, and the standing-desk fit guide. Contact is intentionally noindex while no real monitored contact exists.

Phase 4.1 keeps merchant statuses and historical Vari observations unchanged. Owner-reported CJ account details are recorded as owner observations only; no sensitive tax/payment material is copied into this repository.

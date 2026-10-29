# Phase 3.9 baseline audit

Baseline verified 2026-10-29 against fetched `origin/main`.

## Repository

| Item | Result |
| --- | --- |
| Starting branch | `main` |
| Starting commit | `cd7edc44311a84a4277f06e9fbeb60016d526571` |
| Fetched `origin/main` | `cd7edc44311a84a4277f06e9fbeb60016d526571` |
| Initial worktree | Clean |
| Feature branch | `feature/phase3-merchant-onboarding`, created from `origin/main` |

No previous user changes were present or overwritten.

## Baseline data counts

Validated from `src/data/candidates.json`, `src/data/observations.json`, `src/data/affiliate-programs.json`, and the Phase 3.8 schema/workflows:

- **Research candidates:** 10.
- **Historical Vari observations:** 2, both `pending_review`; preserved unchanged.
- **Verified catalog products:** 0.
- **Real catalog offers:** 0.
- **Approved affiliate programs:** 0 of 8.
- **Active affiliate links:** 0.
- Public finder remains synthetic demo data.

Source verification of Branch Duo and FlexiSpot E7 did not establish a current exact sellable variant with complete commercial evidence. The two Vari observations are historical pending records and are not current offer assertions.

## Existing gates

- `src/lib/schema.ts`: source provenance, product editorial approval, named collector/reviewer, commercial observations, and exact-configuration policy evidence.
- `src/lib/observations.ts` and `scripts/observations.ts`: explicit dry-run/persist workflows and independent editorial decision audit. Observation approval does not promote a product or create an offer.
- `src/lib/eligibility.ts`: shared product/offer eligibility; price and shipping freshness are 7 days, stock 3 days; missing/stale/unreviewed/conflicting evidence blocks eligibility.
- `src/lib/affiliate.ts`: only an approved active US program and allowlisted HTTPS destination may resolve; output carries `sponsored nofollow noopener noreferrer`.
- `src/lib/recommend.ts`: score uses product/offer facts and does not use commissions or affiliate status.
- `tests/recommend.test.ts`, `tests/affiliate.test.ts`, `tests/observations.test.ts`: existing regression coverage. Phase 3.9 adds an explicit dry-run diagnostic for Branch/FlexiSpot and assertions against observation-to-product promotion and not-applied registry links.

## Release status

Real-product publication and monetization remain blocked. Required product identity/configuration, fresh commercial observations, applicable policy evidence, separate editorial approval, and program approval are not present for any real candidate. The owner/operator identity, monitored contact, hosting retention/data-processing facts, and qualified privacy/legal review remain incomplete.

## Scope decisions

Phase 3.9 changes documentation and adds regression tests for concrete publication-gate behavior. It does not alter catalog/observation/affiliate data, public copy, affiliate status, ranking logic, analytics, or production configuration. The evidence reports and owner actions are in the other Phase 3.9 documents.

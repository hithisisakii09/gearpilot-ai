# Phase 3.8 real-offer publication gates

## Implemented code gates

Real recommendations and affiliate resolution share `isVerifiedOfferEligible` from `src/lib/eligibility.ts`.

1. **Product identity and specification:** `ProductSchema` now requires a verified official source-backed identity, verified provenance for every documented specification, and a product editorial approval naming a collector distinct from the reviewer. Approval cites source IDs and cannot predate those sources.
2. **Exact offer configuration:** a verified offer requires `configurationId`. Price, shipping, and stock observations must match that exact configuration and their offer snapshot.
3. **Fresh commercial evidence:** approved price/shipping evidence must be no more than 7 days old; in-stock evidence must be no more than 3 days old. Missing, stale, future, conflicting, or unreviewed facts block eligibility.
4. **Independent collection and review:** reviewed price, stock, warranty, and return evidence requires a named collector distinct from the human reviewer. Product editorial review has the same independence requirement.
5. **Configuration-applicable policies:** verified offers require separately sourced, independently approved warranty and return-policy evidence for the same configuration. Missing, pending, future-reviewed, or configuration-mismatched policy evidence blocks eligibility.
6. **Affiliate authorization:** `resolveAffiliateLink` additionally requires an eligible verified product/offer, approved active US affiliate program, matching merchant, credential reference, and HTTPS destination within the approved exact/subdomain allowlist. It returns `sponsored nofollow noopener noreferrer`; it does not create tracking IDs or parameters.
7. **Ranking independence:** `recommend` uses price/specification/evidence preferences and does not use commission or affiliate program terms.

`getOfferEvidenceIssues` returns explicit blockers. Schema-level validation also rejects a verified product/offer with missing approval/policy evidence. An approved commercial observation alone does not set product status, establish the offer, approve an affiliate program, or activate a link.

## Verification surfaces

- Product, offer, and evidence contracts: `src/lib/schema.ts`
- Shared freshness and publication reasons: `src/lib/eligibility.ts`
- Editorial collection/review workflow: `src/lib/observations.ts` and `scripts/observations.ts`
- Recommendations: `src/lib/recommend.ts`
- Affiliate link resolver: `src/lib/affiliate.ts`
- Regression tests: `tests/recommend.test.ts`, `tests/affiliate.test.ts`, `tests/observations.test.ts`

The Phase 3.8 tests cover missing policy evidence, mismatched configurations, missing/same collector-reviewer, identity/specification provenance, independent approval, and recommendation/affiliate blocking. Synthetic demo data remains explicitly demo; it does not pass as a real product.

## Operational publication checklist

- [ ] Verify exact current US model, sellable configuration, and SKU/variant from official/authorized source(s).
- [ ] Cite verified identity and every published specification; preserve unknown fields rather than guessing.
- [ ] Record current USD price, exact mandatory shipping/free-shipping conditions, and explicit stock for that configuration.
- [ ] Capture applicable warranty and return terms from source(s), with named collector and independent reviewer.
- [ ] Obtain independent product editorial approval referencing the identity/specification evidence.
- [ ] Validate data with catalog and observation validators. Confirm no duplicate/conflict or missing provenance.
- [ ] Run `getOfferEvidenceIssues`/eligibility tests and ensure it returns no issues at release time.
- [ ] For monetized links only: obtain documented program acceptance, market eligibility, tracking reference, and exact allowed destination domain; verify safe link attributes and disclosure.
- [ ] Confirm recommendations and score ordering remain commission-independent.
- [ ] Obtain separate owner authorization for merge, deployment, offer publication, and affiliate activation.

Any unchecked item blocks real-offer publication. No real Product/Offer data or affiliate tracking is authorized by this checklist.

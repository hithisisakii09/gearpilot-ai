# Phase 3.5 affiliate readiness

## Current registry

All eight researched merchants in `src/data/affiliate-programs.json` are `not_applied`; regions and approved destination domains are empty; program name, approval evidence, approval date, and tracking credential reference are absent. This phase did not apply, contact merchants, configure tracking, or create links.

| Merchant | Registry state | Approved hosts | Action |
| --- | --- | --- | --- |
| Branch | not_applied | none | No activation |
| FlexiSpot | not_applied | none | No activation |
| UPLIFT Desk | not_applied | none | No activation |
| Ergonofis | not_applied | none | No activation |
| Steelcase | not_applied | none | No activation |
| Haworth | not_applied | none | No activation |
| DeskHaus | not_applied | none | No activation |
| Vari | not_applied | none | No activation |

## Safeguards verified in code and tests

- `src/lib/affiliate.ts` reuses `isVerifiedOfferEligible` from `src/lib/eligibility.ts`.
- Resolver requires verified product/offer, current matching approved price/shipping and in-stock evidence, an approved active US program, matching retailer, HTTPS URL with no credentials, and exact/subdomain match against canonical allowlisted domains.
- Links return `rel="sponsored nofollow noopener noreferrer"`; the resolver never creates tracking parameters or identifiers.
- Tests cover non-approved lifecycle states, missing tracking reference, malformed allowlist hosts, off-list/host-suffix/userinfo/HTTP/javascript URLs, merchant mismatch, freshness, and evidence gates.
- `src/lib/recommend.ts` does not use commission or affiliate state in ranking. Existing recommendation tests verify ranking independence.
- Current counts: 0 approved programs, 0 verified real offers, 0 active affiliate links.

## Future onboarding checklist (not initiated)

1. Owner chooses whether to apply and reviews the merchant's current official program terms; no agent application/contact is authorized by this release.
2. Save documentary proof of acceptance and effective/expiry dates; review required disclosures, channel restrictions, allowed regions, and destination hosts.
3. Store the tracking credential only in an authorized secret manager. Commit only a non-secret `credential-ref:` reference, never a token, affiliate ID, or URL that embeds secret material.
4. Add exact approved canonical hostnames and program evidence to the registry after human approval; reject wildcard, URL-shaped, mixed-case, or ambiguous hosts.
5. Independently validate a real exact-configuration offer and its current evidence before adding a direct destination.
6. Add the clear disclosure adjacent to any eventual monetized link, preserve safe `rel` attributes, and test redirects/domains without generating arbitrary destinations.
7. Re-run affiliate, recommendation, catalog, and browser tests. Confirm that ranking order is unchanged by program status or commission.

No ranking or monetization release is authorized by a program application, approval, or Phase 3.5.

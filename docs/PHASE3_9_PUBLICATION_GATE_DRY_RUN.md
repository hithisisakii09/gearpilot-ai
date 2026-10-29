# Phase 3.9 publication gate dry run

This dry run uses synthetic fixtures only. It creates no real product, offer, affiliate URL, observation, or registry update. Fixture prices, SKU IDs, collectors, and reviewers in tests are non-production test values.

## Branch Duo and FlexiSpot E7 blockers

`tests/recommend.test.ts` exercises `getOfferEvidenceIssues` with each existing candidate and an explicitly incomplete synthetic offer. Both candidates are not verified; neither has a real offer record. The diagnostic confirms blockers for:

- product and offer verification;
- independent product editorial approval;
- verified identity and specification provenance;
- exact configuration ID;
- configuration-specific warranty and return-policy evidence;
- current USD price and known mandatory shipping;
- matching current in-stock observation.

Candidate-specific missing details:

| Candidate | Evidence-specific blocker |
| --- | --- |
| Branch Duo | No exact selected finish/frame or SKU; source did not expose an attributable live configuration. Price/shipping/stock, policy evidence, independent product approval, and complete current verified specifications are absent. |
| FlexiSpot E7 | No selected desktop/frame/SKU; `$0` was rejected as ambiguous; generic warranty/shipping/return page content is not tied to an exact variant/order. Price/stock, independent approval, and complete variant-linked specifications/policies are absent. |

The exact machine-readable required codes are asserted in `tests/recommend.test.ts` (`missing_product_verification`, `missing_offer_verification`, `missing_product_editorial_approval`, `unverified_product_identity`, `unverified_product_specification`, `missing_configuration`, `missing_warranty_evidence`, `missing_return_policy_evidence`, `missing_price`, `missing_shipping`, `missing_stock_observation`).

## Separation checks

- Existing observation test `records an explicit approval ... without promoting a product` confirms an observation decision does not change candidate `dataStatus` or add an offer.
- Affiliate registry test confirms all eight programs remain `not_applied`, have no allowlisted domains/tracking references, and the resolver returns no live URL even when passed synthetic eligible test product/offer fixtures.
- Recommendation tests confirm actual candidate data yields no real recommendation. Commission/program state is not a ranking input.
- Demo catalog stays synthetic and separate from real research candidates.

## Result

No publication requirement is satisfied for either real candidate in repository data. Both are blocked, with zero verified real products, zero real offers, and zero active affiliate links. A synthetic gate test is not product evidence or an editorial decision.

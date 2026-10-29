# Phase 3.8 human evidence handoff

This is a collection worksheet, not an observation or approval. No named collector was supplied; consequently no `CommercialObservation` was prepared or ingested. Keep candidate and historical observation records unchanged.

## Collection queue

| Candidate | Official starting source | Exact selection still required | Missing evidence |
| --- | --- | --- | --- |
| Branch Duo | [Official Duo product page](https://www.branchfurniture.com/products/duo-standing-desk) | Select and record desktop size, top finish/material, frame/leg color, and visible SKU/variant ID. Existing 48x24 assessment explicitly leaves finish and leg color unselected. | Current USD price and promotion conditions; exact-order mandatory shipping/free-shipping eligibility; explicit stock; source-backed dimensions/range/capacity for selected variant; applicable warranty; return policy and exclusions. |
| FlexiSpot E7 | [Official E7 product page](https://www.flexispot.com/flexispot-pro-standing-desk-e7) | Select top size/material/finish and frame configuration; record exact SKU/variant. Do not treat `$0` as a price. | Current USD price and promotion conditions; exact-order shipping; explicit stock; selected-top specifications; warranty applicability to the exact top/frame; E7 return eligibility/exclusions. Generic policy text alone is insufficient. |

## Blank collection record

Complete only from actual page evidence. Leave facts `UNKNOWN` rather than guessing.

```text
productId:
offerId: (leave unassigned until a separate catalog decision)
manufacturer:
exactModel:
market: US
canonicalProductUrl:
configurationId:
exactConfigurationLabel:
desktopWidthInches:
desktopDepthInches:
desktopMaterial/finish:
frame/options:
visibleSkuOrVariantId:
specificationSourceUrl:
priceCents:
currency: USD
promotionTerms:
mandatoryShippingCents:
shippingStatus: known | free | unknown
availability: in_stock | out_of_stock | preorder | discontinued | unknown
warrantySourceUrl:
warrantyApplicabilityNotes:
returnPolicySourceUrl:
returnEligibilityAndExclusions:
sourceUrlForEachFact:
observedAtUtc: (capture at source inspection, ISO-8601 Z)
evidenceNotes:
evidenceQuality:
collectedBy: (real collector identity; required)
reviewStatus: pending_review
reviewer: null
reviewedAt: null
```

Do not fill price/shipping/stock from prior reports or from another configuration. If current exact evidence cannot be captured without login, purchase, bot restriction, or other disallowed access, stop and mark the fields unknown.

## Existing workflow

Use the Phase 3.6 `observations:ingest` dry-run and explicit write confirmation only after filling a valid incoming collection. Ingestion must use the same named collector as `collectedBy` and cannot contain review events. A separate authorized reviewer uses `observations:review`; the independent reviewer cannot be the collector. Keep review status pending until that person decides.

Approved evidence is not product verification, offer publication, affiliate-program approval, or permission to activate a tracking URL. Product editorial verification, current offer eligibility, and affiliate approval are separate gates documented in [offer publication gates](./PHASE3_8_OFFER_PUBLICATION_GATES.md).

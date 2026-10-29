# Phase 3.9 standing-desk evidence capture

Research access date: 2026-10-29. No current sellable exact variant was selected and no exact commercial observation was captured. Therefore no product observation timestamp (`observedAt`) exists for this phase. Do not substitute report date or a prior candidate-assessment timestamp for live source capture time.

## Findings

| Candidate | Official source checked | Captured directly from source | Unknown / not confirmed |
| --- | --- | --- | --- |
| Branch Duo | [Official Duo product page](https://www.branchfurniture.com/products/duo-standing-desk) | The public page fetch returned raw, truncated HTML with a retailer exit-interstitial script. It did not expose a reliably attributable selected variant in the accessible output. No reliable product fact was newly captured. | Exact model/variant, desktop/top finish, frame options, SKU/variant ID, dimensions/range/capacity for exact variant, USD price, shipping, stock, applicable warranty/returns, and timestamp. |
| FlexiSpot E7 | [Official E7 product page](https://www.flexispot.com/flexispot-pro-standing-desk-e7) | Current page displayed general electric-desk warranty table: frame/motor/mechanisms 15 years; controller/switch/electronics 15 years; chipboard/textured desktop 2 years; solidwood desktop 5 years. It states free shipping to 48 US states, FedEx posted rates to Alaska/Hawaii, and a general 30-day return statement for “almost any item,” with like-new/no restocking and no return-shipping charge. | Exact selected E7 desktop/frame/SKU, whether a policy row applies to it, current USD price, shipping for an exact order, exact in-stock state, SKU-specific dimensions/range/capacity, and return exclusions/applicability. No timestamped commercial observation was captured. |

The FlexiSpot content is generic policy/product text, not evidence for an unselected SKU/order. Do not transform the displayed generic policy into a configuration-specific approval. No current claim about either product's availability is made.

## Persisted queue context (not fresh verification)

- Branch assessment in `src/data/observations.json`: historical 48x24 desktop clue, finish/leg color unselected, no accepted price/shipping/stock.
- FlexiSpot assessment: no exact configuration; prior `$0` render is ambiguous and explicitly rejected as a price.
- Candidate specifications in `src/data/candidates.json` are marked partial research. They were not edited or promoted.
- Historical Vari observations remain unchanged and pending. They are outside this first-product capture and are not assertions about today's price or availability.

## Reproducible human worksheet

Copy this blank form for one real capture. Keep it outside public catalog files until human review. Do not fill from memory or another model/configuration.

```yaml
productId:
manufacturer:
exactModel:
market: US
canonicalProductUrl:
configurationId:
exactVariantLabel:
desktopWidthInches:
desktopDepthInches:
desktopMaterialOrFinish:
frameColorOrType:
options:
skuOrVariantId:
specificationSourceUrl:
priceCents:
currency: USD
promotionConditions:
mandatoryShippingCents:
shippingStatus: unknown
shippingEligibilityOrDestinationContext:
availability: unknown
warrantySourceUrl:
warrantyTermsAndVariantApplicability:
returnPolicySourceUrl:
returnTermsAndExclusions:
factToSourceUrlMap:
observedAtUtc:
evidenceNotes:
evidenceQuality:
collectedBy:
reviewStatus: pending_review
reviewer: null
reviewedAt: null
```

Leave unavailable facts blank/unknown. Add a separate source URL and capture time if a policy, shipping quote, or stock state comes from a distinct official page. Collector identity must be a real person; reviewer must be another authorized person.

## Manual browser verification path

1. Open the official US manufacturer page without login and select one exact variant.
2. Record visible options and SKU/variant identifier. Reconfirm the selected options remain selected while noting the displayed price and promotion terms.
3. Inspect the official specification, warranty, and return pages and verify each applies to that variant.
4. Check whether page/cart surfaces explicit shipping and in-stock status before purchase. If necessary, stop before entering personal/address/payment data or creating an account; do not place an order. If exact shipping/stock cannot be verified without sensitive details or purchase, leave it unknown.
5. Capture UTC timestamp at inspection and source notes; do not infer facts from reviews, snippets, unrelated variants, or prior records.
6. Prepare an unreviewed observation with the actual collector identity and use the existing dry-run ingestion. A separate reviewer independently examines it. Approval does not verify/publish a product or offer.

No purchase, account creation, contact, or restricted access is authorized.

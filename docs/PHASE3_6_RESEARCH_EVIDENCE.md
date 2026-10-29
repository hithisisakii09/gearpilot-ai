# Phase 3.6 research evidence

## Scope and evidence boundary

This report distinguishes persisted research records from a fresh public-source check performed on 2026-10-29. The fresh check consulted the official manufacturer URLs already recorded in `src/data/candidates.json` and the Vari URLs in `src/data/observations.json`. It did not use authenticated access, automated crawling, merchant contact, or purchase flows. Page responses that did not expose a fact in the accessible content are treated as unknown, not as evidence that the fact is absent.

No fresh result independently confirmed an exact purchasable configuration together with current US price, mandatory shipping, and stock. No new commercial observation was added. Existing assessment timestamps and observation records were preserved.

## Candidate-by-candidate source check

| Candidate | Official source checked | Fresh-source result | Safe conclusion |
| --- | --- | --- | --- |
| Branch Duo | [Branch Duo product page](https://www.branchfurniture.com/products/duo-standing-desk) | The response was raw/truncated HTML and did not expose a reliably attributable selected variant or commercial facts. | Configuration-specific specs, SKU, price, shipping, stock, warranty, and returns remain unverified in this check. |
| FlexiSpot E7 | [FlexiSpot E7 page](https://www.flexispot.com/flexispot-pro-standing-desk-e7) | The response included a generic electric-desk warranty table: frame/motor/mechanisms 15 years; controller/switch/electronics 15 years; desktop 2 years for chipboard/solidwood texture and 5 years for solidwood. It also stated free shipping to 48 US states, FedEx posted rates to Alaska/Hawaii, and a 30-day return policy for almost any item (including no return shipping charge for like-new returns). It did not expose a selected desktop/frame SKU, configured price, or stock. | The warranty page text does not identify which desk-top material/configuration applies to this candidate. Shipping and return statements are generic and do not establish an exact order's eligibility/terms. No candidate fact or observation was promoted from this text. |
| UPLIFT V2 | [UPLIFT V2/V2 Commercial URL](https://www.upliftdesk.com/uplift-v2-standing-desk-v2-or-v2-commercial/) and [recorded V2 spec PDF](https://www.content.upliftdesk.com/content/pdfs/desks-and-frames/F500-C-Frame-V2-Specs-1.2.pdf) | The product URL redirected to `/2-leg-standing-desk/` and returned V3 product copy. The recorded PDF fetched as binary PDF bytes that the available reader could not extract into verifiable text. | Existing V2 data is not re-confirmed by the current redirect; the PDF fetch alone is not readable evidence. |
| UPLIFT V2 Commercial | [UPLIFT V2/V2 Commercial URL](https://www.upliftdesk.com/uplift-v2-standing-desk-v2-or-v2-commercial/) and [recorded commercial spec PDF](https://www.upliftdesk.com/content/pdfs/desks-and-frames/frma-2-com-c-v2-commercial-desk-spec-sheet.pdf) | The product URL redirected to V3 copy; the recorded commercial specification URL returned HTTP 404. No commercial V2 configuration was confirmed. | Exact Commercial model, SKU, and current evidence remain unverified. |
| Ergonofis Sway | [Ergonofis Sway page](https://ergonofis.com/products/sway-standing-desk) | The response contained general product/material information but did not expose a selected US configuration, USD price, shipping, or stock. | Previously recorded CAD-context price remains ambiguous and is not converted or treated as USD. |
| Steelcase Migration SE | [Steelcase Migration SE page](https://www.steelcase.com/products/height-adjustable-desks/migration-se/) | The response contained general product description only; no selected dealer configuration or offer details were exposed. | SKU, current US price, shipping, stock, and configuration-specific policies remain unverified. |
| Haworth Upside | [Haworth Upside page](https://www.haworth.com/na/en/products/desks-tables/height-adjustable-tables/upside-height-adjustable-table.html) | The response contained general feature description, not a selected purchasable configuration or current offer. | Exact size/base/SKU and commercial facts remain unverified. |
| DeskHaus Apex Pro | [DeskHaus Apex Pro product URL](https://www.deskhaus.com/products/apex-pro-bundle) | The official URL returned HTTP 404. | The recorded product URL is not usable as current evidence; identity/specification/offer facts require a current official source. |
| Vari Essential 48x24 | [Vari Essential SKU page](https://www.vari.com/essential-electric-standing-desk-split-top-48x24/FD-ESTSTESD4824.html) | The accessible response exposed customer review content, not current selected-SKU price, shipping, or stock evidence. Review text was not used. | Existing observation remains historical pending-review evidence; no current commercial fact was reconfirmed. |
| Vari ComfortEdge 60x30 | [Vari ComfortEdge SKU page](https://www.vari.com/electric-standing-desk-with-comfortedge-60x30/402278.html) | The official URL returned HTTP 410 Gone. | Existing promotional observation is not currently reconfirmed; its prior price/promotion/stock/shipping fields must not be presented as current. |

## Persisted evidence versus current verification

The candidate catalog currently contains ten `partially_verified` records and source/specification references marked `partially_verified`. These records are prior research, not a fresh verification. The two Vari records are commercial observations dated `2026-10-29T05:05:00Z`, both `pending_review`; their `sourceMetadata.capturedBy` value is `manual_review`. They were not changed during this check.

Specific previously recorded dimensions, height ranges, capacities, and warranty durations remain source-backed research assertions with partial status; the current public-source check did not validate those values. No return-policy evidence is modeled for any candidate. No exact SKU, price, shipping amount, stock state, or manufacturer policy has been newly accepted as verified for this queue.

The following is a snapshot of what the repository already recorded before this source check. It is included for traceability, not as verified product data:

| Candidate | Persisted configuration / specifications (all partial research) | Persisted commercial assessment |
| --- | --- | --- |
| Branch Duo | 48x24 desktop; finish/frame unselected; 28–47.3 in height; 275 lb; 10-year warranty assertion. | Price missing; shipping and stock unknown. |
| FlexiSpot E7 | No selected setup; 22.8–48.4 in height; 355 lb; frame desktop-width note 47.2–80 in; warranty unknown. | Price ambiguous (`$0` rendering rejected); shipping and stock unknown. |
| UPLIFT V2 | No selected desktop/SKU; 24.3–49.9 in height; 355 lb; frame-width note 41.3–72.2 in; 15-year warranty assertion. | Price missing; shipping and stock unknown. |
| UPLIFT V2 Commercial | No selected commercial desktop/SKU; 21.6–47.7 in height; 355 lb; frame-width note 41.3–72.2 in; 15-year warranty assertion. | Price missing; shipping and stock unknown. |
| Ergonofis Sway | 24x48 Maple/Black/no grommets recorded; 22–48.3 in height; 360 lb; 10-year warranty assertion. | Price ambiguous (prior context was CAD); shipping and stock unknown. |
| Steelcase Migration SE | No selected dealer configuration; 22.6–48.7 in height; size notes 46–76 in wide and several depths; 12-year warranty assertion. | Price missing; shipping and stock unknown. |
| Haworth Upside | No selected size/base/SKU; 22.6–48.7 in height; 250 lb; width/depth ranges recorded; warranty unknown. | Price missing; shipping and stock unknown. |
| DeskHaus Apex Pro | No selected configuration; 22.5–48.5 in height; 600 lb; 43–80 in desktop-width note; 20-year warranty assertion. | Price missing; shipping and stock unknown; previously recorded product URL was 404 on recheck. |
| Vari Essential 48x24 | Hazel Wood/White, SKU 401512; 48x24; 27.5–47.2 in height; 150 lb; warranty unknown. | Historical pending observation: USD 369.99, free shipping recorded, in stock; observed `2026-10-29T05:05:00Z`. |
| Vari ComfortEdge 60x30 | White/Silver, SKU 402278; 60x30; 25–50.5 in height; 200 lb; warranty unknown. | Historical pending observation: promotional USD 719.20 from 899.00, free shipping recorded, in stock; observed `2026-10-29T05:05:00Z`; recorded end `2026-11-18T23:59:00-06:00`. |

These are only the values already in the repository at assessment time `2026-10-29T05:05:00Z`. No return-policy source is recorded for any candidate. Rechecking an inaccessible or changed source does not refresh these values.

## Result

- Freshly verified products: **0**
- Freshly verified purchasable offers: **0**
- New observations written: **0**
- Merchant contact or authenticated access: **none**
- Product/Offer structured data or affiliate links activated: **none**

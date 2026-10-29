# Phase 3.7 manufacturer source recovery

Review date: 2026-10-29. Public, unauthenticated official manufacturer pages were checked using ordinary page access. No purchase flow, login, CAPTCHA, paywall, or access control was bypassed. A response that did not expose a fact is not evidence that the fact does not exist.

## Candidate-by-candidate findings

| Candidate | Official source checked | Fresh response | Safe finding and next step |
| --- | --- | --- | --- |
| Branch Duo | [Duo Standing Desk](https://www.branchfurniture.com/products/duo-standing-desk) | Product page returned raw/truncated HTML that could not be tied to a selected variant in the accessible text. | Existing 48x24 assertion remains partial. Exact finish/frame/SKU, current US price, mandatory shipping, stock, and configuration-specific policies remain UNKNOWN. |
| FlexiSpot E7 | [FlexiSpot E7](https://www.flexispot.com/flexispot-pro-standing-desk-e7) | Current page exposed generic warranty and US shipping/return policy text, not an exact selected configuration, SKU, price, or stock state. | Generic policy is not proof of applicability to an unselected desktop or order. Existing `$0` price rendering remains rejected as ambiguous. Record an exact selected variant and independently check all commercial/policy fields. |
| UPLIFT V2 | [Recorded V2/V2 Commercial URL](https://www.upliftdesk.com/uplift-v2-standing-desk-v2-or-v2-commercial/) and [current 2-leg desk page](https://www.upliftdesk.com/2-leg-standing-desk/) | V2 URL resolves to the current page; response describes **UPLIFT V3**, including a stated 22.6–48.7 in height range. | This is not V2 evidence. Do not silently substitute V3. V2 identity, exact configuration, specifications, price, shipping, stock, warranty, and returns remain unresolved. |
| UPLIFT V2 Commercial | Same UPLIFT URLs and [recorded Commercial specification PDF](https://www.upliftdesk.com/content/pdfs/desks-and-frames/frma-2-com-c-v2-commercial-desk-spec-sheet.pdf) | Product URL responds with V3 copy; recorded Commercial PDF URL previously returned 404. | Exact Commercial V2 identity/specification remains blocked. Historical V2 assertions are not reconfirmed. |
| Ergonofis Sway | [Sway Standing Desk](https://ergonofis.com/products/sway-standing-desk) | Page exposed general construction/material/care text, but no selected US configuration, SKU, USD price, shipping, or stock. | Previously recorded CAD-context price is not converted or treated as USD. US SKU and applicable warranty/returns remain UNKNOWN. |
| Steelcase Migration SE | [Migration SE](https://www.steelcase.com/products/height-adjustable-desks/migration-se/) | General product description only; no selected dealer configuration or offer facts exposed. | No exact dealer SKU/US configuration, price, shipping, availability, applicable warranty, or returns verified. |
| Haworth Upside | [Upside Height-Adjustable Table](https://www.haworth.com/na/en/products/desks-tables/height-adjustable-tables/upside-height-adjustable-table.html) | Page described general features/options; no exact selected size/base/SKU or commercial terms exposed. | Configuration-specific specs and price/shipping/stock/policies remain UNKNOWN. |
| DeskHaus Apex Pro | [Apex Pro Bundle](https://www.deskhaus.com/products/apex-pro-bundle) | Official recorded URL returned HTTP 404. | A 404 does not establish discontinuation. Do not rely on historical assertions or silently substitute another DeskHaus model. Request an owner/editor source recovery or retirement decision. |
| Vari Essential Electric 48x24 | [SKU 401512 page](https://www.vari.com/essential-electric-standing-desk-split-top-48x24/FD-ESTSTESD4824.html) | Response exposed review content rather than current selected-SKU price, shipping, and stock evidence. | Reviews are not product verification. Historical configuration/observation remains pending; price, shipping, stock, warranty applicability, and returns were not reconfirmed. |
| Vari ComfortEdge 60x30 | [SKU 402278 page](https://www.vari.com/electric-standing-desk-with-comfortedge-60x30/402278.html) | Official SKU URL returned HTTP 410 Gone. | The historical promotion, exact current purchasability, shipping, stock, warranty, and returns cannot be reconfirmed. A 410 does not prove discontinuation; require human replacement/retirement review. |

## Evidence boundary

The checked pages do not support a fully verified exact purchasable configuration for any candidate. No fresh observation was written and no value was inferred from historical candidate assertions, review content, a generic policy, or a redirect. In particular:

- No exact current SKU/model-variant plus USD price was independently confirmed.
- No exact order's mandatory shipping charge or free-shipping eligibility and stock were confirmed together.
- No candidate has complete configuration-applicable warranty and return-policy sources.
- Manufacturer-source accessibility or a 404/410 response does not itself prove a model discontinued or available.

Persisted values remain research, not verified claims. For their historical snapshot and limitations, see [Phase 3.6 research evidence](./PHASE3_6_RESEARCH_EVIDENCE.md).

## Human/editor actions

1. Provide accessible manufacturer/dealer sources for the exact sellable variant and SKU; identify any V2 retirement or approved replacement explicitly.
2. Record current US price in USD, any promotion restrictions, mandatory shipping, stock, official configuration specifications, and applicable warranty/return sources as a new observation with a real named collector.
3. Use a different authorized human reviewer; leave evidence pending if a source or field remains inaccessible.
4. Preserve both existing Vari observations unchanged. Capture any newly observed evidence separately.

# Phase 3.6 Vari observation review

## Decision

Both observations remain `pending_review`. The existing records were preserved exactly; the current public-source check did not reconfirm their commercial fields, and no reviewer decision was entered. The legacy records have only `sourceMetadata.capturedBy: "manual_review"` and no named `collectedBy` identity, so the new workflow intentionally will not accept a terminal decision for either old record.

| Observation | Existing recorded evidence (not newly confirmed) | Current source check | Decision |
| --- | --- | --- | --- |
| `vari-essential-401512-20261029` | Essential Electric Standing Desk 48x24; Hazel Wood/White; SKU 401512; USD 369.99; free standard shipping recorded as 0 cents; in stock; observed `2026-10-29T05:05:00Z`. | [Official SKU page](https://www.vari.com/essential-electric-standing-desk-split-top-48x24/FD-ESTSTESD4824.html) returned review content rather than selected-SKU price/shipping/stock evidence. | Pending; no current price, shipping, stock, warranty, or return terms confirmed. |
| `vari-comfortedge-402278-20261029` | Electric Standing Desk with ComfortEdge 60x30; White/Silver; SKU 402278; promotional USD 719.20 from USD 899; free standard shipping recorded as 0 cents; in stock; observed `2026-10-29T05:05:00Z`; recorded promotion end `2026-11-18T23:59:00-06:00`. | [Official SKU page](https://www.vari.com/electric-standing-desk-with-comfortedge-60x30/402278.html) returned HTTP 410 Gone. | Pending; price, promotion eligibility/expiry, shipping, stock, warranty, and returns not reconfirmed. |

The values above describe only what was already persisted in `src/data/observations.json`; they are not current offer assertions. A recent observation timestamp does not substitute for a successful independent recheck.

## Human review still required

An authorized reviewer must independently view the exact US SKU/configuration and record fresh source evidence, timestamp, USD price (including any promotion conditions), mandatory shipping, availability, warranty applicability, and return-policy source. If the source cannot be accessed or the exact selected variant is unclear, record a new observation as incomplete/unknown or reject the old record with a specific reason. Do not edit the existing evidence facts to make them match an unavailable page.

Because the old collector identity cannot be established from the record, preserve those observations and capture a fresh observation separately with a real named collector. A different authorized reviewer can then decide that new record. Approval of an observation does not verify a product, create an offer, establish affiliate eligibility, or promote anything into public recommendations.

# Phase 3.5 product evidence and human review queue

## Evidence boundary

This matrix describes persisted records, not independent live-source verification. The source URLs and prior research notes exist in `src/data/candidates.json` and `src/data/observations.json`; no merchant was contacted and no page was re-crawled for current facts in Phase 3.5. Every candidate remains `partially_verified`. Commercial promotion requires independent editorial verification, current evidence, and a separate reviewed catalog edit.

`Price / ship / stock` below uses assessment states, not assumptions. `unknown` is not free shipping or in stock. Configurable products without a selected sellable SKU remain incomplete.

| Candidate | Configuration / identity | Spec and warranty provenance | Price, shipping, availability evidence | Return-policy evidence | Gate and required human action |
| --- | --- | --- | --- | --- | --- |
| Branch Duo | 48x24 identified; finish and leg color explicitly unselected; no SKU | One Branch product source, partial spec references; warranty field 10 years, still partially verified | Price missing; shipping and stock unknown | No return-policy field/source captured | Select exact finish/frame/SKU, recheck manufacturer source and commercial facts, independently review. |
| FlexiSpot E7 | No desktop/frame configuration selected | One manufacturer source; identity source recorded; warranty unknown | Price marked ambiguous because prior page displayed `$0`; shipping/stock unknown | No return-policy evidence | Resolve exact sellable setup; reject zero/placeholder price; capture verified commercial facts and warranty/returns. |
| UPLIFT V2 | No desktop/finish/controller configuration or SKU | Manufacturer specification PDF/source; partial references; warranty 15 years is not editorially approved | Price missing; shipping/stock unknown; configurator was not successfully inspected in prior research | No return-policy evidence | Revisit official configurator manually, choose exact SKU, re-source current specs and policies. |
| UPLIFT V2-Commercial | No exact commercial desktop/frame/SKU | Commercial specification PDF/source; partial references; warranty 15 years is not editorially approved | Price missing; shipping/stock unknown | No return-policy evidence | Confirm commercial model/configuration separately from V2 and capture exact offer facts. |
| Ergonofis Sway | 48x24 Maple/Black/no grommets recorded; exact sellable SKU not confirmed | One manufacturer product source; partial spec references; warranty 10 years is not editorially approved | Price marked ambiguous: prior page context was CAD; do not interpret as USD. Shipping/stock unknown. | No return-policy evidence | Verify exact SKU and explicitly selected US/USD context; capture shipping, stock, warranty, and return source. |
| Steelcase Migration SE | No dealer/store configuration selected | Product page and cut sheet; partial spec references; warranty 12 years remains unapproved | Price missing; shipping/stock unknown | No return-policy evidence | Identify an authorized exact sellable configuration and seller; document applicable policies. |
| Haworth Upside | No model/work surface/base configuration selected | Product source and partial spec references; warranty unknown | Price missing; shipping/stock unknown | No return-policy evidence | Select exact configuration; source current specs, warranty, seller, price, shipping, and stock. |
| DeskHaus Apex Pro | No current exact configuration; prior recorded product URL returned 404 | Previously recorded source is not confirmed current; warranty 20 years is only partial research data | Price missing; shipping/stock unknown | No return-policy evidence | Find and independently verify a current official source before using any candidate data; otherwise retire from research queue. |
| Vari Essential 48x24 | Observation records Hazel Wood/White, SKU 401512, 48x24; prior page note identifies exact selection | Product source/partial refs; warranty unknown in candidate record | Observation `vari-essential-401512-20261029`: $369.99, explicitly free standard shipping, in stock, observed `2026-10-29T05:05:00Z`; pending independent review; no offer promoted | No return-policy evidence | Reviewer must verify current page, SKU, USD amount, shipping scope, stock, timestamp, evidence and return/warranty policy; explicitly approve/reject observation. |
| Vari ComfortEdge 60x30 | Observation records White/Silver, SKU 402278, 60x30 | Product source/partial refs; warranty unknown in candidate record | Observation `vari-comfortedge-402278-20261029`: promotional $719.20 from $899, free standard shipping, in stock; observed `2026-10-29T05:05:00Z`; recorded promo end `2026-11-18T23:59:00-06:00`; pending independent review; no offer promoted | No return-policy evidence | Reviewer must recheck promotion eligibility/expiry, current exact SKU, USD amount, shipping scope and stock, capture returns/warranty and approve/reject. |

## Shared blocking gaps

- Ten of ten candidate records are not fully verified; return terms are not modeled/captured for any candidate.
- Eight assessments have missing/ambiguous commercial price, shipping and stock; two observations are fresh by stored timestamps but still pending review and have not been independently rechecked in this phase.
- The recorded specific warranty durations for Branch, UPLIFT V2/V2-Commercial, Ergonofis, Steelcase, and DeskHaus have only `partially_verified` source references. FlexiSpot, Haworth, and both Vari candidate entries have no recorded warranty value.
- No review, rating, endorsement, hands-on test, exact offer promotion, or affiliate authorization is recorded.

## Editorial queue protocol

1. Assign an authorized named reviewer and record review time; never use the evidence collector as an implicit approver.
2. Verify exact model/configuration/SKU and source URL; capture current USD price, mandatory shipping status/amount, availability, observation timestamp, source notes, warranty and returns.
3. Keep unknown data null/unknown. Review price/shipping within seven days and stock within three days at promotion.
4. Run `npm.cmd run observations:validate` and inspect duplicate/conflict/reference output.
5. Reviewer may approve/reject only evidence actually checked. `observations:record` records only explicitly approved observations and does not promote products/offers.
6. Make any later product/offer verification change separately, with source-backed specification references and complete eligibility gates; re-run tests and catalog checks.

Current safe state: **10 candidates; 0 verified research products; 0 real offers; 2 pending-review observations; 0 eligible offers.**

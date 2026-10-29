# Phase 4.6 owner evidence handoff

No observation should be created until a real human collector has captured the evidence. Use the normal official US site in a browser; do not bypass rate limits, CAPTCHA, login, or other access controls. Prioritize Branch Duo, then choose one exact FlexiSpot E7 variant only if Branch is still inaccessible.

## Capture one exact variant

For the selected configuration, record the displayed manufacturer/model, frame, desktop width/depth, material, color/finish, all selected options/accessories, and SKU or unambiguous variant ID. Capture the official URL and actual UTC time for each source consulted. Do not rely on candidate JSON or a different configuration for current verification.

Use the existing collection record shape rather than a new tracker:

- `CommercialObservation`: product/offer IDs, exact `configuration` including ID/label/model/SKU/dimensions/options, manufacturer/merchant, USD price or `null`, shipping amount/status or `unknown`/`null`, availability, official source and product URLs, actual `observedAt`, `collectedBy` (real collector), evidence notes, and `reviewStatus: "pending_review"` with reviewer fields null.
- Candidate assessment: the same exact configuration, product/source URLs, actual `assessedAt`, known/missing price/shipping/availability, and factual notes.
- For specification sources, retain official URLs and actual observed timestamps so the existing product `sources` and `specificationReferences` can cite each verified fact.

Before any intake write, validate exact configuration matching and run the existing ingestion dry-run. Do not commit raw screenshots or private account, address, order, tax, payment, or identity information. If warranty/returns or a commercial fact cannot be matched to the chosen configuration, leave it UNKNOWN.

## Required people and decisions

Provide a genuine collector identity and a different authorized human reviewer. The reviewer must explicitly inspect the source evidence; no self-approval. Product verification and profile authorization are separate: an owner must separately authorize the exact product ID and a release decision before any public route is added.

Branch advertiser 5885920 remains pending absent genuine approval evidence. Do not create or activate affiliate links.

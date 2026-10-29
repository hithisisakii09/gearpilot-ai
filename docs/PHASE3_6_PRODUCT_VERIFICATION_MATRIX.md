# Phase 3.6 product verification matrix

## Status definitions

- **PASS** — current evidence has been independently reviewed and is complete for the field.
- **PARTIAL** — a persisted research assertion or pending observation exists, but it is not independently verified/currently confirmed.
- **BLOCKED** — contradictory or unusable evidence prevents safe use (for example a changed model redirect, ambiguous currency, or 404/410 source).
- **NOT VERIFIED** — required evidence is absent or not exposed by the source check.

No field received PASS. The matrix does not assert that fields without public response content do not exist; they remain unknown until a source exposes them. Candidate specs in `src/data/candidates.json` and assessments in `src/data/observations.json` remain research records with partial status. The legacy Vari records also lack a named collector, which blocks their transition to any terminal editorial decision under the new independence rule.

| Candidate | Identity / exact configuration | Dimensions, range, capacity | Price | Shipping | Stock | Warranty | Returns |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Branch Duo | PARTIAL — 48x24 recorded; finish/frame and SKU not selected | PARTIAL — persisted specification references remain partial | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | PARTIAL — recorded duration/reference not editorially verified | NOT VERIFIED |
| FlexiSpot E7 | PARTIAL — no exact desktop/frame configuration or SKU | PARTIAL — recorded frame/spec references are partial | BLOCKED — prior `$0` render is ambiguous, not a price | PARTIAL — generic policy text was exposed; exact order eligibility/configuration not checked | NOT VERIFIED | PARTIAL — generic policy appeared but exact SKU/desktop entitlement not confirmed | PARTIAL — general return text appeared; exact product/condition applicability not confirmed |
| UPLIFT V2 | BLOCKED — recorded product URL redirects to V3 copy | BLOCKED — current URL response does not support stored V2 claims; historical references remain partial | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | PARTIAL — historical source assertion only, not current/reviewed | NOT VERIFIED |
| UPLIFT V2 Commercial | BLOCKED — recorded product URL redirects to V3 copy; exact commercial SKU absent | BLOCKED — current URL response does not support stored commercial V2 claims | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | PARTIAL — historical source assertion only, not current/reviewed | NOT VERIFIED |
| Ergonofis Sway | PARTIAL — 48x24 Maple/Black recorded; exact sellable SKU not confirmed | PARTIAL — persisted sources/specs remain partial | BLOCKED — prior price context was CAD; no USD conversion accepted | NOT VERIFIED | NOT VERIFIED | PARTIAL — recorded duration/reference remains unreviewed | NOT VERIFIED |
| Steelcase Migration SE | PARTIAL — dealer configuration/SKU not selected | PARTIAL — persisted specification references remain partial | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | PARTIAL — recorded duration/reference remains unreviewed | NOT VERIFIED |
| Haworth Upside | PARTIAL — configuration/SKU not selected | PARTIAL — persisted specification references remain partial | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| DeskHaus Apex Pro | BLOCKED — recorded official product URL returned 404 | BLOCKED — current recorded source cannot support stored claims | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | PARTIAL — historical assertion only; source is not current | NOT VERIFIED |
| Vari Essential 48x24 | PARTIAL — historical observation records Hazel Wood/White, SKU 401512; not reconfirmed | PARTIAL — stored configuration identifies 48x24; not independently rechecked | PARTIAL — historical USD 369.99 observation remains pending | PARTIAL — historical free-shipping observation remains pending | PARTIAL — historical in-stock observation remains pending | NOT VERIFIED | NOT VERIFIED |
| Vari ComfortEdge 60x30 | PARTIAL — historical observation records White/Silver, SKU 402278; page now returned 410 | PARTIAL — stored configuration identifies 60x30; not independently rechecked | BLOCKED — historical promotion cannot be reconfirmed at 410 page | BLOCKED — historical shipping cannot be reconfirmed | BLOCKED — historical stock cannot be reconfirmed | NOT VERIFIED | NOT VERIFIED |

## Release interpretation

- **Verified products:** 0 of 10.
- **Real eligible offers:** 0.
- **Observations awaiting human decision:** 2.
- **Return-policy evidence:** none is complete for a candidate.
- **Affiliate programs/links:** no new approval or activation.
- **Public Product/Offer structured data:** none generated.

Every incomplete product remains excluded from live commercial recommendations. The public finder continues to use clearly labeled synthetic demo data only.

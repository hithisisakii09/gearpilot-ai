# Phase 3 data freshness policy

## Thresholds

| Observation | Fresh for public recommendation | On expiry |
| --- | --- | --- |
| Price and mandatory shipping | 7 days | Hide price from recommendations; do not estimate or reuse it as current. |
| In-stock availability | 3 days | Treat availability as unknown and exclude the offer. |
| Product specifications | No automatic recommendation expiry, but review when a manufacturer page changes or every 180 days | Keep status partially verified or review/re-source before marking verified. |
| Image permission | Until the documented license/permission changes | Remove image when permission is unknown or expires. |

Freshness is calculated from the source observation timestamp, never a page-build time. Future observations more than 36 hours ahead are invalid.

## Manual refresh workflow

1. Open the documented manufacturer or authorized seller source manually; do not bypass access restrictions or log in without authority.
2. Record the full source URL, UTC observed time, seller, selected configuration, price, mandatory shipping if known, and stock status.
3. Keep price and stock as `null`/`unknown` when either fact cannot be observed. Do not infer free shipping or availability.
4. Update product/specification source references when a documented specification changes.
5. Run `npm.cmd run catalog:check`, `npm.cmd test`, and `npm.cmd run build`; review the Git diff.
6. Require a human editorial review before promotion to `verified` or publication of any outbound affiliate URL.

No unattended scraping, external API, paid service, or automatic production update is introduced by this policy.

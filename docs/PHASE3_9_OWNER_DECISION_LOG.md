# Phase 3.9 owner decision log

This log records owner decisions required, not decisions made on the owner's behalf.

| Decision / action | Status | Owner input or evidence needed |
| --- | --- | --- |
| Authorize Branch/CJ application | NOT AUTHORIZED / NOT STARTED | Owner first confirms legal authority, then manually verifies India publisher eligibility and current campaign terms. |
| CJ registration vs Branch campaign acceptance | UNKNOWN | Confirm separately with official CJ/Branch channels; network signup is not advertiser approval. |
| Share site identity/audience information | OWNER ACTION | Supply only genuine legal operator, country, site, content, audience, traffic, and business facts in a verified official process. |
| Submit tax/payment/identity details | NOT STARTED | Owner reviews secure official portal and privacy implications. Never put sensitive values in repository or chat. |
| Branch Duo exact product variant | UNRESOLVED | Select a purchasable US desktop/finish/frame option and record exact SKU/variant plus source. |
| FlexiSpot E7 fallback variant | UNRESOLVED | Select exact desktop/frame/material/SKU; do not infer it from generic E7 content. |
| Product price/shipping/stock | UNKNOWN | Named collector captures current values at source, with true UTC timestamps; no order is placed. |
| Warranty and return applicability | UNKNOWN / PARTIAL GENERIC FLEXISPOT TEXT | Capture official policy links and confirm exact SKU applicability and exclusions. |
| Collector/reviewer identities | NOT PROVIDED | Owner assigns real named collector and different authorized reviewer. No identities are invented. |
| Product/offer publication | NOT AUTHORIZED | Requires product verification, independent approvals, fresh evidence, complete policy evidence, tests, and separate owner release approval. |
| Affiliate activation/tracking | NOT AUTHORIZED | Requires explicit merchant approval, exact host allowlist, secure credential reference, disclosure review, and explicit owner authorization. |
| Operator identity/contact/privacy facts | OPEN | Legal operator, jurisdiction, monitored contact, Cloudflare processing/log retention, transfers/subprocessors, and rights handling. |
| Accessibility/legal/SEO review | OPEN | Human keyboard/assistive-technology/reflow review and qualified legal/privacy review before launch. |
| Analytics | DISABLED | No change without explicit owner approval, documented purpose/data/retention, and privacy review. |
| Production merge/deploy | NOT AUTHORIZED | No merge or deploy performed or authorized by this phase. |

No pending observation was created because exact fresh product evidence and a real collector identity were unavailable.

## Current site credibility posture

- `src/pages/contact.astro` has no monitored contact channel and is intentionally `noindex,follow`. Owner must provide and monitor a valid privacy/corrections contact before changing indexability.
- `src/pages/privacy.astro` describes the demo's lack of application analytics/forms/accounts, notes Cloudflare may process request/security data, and says actual retention and privacy-request handling are unverified. Owner must confirm service configuration, terms, log retention, subprocessors/transfers, and request handling.
- `src/pages/affiliate-disclosure.astro` states the public catalog is synthetic, there are no purchase links, and all eight programs are not applied. Update only after documented owner approval and program facts.
- Existing SEO metadata/routes are validated by the local smoke process; that is not proof of deployed headers, crawl/index status, search ranking, or Cloudflare behavior.
- Human keyboard/screen-reader, zoom/reflow, and contrast assessment remains an owner/QA action. Automated or local route checks are not WCAG conformance.
- Draft owner/legal notice language already exists in `docs/PHASE3_5_PRIVACY_LEGAL_GAPS.md`; it contains bracketed fields and is not published copy. Do not publish it until owner facts are supplied and qualified counsel reviews it.

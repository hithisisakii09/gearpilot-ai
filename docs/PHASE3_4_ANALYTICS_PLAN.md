# Phase 3.4 privacy-respecting analytics plan

## Implementation status

**Not implemented; no tracking is active in application code.** The site has no analytics script, analytics token, affiliate click measurement, fingerprinting, or intentionally set first-party analytics cookie. The privacy notice describes the current app behavior while acknowledging that Cloudflare may process request/security data and that account-level retention settings have not been verified.

Cloudflare's [official Web Analytics documentation](https://developers.cloudflare.com/web-analytics/) (checked 2026-10-29) describes the product as privacy-first, available on all plans, and focused on page/performance analytics. It is the preferred low-cost option for a future evaluation. This does not prove that the GearPilot account has enabled it or establish the exact data settings applicable to this zone.

Before activation, the authorized site owner must confirm account/zone ownership, product configuration, applicable privacy terms and retention, data access, and required notice language. Only then may the owner add the official site-specific configuration; never commit a guessed token or enable it as part of this phase.

## Measurement definitions if authorized

- Page views: page URL/path and aggregate views, without user-level identity.
- Referring source: referrer/domain category where provided by the configured analytics product; direct/unknown remains distinct and incomplete referrers are expected.
- Search landing pages: use a separately authorized Search Console property for query/impression/click/CTR/position data; a web analytics referrer is not a substitute for search-query data.
- Performance: aggregate page-load/Web Vitals reporting only if confirmed available and configured in the selected product.
- Finder interactions: not planned for initial activation. A future opt-in design would measure coarse aggregate events (for example, finder submitted/result count category), omit entered budget/specification values, avoid persistent identifiers, and document consent/retention before release.

No affiliate click tracking is proposed. Do not claim that search engines indexed the site or that analytics is enabled until account evidence is reviewed.

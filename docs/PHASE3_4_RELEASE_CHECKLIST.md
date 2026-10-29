# Phase 3.4 release checklist

- [x] Feature branch starts at merged Phase 3.3 `origin/main`.
- [x] Reusable metadata uses the production HTTPS origin and one canonical/robots/OG/Twitter set per page.
- [x] Contact and 404 are noindex; contact and non-page data are absent from the sitemap.
- [x] Sitemap includes only curated indexable pages; robots names the production sitemap.
- [x] WebSite and visible BreadcrumbList are the only JSON-LD types; no unsupported Organization/Product/Offer/review/rating claims.
- [x] One original workspace planning guide is linked internally and explicitly not a review.
- [x] No analytics or third-party tracking code is active; Cloudflare account configuration remains unverified and pending authorization.
- [x] Catalog, freshness, recommendation, demo-label, affiliate destination, and commission-independent ranking safeguards remain covered by existing tests.
- [x] Complete final sequential tests, check, catalog validation, build, dependency audit, browser smoke, and whitespace validation.
- [ ] Complete manual keyboard/screen-reader/contrast/reflow review and privacy owner/retention review.
- [ ] Confirm Cloudflare static asset 404 behavior in an authorized preview before production release.
- [ ] Push branch and open a draft PR; do not merge or deploy as part of this phase.
- [ ] Do not claim indexing or organic performance until independently measured.

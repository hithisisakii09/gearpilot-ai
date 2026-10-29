# Phase 3.4 technical SEO audit

Audit scope: source and generated static routes in GearPilot AI; no production deployment or search-engine submission. The configured production origin is `https://gearpilot-ai.hithisisakii09.workers.dev`.

## Findings and disposition

| Area | Finding | Action / remaining limitation |
| --- | --- | --- |
| Indexability | The app was static and crawlable, but there was no per-page robots policy. Thin contact copy implied an unavailable contact service. | Contact is explicitly `noindex,follow`; the custom 404 is noindex and omits a canonical. Keep catalog candidates out of public route generation. |
| Canonical and metadata | Shared layout already emitted title, description, canonical, Open Graph, and a summary Twitter card. Canonical path handling was not validated; Twitter title/description and robots were missing. | Added reusable metadata component with safe HTTPS-origin normalization, unique per-route content, Open Graph/Twitter parity, and robots directives. No preview image is invented. |
| Structured data | Existing layout asserted an Organization without evidence of legal/organizational identity. | Removed Organization. Emit only WebSite facts and BreadcrumbList that matches visible breadcrumbs. No Article, FAQ, Product, Offer, rating, or review schema is published. |
| Sitemap and robots | The sitemap was a fixed route list that included the thin contact route. | Sitemap now includes only indexable public pages. Robots allows public pages and points to the production sitemap. |
| Content quality | Public finder is synthetic demo data with clear warnings; research data is separate. There were no informational guides. | Added one original, non-review workspace planning guide. It states its limits and makes no live-market, product-review, or health claim. |
| Navigation and links | Header/footer navigation was crawlable; no error page or guide discovery existed. | Added guide navigation, contextual homepage link, visible guide breadcrumbs, and a Cloudflare Workers 404-page setting. Local smoke verifies internal destinations. |
| Mobile, accessibility | Existing responsive design and skip link/focus rules were present; target dimensions and screen-reader behavior were not comprehensively tested. | Preserved skip/focus styles, raised form/navigation targets to at least 44 CSS px, and added browser checks for keyboard entry, labels, one H1, heading order, and viewport overflow. Manual assistive-technology and contrast review remain pending. |
| Privacy and tracking | No analytics code was present; privacy copy disclosed the demo posture but left key limitations implicit. | Updated notice to describe application behavior and unknown host retention. No tracking script was added; Cloudflare Web Analytics remains unconfigured. |
| Performance | Static Astro output and one client-side finder bundle; no images or remote fonts were present. | Kept the finder behavior, added no runtime dependencies or third-party assets. See the measured asset report; Lighthouse/Core Web Vitals are pending. |
| External links and search visibility | External reference destinations and production response headers were not independently checked. | No indexing, ranking, or indexing-submission claim. Validate external sources and production headers after authorized deployment. |

## Verified route policy

Indexable and listed in the sitemap: `/`, `/methodology/`, `/affiliate-disclosure/`, `/privacy/`, `/guides/standing-desk-fit/`.

Served but excluded from the sitemap: `/contact/` (`noindex,follow`) and the 404 response (`noindex,follow`, no canonical). Candidate and observation JSON are data sources, not product landing pages.

## Audit evidence

The expanded local browser smoke test checks generated metadata uniqueness and consistency, sitemap/robots correspondence, structured-data exclusions, 404 response behavior, internal links, and responsive layouts at 375px, 768px, and 1440px. It does not crawl production or validate search-engine indexing.

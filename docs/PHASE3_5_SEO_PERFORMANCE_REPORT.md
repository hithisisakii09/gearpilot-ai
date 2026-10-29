# Phase 3.5 SEO and performance report

## SEO gates

| Check | Status | Evidence |
| --- | --- | --- |
| Production canonical origin | PASS | `src/lib/seo.ts` restricts canonical construction to the configured HTTPS host; generated route smoke checks exact canonicals. |
| Unique titles/descriptions; OG/Twitter; language | PASS | Shared `src/components/Seo.astro`; smoke requires unique title, one description, OG/Twitter tags, `lang="en-US"` and canonical parity. |
| Robots and sitemap | PASS LOCALLY | Sitemap lists five indexable static pages; contact is `noindex,follow` and excluded. `robots.txt` allows the site and names sitemap. Smoke parses both. |
| Structured data | PASS LOCALLY | Only WebSite and visible BreadcrumbList. Smoke parses JSON-LD and rejects Organization, Product, Offer, ratings, reviews, and FAQPage. |
| Demo/research isolation | PASS LOCALLY | Finder visibly identifies synthetic records; candidate/observation JSON are not standalone public assets; no candidate commercial landing pages are generated. |
| 404 and crawler delivery | PARTIAL | Static 404 page and `wrangler.jsonc` `not_found_handling: "404-page"` are present. Local harness returns 404 with custom markup; deployed Workers behavior and crawler access require authorized preview verification. |
| Search engine indexing | NOT TESTED | No Search Console/Bing ownership or indexing check/submission; no ranking/indexing claim. |

## Performance evidence

The final Phase 3.5 build emitted seven static pages. The finder bundle measured 117,352 raw bytes and 32,005 gzip bytes (locally compressed with Node's built-in `zlib`), up 725 raw / 218 gzip bytes from the Phase 3.4 baseline after adding criteria validation. Generated output contained 41,608 bytes of HTML across seven pages, 523 bytes of sitemap XML, 92 bytes of robots text, and 464 bytes for `_headers`. Phase 3.5 adds no runtime package, browser tracking, external font, image, or analytics beacon. No further optimization was made because safe savings were not evidenced.

`npm.cmd run smoke` passed at 375px, 768px, and 1440px with no horizontal overflow or browser errors. This is a local responsive smoke test, not Lighthouse or device-lab evidence.

Lighthouse is not installed. No field Core Web Vitals data exists in the repository. Lighthouse, real Cloudflare compressed transfer, mobile throttling, and field LCP/INP/CLS are NOT TESTED; no score is claimed.

## Search quality limitations

The one published guide is practical workspace planning rather than a review. All public commercial-looking content remains clearly identified as synthetic demo; zero verified real offers means no Product/Offer/review schema or real product comparison landing pages.

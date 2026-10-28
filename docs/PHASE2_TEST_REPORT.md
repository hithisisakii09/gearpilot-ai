# Phase 2 test report

Test date: 2026-10-29. The public deployment was tested before these branch changes; this branch has **not** been deployed.

## Branch verification

| Check | Result |
| --- | --- |
| `npm.cmd test` | Pass — 10 tests: catalog validation, recommendation filtering, workspace rules, determinism/affiliate independence, and link handling. |
| `npm.cmd run build` | Pass — `astro check` reported 0 errors/warnings; static pages, `robots.txt`, and `sitemap.xml` generated. |
| `npm.cmd audit` | Pass — 0 vulnerabilities reported. |
| Built-site browser smoke test | Pass at 375px, 768px, and 1440px: homepage returned 200, no horizontal overflow, finder updated from a $500 to a $400 budget with one matching record, no page/console errors, and no unapproved purchase link appeared. |
| Built crawl files | Pass — `/robots.txt` and `/sitemap.xml` returned 200; sitemap contains every public informational route. |

## Deployed-site verification

The supplied live URL returned HTTP 200 for `/`, `/methodology/`, `/affiliate-disclosure/`, `/privacy/`, and `/contact/`. A headless browser saw no console/page errors on those pages. At 375px, 768px, and 1440px, the deployed homepage had no horizontal overflow.

The deployment is still the pre-Phase-2 version. It has the old homepage title/content and `/sitemap-index.xml` returned 404. It does not offer a user-interactive finder, so only the rendered demonstration recommendations could be inspected there. This branch adds the finder and uses `/sitemap.xml`; re-run deployed-site verification after an approved deployment.

## Accessibility and performance scope

- Automated semantic checks covered document language, semantic `main`/`nav` layout, labels, live result region, skip link, visible focus styles, and keyboard-operable native form controls through code review and browser smoke testing.
- A full automated accessibility scan (for example axe) and manual screen-reader testing were **not** run; they remain release gates.
- No Lighthouse/Core Web Vitals field measurement was run. The site is static and browser smoke navigation completed normally, but that is not a performance certification.

## Known launch blockers

1. The catalog is synthetic; verified product, offer, image, and affiliate-program data are required before real commerce claims.
2. A monitored contact channel and production-grade privacy notice are missing.
3. Post-deployment browser, accessibility, and performance QA is required.

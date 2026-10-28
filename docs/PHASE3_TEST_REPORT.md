# Phase 3.1 test report

Test date: 2026-10-29. This report applies to the local `feature/phase3-verified-catalog` branch only. No production deployment was changed.

## Commands

| Command | Result |
| --- | --- |
| `npm.cmd ci` | Blocked twice by Windows `EPERM` removing `node_modules/@rollup/rollup-win32-x64-msvc/rollup.win32-x64-msvc.node`. An existing Astro dev process held the binary; it was not terminated because it may be user-owned. A non-destructive `npm.cmd install --ignore-scripts --no-audit --no-fund` repair restored the local toolchain without changing `package-lock.json`. |
| `npm.cmd test` | Pass: 14 tests. Coverage includes candidate ingestion, invalid schema rejection, duplicates, contradictory heights, invalid price/currency/future date, observation requirements, unit conversion, stale/missing hard filters, deterministic ranking, affiliate independence/blocking, demo labeling, and empty results. |
| `npm.cmd run build` | Pass: `astro check` reported 0 errors, 0 warnings, and 0 hints; static routes built successfully. |
| `npm.cmd audit` | Pass: 0 vulnerabilities. |
| `npm.cmd run catalog:check` | Pass: read-only dry run validated 10 partially verified product candidates and 0 offers. |

## Browser smoke test

The built site was served locally and checked with Playwright at 375px, 768px, and 1440px.

- Homepage, methodology, affiliate disclosure, privacy, contact, `robots.txt`, and `sitemap.xml` each returned HTTP 200.
- No browser console or page errors were observed.
- No horizontal overflow occurred at any tested viewport.
- At a $100 budget, the finder showed the intended no-match empty state.
- On the default finder view, demo status appeared on both results; `Branch Duo Standing Desk` (a research candidate) did not render; no approved-affiliate CTA rendered.
- Navigation links were present for all public informational routes.

## Limits

- Automated axe, screen-reader, Lighthouse, field Core Web Vitals, and post-deployment checks were not run.
- `npm.cmd ci` remains an environment/process-lock issue, not a passing validation result.
- No public real-product recommendation, price claim, stock claim, image, or affiliate link was tested because none was activated.

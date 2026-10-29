# Phase 3.3 test report

Test date: 2026-10-29. Scope: `feature/phase3-price-availability`. Production was not modified.

## Automated verification

The host had less than 1 GB of free physical memory while unrelated Node processes were active. The unmodified parallel/default test, type-check, and catalog-check attempts terminated in native runtime errors; no unrelated process was stopped. Sequential validation with `NODE_OPTIONS=--max-old-space-size=512` completed successfully. Vitest was limited to one worker to avoid the host memory pressure.

| Command | Result |
| --- | --- |
| `npm.cmd test -- --maxWorkers=1` | Passed: 3 test files, 51 tests |
| `npm.cmd run check` | Passed: 22 files, 0 errors, 0 warnings, 0 hints |
| `npm.cmd run catalog:check` | Passed: 10 candidates, 0 offers, 2 observations, 10 assessments; no reference, duplicate, or conflict errors |
| `npm.cmd run build` | Passed: 5 static pages built |
| `npm.cmd audit` | Passed: 0 vulnerabilities |
| `git diff --check` | Passed |
| `npm.cmd run smoke` | Passed at 375px, 768px, and 1440px; no overflow, console, page, route, or internal-link errors |
| `npm.cmd run observations:preview -- --input src\\data\\observations.json` | Passed; read-only, writes not performed |
| `npm.cmd run quality:report -- --at 2026-10-29T05:05:00Z` | Passed; deterministic counts match the checked-in JSON and Markdown reports |

No dependency installation or clean install was attempted. Existing dependencies were present. The browser smoke script used the installed Playwright browser.

## Coverage

The suite covers valid and malformed prices, unknown/free shipping, price/stock expiry, future and timezone-boundary timestamps, source provenance, configuration conflicts, duplicates, product references, out-of-stock/preorder/unknown states, recommendation eligibility, demo behavior, commission independence, direct affiliate safety, deterministic freshness, and quality-report accuracy.

## Current evidence boundary

The browser-facing catalog remains synthetic demo data. Two official-source observations are pending review and are not offers. No automated test treats them as approved evidence or activates a purchase/referral link.

Quality snapshot: 10 research candidates; 0 fully verified products; 0 verified or eligible offers; 0 approved affiliate programs; 0 active affiliate links; 0 approved observations. The two current Vari observations are pending editorial review and are not promoted.

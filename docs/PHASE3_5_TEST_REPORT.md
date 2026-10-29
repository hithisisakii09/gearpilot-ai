# Phase 3.5 test report

Validation date: 2026-10-29. Run sequentially with `NODE_OPTIONS=--max-old-space-size=512` because this Windows host previously had memory pressure. Results below are recorded after final code changes.

| Command | Result |
| --- | --- |
| `npm.cmd test -- --maxWorkers=1` | PASS — 4 test files, 68 tests |
| `npm.cmd run check` | PASS — 27 files, 0 errors, 0 warnings, 0 hints |
| `npm.cmd run catalog:check` | PASS — 10 candidates, 0 offers; 2 observations valid, no reference errors, duplicates, or conflicts; dry run made no writes |
| `npm.cmd run build` | PASS — 7 static pages built |
| `npm.cmd audit` | PASS — 0 vulnerabilities |
| `npm.cmd run smoke` | PASS — no failures; six public pages and sitemap/robots served; 375px, 768px, and 1440px viewports had no overflow or browser errors; local security-header policy checked |
| `git diff --check` | PASS — no whitespace errors; Git emitted only LF-to-CRLF working-copy notices |

GitHub Actions now repeats clean install (`npm ci`), tests, Astro check, catalog check, build, dependency audit, Chromium installation, and smoke test. CI has read-only repository permission and no deployment step. CI workflow execution itself is NOT TESTED until a remote PR/push triggers it.

The local smoke harness uses the built site and locally mirrors `public/_headers` response values; this validates application compatibility and intended header values, but does not prove Cloudflare production behavior. Browser checks are automated Playwright smoke tests, not manual browser/assistive-technology review. Keyboard-only operation, zoom/reflow, contrast, screen-reader use, real device touch targets, and legal review remain unverified.

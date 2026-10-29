# Phase 3.7 test and validation report

Validation date: 2026-10-29. Commands were run sequentially in Windows PowerShell with `$env:NODE_OPTIONS='--max-old-space-size=512'`.

## Changes and execution

Phase 3.7 changes are documentation-only. No application code, schemas, tests, catalog records, observations, affiliate registry, runtime configuration, or production settings were changed. The required validation commands are being run sequentially in Windows PowerShell with `$env:NODE_OPTIONS='--max-old-space-size=512'`.

| Command | Result |
| --- | --- |
| `npm.cmd test -- --maxWorkers=1` | PASS — 4 test files, 74 tests |
| `npm.cmd run check` | PASS — 27 files, 0 errors, 0 warnings, 0 hints |
| `npm.cmd run catalog:check` | PASS — 10 candidates, 0 offers, 2 observations, 10 assessments, 0 review events, 0 reference errors, 0 duplicates, 0 conflicts |
| `npm.cmd run build` | PASS — 7 static pages built; 0 Astro check errors |
| `npm.cmd audit` | PASS — 0 vulnerabilities |
| `npm.cmd run smoke` | PASS — 375px, 768px, and 1440px; no overflow/errors. Eight local routes returned 200, canonical/robots metadata was checked, internal links and sitemap were checked, no smoke failures. |
| `git diff --check` | PASS — exit code 0, no whitespace errors |

## Evidence state (not test claims)

- Baseline data: 10 research candidates, 2 Vari `pending_review` observations, 0 verified real products/offers, 0 approved affiliate programs, and 0 active affiliate links.
- No Phase 3.7 observation or editorial decision was written; historical observation data was preserved.
- No product/source was promoted and no affiliate registry or tracking configuration was changed.
- No remote CI, authorized Cloudflare preview, production endpoint, Lighthouse, or deployed behavior was tested.
- The smoke command exercised the locally built static site only. It is not production or Cloudflare preview verification.

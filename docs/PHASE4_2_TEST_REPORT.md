# Phase 4.2 validation report

Commands ran sequentially in Windows PowerShell with `$env:NODE_OPTIONS='--max-old-space-size=512'`; all exited with code 0.

| Command | Result |
|---|---|
| `npm.cmd test -- --maxWorkers=1` | Passed: 5 test files, 101 tests. |
| `npm.cmd run check` | Passed: Astro check reported 0 errors and 0 warnings. |
| `npm.cmd run catalog:check` | Passed: 10 research candidates, 0 commercial offers; 2 historical observations valid, 10 assessments, no review events, reference errors, duplicate observations, or conflicts. No writes performed. |
| `npm.cmd run build` | Passed: Astro check and static build completed. |
| `npm.cmd audit` | Passed: 0 vulnerabilities reported. |
| `npm.cmd run smoke` | Passed: automated routes and checks completed. Viewports at 375, 768, and 1440 pixels each reported no horizontal overflow and no smoke errors. |
| `git diff --check` | Passed with no whitespace errors. |

Focused product-profile tests cover unverified products, required product-scoped owner authorization after independent review, exact configuration consistency, no offer creation, no unsupported price/shipping/stock/returns claims, and keeping synthetic offers outside verified offer eligibility. Existing tests also confirm no affiliate link without an approved program and commission-independent demo ranking. Historical Vari observations remain pending; validation did not approve them. Do not claim remote CI, preview, or production verification unless performed separately.

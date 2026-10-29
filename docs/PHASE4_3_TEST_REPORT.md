# Phase 4.3 validation report

Required validation commands ran sequentially in Windows PowerShell with `$env:NODE_OPTIONS='--max-old-space-size=512'`. All listed commands exited with code 0.

| Command | Result |
|---|---|
| `npm.cmd test -- --maxWorkers=1` | Passed: 5 test files, 105 tests. |
| `npm.cmd run check` | Passed: Astro check reported 0 errors and 0 warnings. |
| `npm.cmd run catalog:check` | Passed: 10 research candidates, 0 commercial offers; 2 historical observations valid, 10 assessments, no review events, reference errors, duplicate observations, or conflicts. No writes performed. |
| `npm.cmd run build` | Passed: static build completed. The development-only preview is not emitted. |
| `npm.cmd audit` | Passed: 0 vulnerabilities reported. |
| `npm.cmd run smoke` | Passed: production route/page checks completed; 375, 768, and 1440 pixel viewports had no overflow/errors, and the dev preview route returned 404 in the built static site. |
| `git diff --check` | Passed with no whitespace errors. |

Separately, the local Astro development server returned HTTP 200 for `/dev/product-profile-preview/` and displayed the synthetic-fixture notice. No remote CI, production, Lighthouse, or deployed browser result is claimed. Historical Vari observations were not approved.

# Phase 4.1 validation report

Commands ran sequentially in Windows PowerShell with `$env:NODE_OPTIONS='--max-old-space-size=512'`. All exited with code 0.

| Command | Result |
|---|---|
| `npm.cmd test -- --maxWorkers=1` | Passed: 4 test files, 95 tests. |
| `npm.cmd run check` | Passed: Astro check reported 0 errors and 0 warnings. |
| `npm.cmd run catalog:check` | Passed: dry-run valid; 10 research candidates, 0 commercial catalog offers; 2 historical observations valid, 10 assessments, no review events, reference errors, duplicate observations, or conflicts. No writes performed. |
| `npm.cmd run build` | Passed: Astro check and static build completed. |
| `npm.cmd audit` | Passed: 0 vulnerabilities reported. |
| `npm.cmd run smoke` | Passed: automated route/page checks completed. Viewports at 375, 768, and 1440 pixels each reported no horizontal overflow and no smoke errors. |
| `git diff --check` | Passed with no whitespace errors. |

The two historical observations remain `pending_review`; validation did not approve them. The 3 products and 3 offers in `demo.json` remain synthetic and are not included in commercial candidate/offer counts. Do not treat a public-page fetch as a browser, deployment, accessibility, or production verification. Preview/production headers, deployment SHA, Lighthouse, assistive-technology testing, and remote CI were not verified in the baseline audit.

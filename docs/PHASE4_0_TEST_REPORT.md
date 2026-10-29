# Phase 4.0 validation report

Validation ran locally and sequentially in Windows PowerShell with `$env:NODE_OPTIONS='--max-old-space-size=512'`. All listed commands exited with code 0.

| Command | Result |
|---|---|
| `npm.cmd test -- --maxWorkers=1` | Passed: 4 test files, 95 tests. |
| `npm.cmd run check` | Passed: Astro check reported 0 errors and 0 warnings. |
| `npm.cmd run catalog:check` | Passed: dry-run valid; 10 candidate products, 0 offers; 2 observations valid, 10 assessments, no review events, reference errors, duplicate observations, or conflicts. No writes performed. |
| `npm.cmd run build` | Passed: Astro check and production build completed. |
| `npm.cmd audit` | Passed: 0 vulnerabilities reported. |
| `npm.cmd run smoke` | Passed: all automated page checks completed; 375, 768, and 1440 pixel viewports each reported no horizontal overflow and no smoke errors. |
| `git diff --check` | Passed with no whitespace errors. |

The affiliate regression tests include negative cases for unauthorized transitions, CJ/Branch source separation, unsafe credential references and destination hosts, unsupported market, invalid evidence chronology, future dates, expired evidence, program restrictions, and preserving the original in-memory and checked-in registry state.

These are local results only. Remote CI, manual assistive-technology testing, Lighthouse/Core Web Vitals, preview deployment, and production behavior were not checked.

# Phase 4.6 test report

No implementation or data changes were made because exact official product evidence was unavailable. The requested suite ran sequentially in Windows PowerShell with `$env:NODE_OPTIONS='--max-old-space-size=512'`.

| Command | Result |
| --- | --- |
| `npm.cmd test -- --maxWorkers=1` | Passed: 5 test files, 106 tests. |
| `npm.cmd run check` | Passed: Astro check reported 0 errors, 0 warnings, 0 hints. |
| `npm.cmd run catalog:check` | Passed: 10 research candidates, 0 offers; 2 historical observations and 10 assessments valid; no reference errors, duplicates, or conflicts. Dry-run only. |
| `npm.cmd run build` | Passed: 8 pages built; Astro check reported 0 errors and 0 warnings. |
| `npm.cmd audit` | Passed: 0 vulnerabilities. |
| `npm.cmd run smoke` | Passed: no failures at 375px, 768px, and 1440px; no horizontal overflow. Existing production preview exclusion check passed. |
| `git diff --check` | Passed with no whitespace errors. |
| `npm.cmd run quality:report` | Passed, read-only: 10 candidates, 0 verified products, 0 verified/eligible offers, 0 approved programs, 0 active links, 2 pending-review observations. |

These local checks establish repository behavior only. They do not establish product verification, editorial approval, owner authorization, affiliate approval, or production status.

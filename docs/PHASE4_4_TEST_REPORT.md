# Phase 4.4 test report

## Baseline check

Before Phase 4.4 edits, `npm.cmd run catalog:check` passed: 10 research candidates, 0 offers, 2 observations, 10 assessments, and no reference errors, duplicates, or conflicts.

## Phase 4.4 implementation validation

The requested commands ran sequentially in Windows PowerShell with `$env:NODE_OPTIONS='--max-old-space-size=512'`. All exited successfully:

```powershell
$env:NODE_OPTIONS='--max-old-space-size=512'
npm.cmd test -- --maxWorkers=1
npm.cmd run check
npm.cmd run catalog:check
npm.cmd run build
npm.cmd audit
npm.cmd run smoke
git diff --check
```

| Command | Result |
| --- | --- |
| `npm.cmd test -- --maxWorkers=1` | Passed: 5 test files, 106 tests. |
| `npm.cmd run check` | Passed: Astro check reported 0 errors and 0 warnings. |
| `npm.cmd run catalog:check` | Passed: 10 candidates, 0 offers; 2 historical observations and 10 assessments valid; no reference errors, duplicates, or conflicts. Dry-run only. |
| `npm.cmd run build` | Passed: static build completed with 8 pages; Astro check reported 0 errors and 0 warnings. |
| `npm.cmd audit` | Passed: 0 vulnerabilities. |
| `npm.cmd run smoke` | Passed: no failures; 375px, 768px, and 1440px viewports had no horizontal overflow; production preview-route exclusion passed. |
| `git diff --check` | Passed with no whitespace errors. |

These are local repository checks. No remote CI, Lighthouse, live production, or deployed-site check is claimed.

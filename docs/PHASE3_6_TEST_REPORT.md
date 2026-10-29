# Phase 3.6 test report

Validation date: 2026-10-29. Commands were run sequentially in Windows PowerShell with `$env:NODE_OPTIONS='--max-old-space-size=512'`.

| Command | Result |
| --- | --- |
| `npm.cmd test -- --maxWorkers=1` | PASS — 4 test files, 74 tests |
| `npm.cmd run check` | PASS — 27 files, 0 errors, 0 warnings, 0 hints |
| `npm.cmd run catalog:check` | PASS — 10 candidates, 0 catalog offers, 2 observations, 10 assessments, 0 review events; no reference, duplicate, or conflict errors |
| `npm.cmd run build` | PASS — 7 static pages built |
| `npm.cmd audit` | PASS — 0 vulnerabilities |
| `npm.cmd run smoke` | PASS — all local routes passed; 375px, 768px, and 1440px viewports had no overflow/errors |
| `git diff --check` | PASS — no whitespace errors |
| `observations:review` dry-run on legacy Vari record | Expected BLOCK — named collector identity is absent; data file remained unchanged |

Regression coverage includes named collector/reviewer separation, explicit rejection reasons, terminal decision audit consistency, non-promotion, safe pending-only ingestion, stale/missing commercial evidence blocks, timestamp ordering, and duplicate/conflicting evidence rejection. The persisted dataset remains unchanged with zero review events.

The browser smoke tests use the local build; they do not prove deployed Cloudflare behavior. Public manufacturer pages were separately checked as documented in `PHASE3_6_RESEARCH_EVIDENCE.md`, but no fetched page result reconfirmed an exact current price, shipping, and stock combination. Remote CI and deployed Cloudflare behavior remain untested until a pushed pull request/authorized preview exists.

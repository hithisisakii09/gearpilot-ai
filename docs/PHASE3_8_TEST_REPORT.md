# Phase 3.8 test report

Validation date: 2026-10-29. Commands are run sequentially in Windows PowerShell with `$env:NODE_OPTIONS='--max-old-space-size=512'`.

## Regression coverage added

- Verified product requires identity and specification references marked verified and a cited independent collector/reviewer decision.
- Verified offer requires warranty and return evidence, each reviewed by someone other than the evidence collector and tied to the exact configuration.
- Price/stock reviewed observations require explicit collector identity distinct from reviewer, and a review timestamp not before evidence.
- Eligibility blocks missing, pending, or configuration-mismatched policy evidence in both recommendations and affiliate resolution.
- Existing demo-vs-real isolation, freshness, URL allowlist, affiliate approval, and commission-independent ranking tests remain in place.

## Required validation

| Command | Result |
| --- | --- |
| `npm.cmd test -- --maxWorkers=1` | PASS — 4 test files, 79 tests |
| `npm.cmd run check` | PASS — 27 Astro files, 0 errors, 0 warnings, 0 hints |
| `npm.cmd run catalog:check` | PASS — 10 candidates, 0 offers, 2 observations, 10 assessments, 0 review events, no reference/duplicate/conflict errors |
| `npm.cmd run build` | PASS — 7 static pages built |
| `npm.cmd audit` | PASS — 0 vulnerabilities |
| `npm.cmd run smoke` | PASS — 375px, 768px, and 1440px with no overflow; all local smoke checks passed and no failures were reported |
| `git diff --check` | PASS — no whitespace errors |

Commands were run sequentially with `$env:NODE_OPTIONS='--max-old-space-size=512'`. No remote CI, authorized Cloudflare preview, production endpoint, or application submission is claimed. Browser smoke results refer to the local build only.

## Data preservation

The expected existing state remains 10 research candidates, 2 historical Vari observations (both `pending_review`), 0 real offers, 0 approved affiliate programs, and 0 active affiliate links. Phase 3.8 introduces no candidate promotion, new product evidence, or observation record.

# Phase 3.9 test report

Validation date: 2026-10-29. Required commands are run sequentially in Windows PowerShell with `$env:NODE_OPTIONS='--max-old-space-size=512'`.

## Added targeted regression coverage

- Publication dry-run returns expected blockers for Branch Duo and FlexiSpot E7 using non-publishing fixtures only.
- An approved observation does not promote its candidate or create an offer.
- An unapproved/not-applied affiliate registry cannot return an affiliate link even with eligible synthetic fixture records.

The existing Phase 3.8 schema and policy tests remain the source of coverage for independent product/editorial review and exact-configuration warranty/return requirements. No application, data file, or runtime configuration was modified.

## Required validation results

| Command | Result |
| --- | --- |
| `npm.cmd test -- --maxWorkers=1` | PASS — 4 test files, 80 tests |
| `npm.cmd run check` | PASS — 27 Astro files, 0 errors, 0 warnings, 0 hints |
| `npm.cmd run catalog:check` | PASS — 10 candidates, 0 offers, 2 observations, 10 assessments, 0 review events, no reference/duplicate/conflict errors |
| `npm.cmd run build` | PASS — 7 static pages built |
| `npm.cmd audit` | PASS — 0 vulnerabilities |
| `npm.cmd run smoke` | PASS — 375px, 768px, and 1440px with no overflow; no failures reported |
| `git diff --check` | PASS — no whitespace errors |

Commands ran sequentially in Windows PowerShell with `$env:NODE_OPTIONS='--max-old-space-size=512'`. No remote CI, deployed preview, production endpoint, or Lighthouse result is claimed. Smoke results apply to the local build.

## Evidence and data constraints

Expected baseline remains 10 research candidates, 2 historical Vari pending observations, 0 verified products, 0 offers, 0 approved programs, and 0 active links. Existing records are preserved; no source capture met the bar for a fresh observation.

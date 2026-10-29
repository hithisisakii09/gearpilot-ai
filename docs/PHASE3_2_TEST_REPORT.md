# Phase 3.2 test report

Test date: 2026-10-29. Scope: local `feature/phase3-affiliate-integration` branch. No production deployment was changed.

## Verification results

| Check | Result |
| --- | --- |
| `npm.cmd ci` | Blocked by Windows `EPERM` while unlinking a Rollup native binary held by a pre-existing local Astro process. The process was not terminated because it may be user-owned. |
| Local dependency repair | `npm.cmd install --ignore-scripts --no-audit --no-fund` restored the local dependency tree without changing `package-lock.json`. |
| `npm.cmd test` | Pass: 23 tests across catalog/recommendation and affiliate registry/resolver coverage. |
| `npm.cmd run build` | Pass: `astro check` reports 0 errors, warnings, and hints; all static routes build. |
| `npm.cmd audit` | Pass: 0 vulnerabilities. |
| `npm.cmd run catalog:check` | Pass: dry-run validates the 10-record partial-verification research queue and zero offers. |

## Affiliate-specific coverage

- Registry validates eight `not_applied` merchants with zero approvals, destination domains, and credential references.
- Resolver tests block pending, rejected, suspended, and expired programs.
- Schema rejects an approved program that lacks a safe tracking-ID reference.
- Resolver blocks unallowlisted destinations, merchant mismatches, demo products, and partially verified offers.
- Resolver emits `sponsored nofollow noopener noreferrer` only for a complete test-only approved fixture.
- Existing deterministic-ranking tests confirm affiliate status/URL is not a scoring input.

## Browser smoke test

The built static site was tested using Playwright at 375px, 768px, and 1440px.

- `/`, informational routes, `robots.txt`, and `sitemap.xml` returned HTTP 200.
- No console/page errors or horizontal overflow occurred.
- No `View approved retailer offer` CTA rendered at any viewport.
- Affiliate disclosure and privacy pages rendered with the updated safeguards.

## Remaining verification

No real affiliate program exists in the registry, so no real referral URL was tested. Manual legal/editorial review, program-term confirmation, accessibility scanning, and post-deployment verification remain required before activation.

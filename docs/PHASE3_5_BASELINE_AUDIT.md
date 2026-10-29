# Phase 3.5 baseline and release inventory

## Repository baseline

| Item | Evidence | Status |
| --- | --- | --- |
| Initial worktree | `git status --short --branch` was clean on `main`; no user changes existed to preserve. | PASS |
| Merged release baseline | `origin/main` and `main` resolved to `df4149df855cd12580423603381328dd727f762e`, merge PR #6. It includes Phase 3.4 commit `ee2e6b96f451a98dd8cd56f15648ef683b1a2861`. | PASS |
| Fetch | `git fetch origin main` completed; fetched `FETCH_HEAD` matched `origin/main`. | PASS |
| Feature branch | No local or remote `feature/phase3-launch-readiness` existed at inspection. Created from fetched `origin/main`. | PASS |
| Production | No production requests, deployments, or Cloudflare account changes were performed. | PASS |

## Inventory

- Astro static output and production origin: `astro.config.mjs`, `src/layouts/BaseLayout.astro`, `src/components/Seo.astro`.
- Routes: homepage, methodology, affiliate disclosure, privacy, contact, guide, robots, sitemap, and custom 404 under `src/pages/`.
- Public demo data is `src/data/demo.json`; candidate and commercial research are in `src/data/candidates.json` and `src/data/observations.json`; affiliate program state is `src/data/affiliate-programs.json`.
- Offer eligibility and affiliate URL restrictions: `src/lib/eligibility.ts`, `src/lib/affiliate.ts`, `src/lib/schema.ts`.
- CI: `.github/workflows/verify.yml`; Workers static assets: `wrangler.jsonc`; response header policy: `public/_headers`.
- Existing automated coverage before Phase 3.5: 55 tests for catalog schemas, observation pipeline, recommendation, affiliate safeguards, technical SEO, and responsive/browser checks (Phase 3.4 test report).
- Phase reports present through Phase 3.4; no Phase 3.4 security or privacy/legal gap report file exists. Those findings are independently recorded in this phase's security and privacy reports.

## Existing workflow gap and change

The original GitHub Actions workflow used `npm install` and only ran tests/build. Phase 3.5 changes it to `npm ci`, least-privilege read-only contents permission, a 20-minute job limit, and test/check/catalog/build/audit/browser smoke steps. It installs Playwright Chromium with the official CLI and has no deployment step or production secret.

## Current product/monetization counts

Ten research candidates, two Vari observations marked `pending_review`, zero products marked verified in the research queue, zero real offers in `candidates.json`, zero approved affiliate programs, and zero active affiliate links. The public finder continues to use three synthetic demo products and three demo offers. This count distinction is important: demo offers are not real offers.

## Release status

The branch is based on the verified merged Phase 3.4 baseline. Production readiness remains blocked by owner-supplied privacy/contact facts, editorial review and evidence completion before product promotion, manual accessibility/privacy/legal review, and Cloudflare preview/production configuration verification.

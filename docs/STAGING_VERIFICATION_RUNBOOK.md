# Staging verification runbook (no production authorization)

This runbook is for a **private, access-controlled staging preview only**. The Phase 4.8 hold remains active. Do not merge PR #23, enable affiliate links, or launch publicly based on this runbook.

## Preconditions

1. Use a preview environment with access control and no production credentials. Confirm unauthenticated visitors cannot reach the preview.
2. Deploy the reviewed feature-branch commit only to staging; record exact SHA, URL, operator, time, and provider build ID.
3. Ensure no unapproved real-product offers, paid links, or third-party trackers are enabled. Use test data where needed.

## Operator checklist

- [ ] Confirm deployment SHA equals the intended reviewed commit; preserve immutable build logs.
- [ ] Run `npm ci && npm test -- --maxWorkers=1 && npm run check && npm run catalog:check && npm run build && npm audit` in a clean environment; record results.
- [ ] Run `npx playwright install --with-deps chromium && npm run smoke` against the local production build. Note: the current smoke script starts its own localhost server; it does **not** validate a remote staging URL.
- [ ] Test preview homepage and navigation at mobile/tablet/desktop sizes, keyboard focus, form interactions, 404 behavior, contact/privacy/disclosure pages, and blocked/unapproved offers.
- [ ] Inspect remote HTTP headers, HTTPS certificate, redirect rules, robots/canonical handling, and whether staging is unintentionally indexed.
- [ ] Confirm preview is inaccessible to anonymous/incognito visitors, and no sensitive evidence or secrets appear in page source, JavaScript, network requests, or logs.
- [ ] Check external merchant links and product configuration identity without treating a successful HTTP response as approval of prices, shipping, or affiliate eligibility.
- [ ] Rehearse rollback on staging, verify monitoring/alert route, and document the operator and outcome.
- [ ] File reproducible issues with screenshots or sanitized logs and retest after fixes.

## Evidence record

| Field | Value |
| --- | --- |
| Preview URL | Not supplied / not verified |
| Commit SHA | Not supplied / not verified |
| Access control | Not verified |
| Remote browser UAT | Not performed |
| Rollback rehearsal | Not performed |
| Independent reviewers | Not selected |
| Production verdict | **NO-GO** |

A completed staging runbook is necessary but insufficient: evidence storage, independent review quorum, merchant/compliance checks, and explicit separate launch approval are still required.

## Staging evidence handoff template

Use one record per staging build. Never mark a test passed without its actual output and reviewer identity.

| Field | Required evidence |
| --- | --- |
| Deployment | Preview URL, Git SHA, provider build ID, UTC timestamp |
| Access | Authenticated test result and unauthenticated denial result |
| Browsers | Browser version, device viewport, screenshots or sanitized logs |
| Security | TLS and response headers, secret exposure check, robots/noindex verification |
| Functionality | Navigation, search/filter, disclosure, privacy, contact, 404 and unapproved-offer checks |
| Recovery | Staging rollback command, previous build ID, outcome, operator |
| Review | Distinct authenticated reviewer IDs and dated approvals |

### Release blockers to file separately

- Branch Duo 36×24 research assessment cannot substantiate the 48×24 catalog variant. Preserve quarantine and seek variant-specific source evidence.
- Two independent approvers and a separate evidence collector are not assigned; request authenticated invitations without inventing identities.
- Private encrypted versioned evidence storage is not demonstrated.
- A deployed staging origin and rollback rehearsal have not been evidenced.

No unchecked row in this document can be satisfied by a CI green check alone.

## Hosting discovery and verification (31 October 2026)

- The Astro configuration in the separate promotion-audit branch references `https://gearpilot-ai.hithisisakii09.workers.dev` as its canonical site. This is a configuration value, **not** verified proof of deployment, ownership, access control, or staging readiness.
- Searches for a GearPilot-named project in both connected Vercel accounts returned no matches. This does not establish whether another provider hosts the site.
- No authenticated Cloudflare deployment connection was available for verifying that Workers hostname, its deployment SHA, preview restrictions, or rollback capabilities.
- **Required next action:** the authorized hosting operator identifies the actual hosting provider/account, confirms private preview access, and records provider deployment ID, exact commit SHA, UTC deployment time, authenticated access and unauthenticated denial before remote UAT. Do not enter secrets or credentials in GitHub issues.
- **Evidence state:** hosting and live staging remain **unverified**. No production deployment or permission to publish is implied.

## Cloudflare private-preview evidence addendum (31 October 2026)

This section supersedes the earlier **hosting discovery** statements that Cloudflare was not connected and hosting was unverified. It does **not** mark any unchecked operator checklist items complete, authorize a release, or prove the deployed build matches this PR.

### Provider-confirmed, read-only evidence

- Cloudflare account contains Worker `gearpilot-ai`; its `workers.dev` subdomain and preview URLs are enabled.
- Worker deployment ID: `466a3ac9-245a-48f1-9be2-b124805b2851`, created `2026-10-29T18:20:29.183569Z`, serving Worker version `e82211a7-06d4-446a-b521-df95c2f0afb2` (version number 22) at 100% traffic.
- Deployment and version metadata identify Wrangler as the source, **not** the GitHub commit SHA. Exact source-to-deployment correspondence is **unverified**. This is an existing deployment, not a staging deployment performed for this PR.
- Cloudflare Access API responded successfully. Access application `gearpilot-ai - Cloudflare Workers` is self-hosted with a 24-hour session. Its Allow policy is `Cloudflare account members`, which may be broader than a single named authorized email; policy scope requires owner review.
- The user reported that the unauthenticated incognito browser showed the Cloudflare login and authenticated login reached the homepage. Independently, anonymous requests for `/` and `/robots.txt` returned `login_required` through a remote fetch service. These are limited tests, not a full route-by-route bypass assessment.
- The user reported six functional browser checks passed: homepage, comparison, research/product pages, disclosures/privacy, unknown-page 404, and mobile layout. Browser version, screenshots, viewport dimensions, and immutable logs were not provided; classify as **operator-reported, not independently reproduced**.
- The protected origin prevented anonymous inspection of site response headers and robots directives. HTTPS certificate, CSP/HSTS and other headers, noindex/canonical behavior, secrets exposure, keyboard navigation, form handling, and remote browser automation remain **unverified**.
- Cloudflare Logpush was disabled when checked. This is not automatically a failure under the ₹0 budget; evidence of a working monitoring and incident route remains required.
- GitHub CI on commit `fc51fb241f884c4bd40208068c0047d848d9dbf4` reported Verify, Evidence audit (read-only), and Global research audit successful. This is **not** proof that the deployed Worker contains that commit. PR #23 and PR #26 had no submitted reviews when checked.

### Remaining gating actions (no production authorization)

1. Obtain a verifiable deployment-to-Git-SHA mapping and immutable build logs; deploy a reviewed commit only to an approved isolated staging target if separately authorized.
2. Capture authenticated staging response headers, certificate, robots/noindex/canonical, source/network secret-exposure and accessibility evidence without exposing credentials.
3. Plan and separately authorize a staging-only rollback rehearsal; do not roll back the existing 100%-traffic Worker as a substitute.
4. Confirm independent reviewer identities, two authenticated approvers and separate evidence collector, encrypted versioned private evidence storage, merchant compliance, and explicit launch approval.

**Phase 4.8 hold remains active. Production verdict: NO-GO.**

## Indexing and deployment-source inspection (31 October 2026)

- The staging-branch source file `src/pages/robots.txt.ts` exists (even though `public/robots.txt` does not) and generates `User-agent: *`, `Allow: /`, and a sitemap URL for the `workers.dev` origin. This is **crawl-permissive**, not a private-staging noindex control. Anonymous requests to the currently protected `/robots.txt` returned `login_required`, so the live file content could not be independently compared to the branch.
- The branch's `astro.config.mjs` uses `output: 'static'`, sets the Worker hostname as the site URL, and enables trailing slashes. No root `wrangler.toml` was found. Neither fact proves how the existing Worker was deployed.
- `.github/workflows/verify.yml` runs install, unit tests, Astro check, catalog check, build, dependency audit, and local Playwright smoke tests. The smoke script's localhost run does not replace authenticated remote UAT.
- `scripts/release-readiness-gate.mjs` is fail-closed: all eight release gates remain `requires_independent_verification` and the verdict remains `NO_GO`.

**Action required before any new staging deployment:** prepare a distinct staging configuration that sends `X-Robots-Tag: noindex, nofollow, noarchive` on all staging responses (including errors and non-HTML where applicable) and uses a staging-only disallowing robots policy; keep Cloudflare Access enforced. Verify with an authenticated request and do not rely on robots.txt alone as an access control. Do not change production/public robots behavior or the existing Worker without separate approval. Track exact build SHA and retain evidence.

## Staging build CI evidence (31 October 2026)

- GitHub PR-branch commit `6fd90b8a549a6fd2340843f9803242b9a3787c76` completed **Verify**, **Evidence audit (read-only)**, and **Global research audit** successfully (workflow runs `41220674694`, `41220674675`, and `41220674721` respectively).
- The Verify workflow runs the normal build and local browser smoke test first, then a separate `GEARPILOT_STAGING_NOINDEX=true npm run build` and `node scripts/verify-staging-noindex.mjs` against the generated static files.
- The staging assertion checks seven HTML routes for `noindex,follow`, absence of canonical links, and `robots.txt` containing only `User-agent: *` and `Disallow: /`. This verifies generated build artifacts in CI, **not** live Cloudflare response behavior.
- The opt-in build variable must be explicitly set for any authorized private staging build. A normal build does not inherit this protection. This guard is defense-in-depth, not authentication.
- **Still unverified:** staging-specific `X-Robots-Tag: noindex, nofollow, noarchive` on HTML, non-HTML and error responses; exact deployed SHA; authenticated remote header/browser UAT; staged rollback rehearsal; independent approvals. No existing Cloudflare Worker configuration was changed.
- A future authorized staging deployment must use a separately controlled target and verify Access denial and HTTP headers on that exact target. Do not apply these settings to the current 100%-traffic Worker merely to complete this checklist.

**Phase 4.8 remains NO-GO. This evidence does not authorize production deployment or merging PR #23.**

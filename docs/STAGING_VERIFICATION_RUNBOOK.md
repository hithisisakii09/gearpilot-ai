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

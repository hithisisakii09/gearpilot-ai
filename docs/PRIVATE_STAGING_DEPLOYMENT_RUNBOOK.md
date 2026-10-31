# Isolated Cloudflare staging deployment — operator runbook

Status: **PREPARED, NOT DEPLOYED**. Phase 4.8 production **NO-GO** continues. Do not merge, alter the production Worker `gearpilot-ai`, disable Cloudflare Access, or incur spend. The only allowed target is `gearpilot-ai-private-staging`.

## Verified pipeline

The GitHub Verify workflow builds the site with `GEARPILOT_STAGING_NOINDEX=true`, validates staging SEO and headers, inventories **every** file in `dist/` with SHA-256, and uploads a 7-day immutable GitHub Actions artifact. On PRs, `gitSha` is the tested GitHub **merge** commit and `sourceBranchHeadSha` is the PR head. Both must be preserved; they are not interchangeable.

`node scripts/deploy-private-staging.mjs --plan preflight-input/gearpilot-private-staging-local` is read-only and runs in Verify. It checks exact files, bytes, hashes, mandatory security files, and the intended Worker name. No credentials are accessed and no upload is performed in plan mode.

## Gate before any live staging invocation

1. Verify **all** required CI jobs have passed for the intended source revision and obtain its GitHub artifact. Do not use an older build.
2. Download the **exact** artifact into a directory named `gearpilot-private-staging-<40-character CI build SHA>`, containing `dist/` and `staging-artifact-inventory.json`.
3. Complete independent technical review of the artifact, the deployment script, Cloudflare Access allowlist, expected worker ID, and rollback target; record the decision privately.
4. Ensure the account is eligible to serve the site under **₹0**, without authorizing paid services. Do not proceed if cost or permissions are uncertain.
5. Use a securely stored Cloudflare API token available only to the approved operator; do not commit, print, copy to issues, or paste credentials into this conversation. The deployment script requires Cloudflare Workers Scripts write and read access to the staging Access application. Scope as narrowly as the provider permits.
6. Supply deployment-only environment variables at runtime: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `GEARPILOT_STAGING_ACCESS_APP_ID`, `GEARPILOT_STAGING_WORKER_ID`, `GEARPILOT_STAGING_OWNER_EMAIL`, `GEARPILOT_EXPECTED_SOURCE_SHA`, `GEARPILOT_EXPECTED_BUILD_SHA`, and `GEARPILOT_STAGING_DEPLOY_APPROVAL=ISOLATED_STAGING_ONLY`. None of these should be committed.
7. Run `node scripts/deploy-private-staging.mjs --apply <exact-unpacked-artifact-folder>` **only** after every precondition is met. Never point it at an arbitrary local build folder.

## Upload and rollback design

The script refuses non-staging targets or mismatched file names/SHAs. It verifies Cloudflare Access contains exactly one owner-email allow policy tied to the isolated Worker; preview URLs must remain off. It records the existing 100%-traffic staging deployment as a rollback target.

It uses Cloudflare's three-step static assets API: manifest session (16-byte truncated SHA-256 hash), base64 multipart asset upload, then Worker **version** creation with an assets binding. A separate 100%-staging-only deployment call occurs only after Access and the prior deployment are checked again. The Worker sets `X-Robots-Tag: noindex, nofollow, noarchive` and `Cache-Control: private, no-store` on every response, alongside the generated `_headers` configuration.

After deployment, fresh anonymous requests to five routes must return an authentication denial or Cloudflare Access login redirect. If the checks fail, the script tries to restore the previously recorded **staging** version. This is a safety measure, **not proof of a tested rollback**; if the rollback itself fails, halt and escalate. Do not infer authenticated UAT success from anonymous tests.

## Evidence required after any staging deployment

Record immutable source and tested merge SHA, GitHub run/artifact ID and digest, all 12+ asset SHA-256 hashes, staging Worker version/deployment IDs, previous rollback version ID, UTC timestamp, authenticated browser screenshots/results, anonymous-denial route matrix, response headers for HTML/JS/robots/404/redirects, and a demonstrated rollback drill. Keep private evidence outside public logs.

**No production launch, affiliate activation, contract, spending, or removal of the Phase 4.8 hold is authorized.**

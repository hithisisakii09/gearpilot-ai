# Isolated staging deployment evidence checklist

This is a **preparation-only** document. Phase 4.8 is NO-GO. No existing 100%-traffic Cloudflare Worker, Access policy, domain, affiliate setting, or production credential may be modified to satisfy it.

## Before requesting a staging deployment

- [ ] Confirm a separate staging hostname/Worker and Cloudflare Access application are authorized, with a narrow authenticated allowlist.
- [ ] Confirm the deployment path honors staging response headers for HTML, assets, redirects and errors. The repository's `public/_headers` file alone is **not** proof that Cloudflare Workers sends those headers.
- [ ] Record the exact reviewed Git commit SHA and intended build command `GEARPILOT_STAGING_NOINDEX=true npm run build`; never reuse a normal build artifact.
- [ ] Ensure the staging target has no real credentials, unapproved affiliate links or live payment integration.
- [ ] Identify an operator and independent reviewer. Obtain separate approval before deploying to even an isolated staging target.

## Evidence to collect after a separately approved deployment

| Verification | Evidence | Pass criterion |
| --- | --- | --- |
| Provenance | Git SHA, immutable CI run, build ID, Worker deployment/version ID, UTC time | Same reviewed commit and artifact |
| Anonymous denial | Fresh incognito request for `/`, `/robots.txt`, `/sitemap.xml`, a known page and a random missing path | Access denies all without content leakage |
| Authenticated SEO | HTML source for homepage, about, contact and research routes | `noindex` present; canonical links absent |
| Authenticated robots | `GET /robots.txt` | `Disallow: /` and no public sitemap advertisement |
| HTTP headers | Captured status and headers for HTML, asset, redirect and 404 | `X-Robots-Tag: noindex, nofollow, noarchive` as configured; no unintended exposure |
| Browser UAT | Browser/version, viewport, screenshot/log, keyboard/navigation test | Expected routes work; no secrets or unauthorized offers |
| Recovery | Previous isolated-staging deployment ID, rollback action, timestamp, verification | Staging rollback works without touching existing Worker |
| Review | Two independent authenticated approvers plus separate collector | All identities and decisions evidenced, not inferred |

Use authenticated requests only from an approved operator session. Redact tokens, cookies, email addresses and account IDs from shared evidence. Never put Access credentials in GitHub issues, screenshots or CI logs.

## Explicit limits

- Passing local SEO tests does **not** prove remote `X-Robots-Tag` headers.
- `robots.txt` and `noindex` do **not** replace authentication.
- The existing Cloudflare Worker is **not** an isolated staging deployment with a verified Git SHA.
- If a separate target, Access policy, header behavior or rollback route cannot be verified, stop and keep NO-GO.
- No spending, merge, public production launch, affiliate activation, or contract is authorized by this checklist.

## Local artifact checksum evidence (31 October 2026)

- GitHub commit `83ba8617832066016e875279a098d02315087322` passed Verify (run `41222027571`), Evidence audit (run `41222027587`), and Global research audit (run `41222027611`).
- The CI-only staging inventory script records each expected generated file's byte length and SHA-256 digest. It includes a Git commit identifier when GitHub Actions provides one, while explicitly leaving `deploymentId` and `deploymentUrl` null and `remoteVerified` false.
- These checksums support a future comparison to an approved deployment's immutable build artifact. They do not independently prove that the Worker served those bytes, that its headers are correct, or that Access denies anonymous visitors.
- A future reviewer must compare the actual deployment build ID, exact Git SHA, and artifact digests before claiming provenance. Do not infer any match from the Worker name or hostname alone.

**No staging deployment or production release authorized. Phase 4.8 NO-GO remains active.**

## Isolated Cloudflare staging infrastructure evidence (31 October 2026)

- A distinct Worker named `gearpilot-ai-private-staging` was created. It serves only an HTTP 403 placeholder (`Private staging not yet provisioned`), with `Cache-Control: no-store` and `X-Robots-Tag: noindex, nofollow, noarchive` set in the placeholder response code. No Astro site assets have been deployed.
- A separate self-hosted Cloudflare Access application `GearPilot AI private staging` was created, linked to the new Worker's ID. Its only allow rule matches the owner-supplied email address, rather than the broader Cloudflare-account-member policy on the existing Worker. Do not copy this email into publicly shared evidence.
- The new Worker's workers.dev subdomain was enabled; preview URLs remain disabled. Its hostname is `gearpilot-ai-private-staging.hithisisakii09.workers.dev`.
- Independent unauthenticated requests to `/` and `/robots.txt` both returned `login_required`. This is limited evidence for two paths, not a full access-policy audit.
- The operator supplied a browser screenshot showing `Private staging not yet provisioned` at the staging URL. This supports placeholder reachability in their browser, but does not prove the browser's authenticated identity, the HTTP status code, or response headers.
- CI for commit `ff415660ec719da922af42d8ac781169795d5866` passed Verify, Evidence audit (read-only), and Global research audit. Draft PR #23 had zero independent reviews when checked.
- **Still outstanding:** separate approval for actual application staging deployment; exact immutable site artifact provenance; HTTP response-header verification; full anonymous route matrix; authenticated UAT; rollback rehearsal; independent reviews. Do not mark any of these complete from the placeholder checks.
- **No changes to the existing Worker or its Access policy; no production deployment, merge, spending, or affiliate activation. Phase 4.8 remains NO-GO.**

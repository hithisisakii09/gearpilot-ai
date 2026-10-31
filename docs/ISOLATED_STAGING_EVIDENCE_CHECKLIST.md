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

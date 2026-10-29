# Phase 3.5 security report

Scope: source, dependency manifest/lockfile, CI, static asset configuration, generated files, data visibility, and local browser behavior. No production attack testing, account changes, or third-party scanning was performed.

## Findings and disposition

| Finding | Status | Evidence / action |
| --- | --- | --- |
| CI dependency install was not reproducible (`npm install`) and omitted checks/audit | FIXED | `.github/workflows/verify.yml` now uses `npm ci`, full verification commands, read-only `contents` permissions, and bounded job/concurrency. |
| No explicit static response security policy | FIXED LOCALLY | `public/_headers` defines CSP, nosniff, frame denial, referrer policy, and restricted browser capabilities. `scripts/smoke-test.mjs` applies and checks those values. Cloudflare’s deployed interpretation remains NOT TESTED. |
| CSP compatibility risk for Astro's inlined style | MITIGATED / REVIEW | `script-src 'self'` and no `unsafe-eval`; `style-src 'self' 'unsafe-inline'` is retained because built Astro output includes inline style markup. Browser smoke exercises the finder and JSON-LD under the configured policy. Removing the style exception requires moving styles to external assets and re-testing. |
| Secrets/environment files | PASS LOCALLY | No application environment variable or credential reads found in `src`, `scripts`, or workflow. `.env*`, `.dev.vars*`, and `.wrangler/` are ignored. No secret value was inspected or committed. |
| Third-party tracking/runtime | PASS LOCALLY | No third-party script/font/image, analytics, cookie, fingerprinting, or outbound click measurement in generated page output. |
| User URLs/open redirects | PASS LOCALLY | No redirect endpoint exists. Affiliate resolver validates HTTPS, no URL credentials, and canonical host allowlist. Tests reject HTTP, javascript, username/password, suffix spoof, and off-allowlist destinations. |
| HTML/JSON-LD injection | PASS LOCALLY | JSON-LD serialization escapes `<`, `>`, and `&`; client-generated result cards use `textContent`, not `innerHTML`. |
| Research data exposure | PASS LOCALLY | Candidate, observation, and affiliate registry JSON remain under `src/data/`, not `public/`; expanded smoke rejects emitted research JSON files and direct `/src/data/*.json` URLs. The demo catalog is intentionally bundled for the public finder. |
| Local smoke server path escape | PASS LOCALLY | `scripts/smoke-test.mjs` resolves paths under `dist` and rejects traversal outside that directory. |
| Dependency vulnerabilities | PASS AT TEST TIME | `npm audit` returned zero vulnerabilities. CI repeats audit; this is a time-bound dependency report, not a guarantee of future safety. |
| Cloudflare settings, TLS/HSTS, logging, deployed headers and 404 | NOT TESTED | No account access/configuration change/production request authorized. Verify on preview after deploy approval; do not add HSTS without confirming domain scope and operational ownership. |

## Residual limitations

- No full SAST/DAST or dependency provenance/SBOM service was introduced. No paid tool or package was added.
- `style-src 'unsafe-inline'` permits inline style; this is a compatibility choice, not a fully strict CSP. No inline script exception is permitted.
- The app is static; form interaction executes locally and sends no analytics request. In addition to native browser form constraints, `src/lib/recommend.ts` rejects non-finite/out-of-range numeric criteria, inverted height ranges, invalid enum values (including prototype property names), non-US markets, and invalid timestamps. `tests/recommend.test.ts` exercises these rejection paths.
- No deployment or production security verification was performed.

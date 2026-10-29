# Phase 3.5 traceable release gate matrix

Statuses are evidence-based: **PASS**, **FAIL**, **BLOCKED**, or **NOT TESTED**. “PASS locally” is not a production verification.

| Release requirement | Gate | Files / tests | Evidence or blocker |
| --- | --- | --- | --- |
| Merged Phase 3.4 baseline on main | PASS | Git `origin/main`, PR #6 merge `df4149d` | Fetch matched `origin/main`; feature branch starts at exact baseline. |
| Clean user changes preserved | PASS | Initial `git status` | Worktree clean before branch creation. |
| Candidate evidence is genuine and scoped | PASS for non-promotion | `src/data/candidates.json`, `src/data/observations.json`, `PHASE3_5_PRODUCT_EVIDENCE_MATRIX.md` | 10 candidate-specific gaps and two pending observations recorded; no automatic verification or new commercial facts. |
| Product price/ship/stock/identity/freshness/review gates | PASS for exclusion; BLOCKED for offers | `src/lib/schema.ts`, `src/lib/eligibility.ts`, affiliate/recommend tests | 0 eligible real offers; eight have missing/ambiguous facts, two observations still pending review. Criteria parsing rejects malformed user inputs. |
| Affiliate approvals and destination safeguards | PASS for blocking; BLOCKED for monetization | `src/data/affiliate-programs.json`, `src/lib/affiliate.ts`, `tests/affiliate.test.ts` | Eight `not_applied`, 0 approved, 0 links; no applications/contact/activation. |
| Ranking commission independence | PASS | `src/lib/recommend.ts`, `tests/recommend.test.ts` | Existing tests compare rankings independent of affiliate state. |
| Privacy notices and analytics state | PASS for current implementation; BLOCKED for launch program | `src/pages/privacy.astro`, `src/pages/contact.astro`, analytics/legal report | Tracking disabled; owner, contact, retention, jurisdiction and provider facts missing; counsel review pending. |
| Security headers | PASS locally; NOT TESTED in Cloudflare | `public/_headers`, `scripts/smoke-test.mjs` | CSP avoids unsafe script execution, allows inline styles for current Astro output; local smoke passed; actual deployed headers unverified. |
| Dependency/CI supply chain | PASS for local checks; CI NOT TESTED | `.github/workflows/verify.yml`, `package-lock.json` | Tests (59), Astro check, catalog check, build, audit (0 vulnerabilities), and local smoke passed; workflow uses `npm ci`, read-only permission, and no deploy; CI awaits remote trigger. |
| SEO/indexability/structured data | PASS locally | `src/components/Seo.astro`, `src/pages/sitemap.xml.ts`, `src/pages/robots.txt.ts`, browser smoke | Five sitemap URLs align with indexable pages; no product/offer/rating claims. Production crawler/indexing NOT TESTED. |
| Research-data exposure | PASS locally | `src/data/*`, browser smoke | Research files excluded from `dist` and direct source-data URLs return 404 in local harness. |
| Build and asset footprint | PASS locally; field performance NOT TESTED | `npm run build`, performance report | Seven-page static build; finder bundle 117,352 raw / 32,005 gzip bytes. Lighthouse and field Core Web Vitals unavailable. |
| Accessibility | PARTIAL locally; NOT TESTED manually | browser smoke, accessibility report | Responsive smoke passed at 375px, 768px, 1440px; keyboard-only, assistive technology, zoom/reflow, and manual color review remain pending. |
| Production launch authorization | BLOCKED | owner approval required | Do not merge/deploy, enable analytics, promote data, or activate affiliate links under this phase. |

## Overall disposition

**NO-GO for production launch at this time.** Local code gates may pass, but owner/legal/privacy facts, two observation reviews, complete per-candidate evidence, manual accessibility, and authorized Cloudflare preview/deployed verification remain open.

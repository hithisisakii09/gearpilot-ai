# Phase 3.7 baseline audit

Review date: 2026-10-29

## Repository baseline

| Check | Result | Evidence |
| --- | --- | --- |
| Starting branch | `feature/phase3-commercial-readiness` | Branch created from fetched `origin/main` |
| Phase 3.6 baseline | `3e339584f5e8a7110f0e617d5b32a3e4685a793b` | `HEAD` equals `origin/main`; merge commit for PR #8 |
| Starting worktree | Clean | `git status --short --branch` |
| Production/deployment | NOT DONE | No production requests, configuration changes, or deployment |

No Phase 3.7 code or catalog files were present at the start of this work.

## Data and workflow inventory

| Asset | Baseline state |
| --- | --- |
| `src/data/candidates.json` | 10 research candidates. Candidate records are not verified products and are not public commercial recommendations. |
| `src/data/observations.json` | 2 historical Vari commercial observations, both `pending_review`; 10 candidate assessments; no Phase 3.6 editorial decisions. |
| `src/data/affiliate-programs.json` | 8 programs, all `not_applied`; no approval evidence, approved domains, tracking references, or active links. |
| Public commercial catalog | 0 verified real offers. The public finder uses clearly identified synthetic demo records. |
| Ranking | Commission/affiliate status does not determine recommendation ranking. |

## Existing Phase 3.6 safeguards reviewed

- `src/lib/schema.ts` and `src/lib/observations.ts` validate evidence provenance and timestamps, reject duplicates/conflicts and support catalog quality reporting.
- Evidence collection is separate from editorial review. A terminal decision requires a named collector distinct from the named reviewer and a corresponding audit event.
- Approval is blocked when price/shipping evidence is missing or stale (seven-day price freshness), or stock evidence is missing or stale (three-day freshness). A known shipping cost/status is required.
- `scripts/observations.ts` provides explicit dry-run and confirmed-write paths; observation review does not itself promote a product, create an offer, or change affiliate status.
- `src/lib/eligibility.ts` and `src/lib/affiliate.ts` retain the product/offer freshness and affiliate destination safeguards. The affiliate resolver requires an approved US program, matching retailer, HTTPS destination, and exact or subdomain allowlist match.

The workflow has an on-demand stale/duplicate/conflict quality report, not a scheduled notification service. No background service or external integration was introduced.

## Evidence and release blockers

| Gate | State | Basis |
| --- | --- | --- |
| Candidate source review | PARTIAL | Ten official sources were checked; none yielded a complete current configuration, price, shipping, and stock evidence set. See [source recovery](./PHASE3_7_SOURCE_RECOVERY.md). |
| Real verified products | BLOCKED | 0 of 10; field-level matrix contains no PASS. See [commercial evidence matrix](./PHASE3_7_COMMERCIAL_EVIDENCE_MATRIX.md). |
| Vari observations | BLOCKED | Two historical observations remain pending and were not altered; source checks did not reconfirm their commercial fields. |
| Affiliate programs | BLOCKED | Zero approved programs/active links. One official Branch page links to a CJ application form; it is not evidence of approval or program terms. |
| Owner/legal/privacy readiness | BLOCKED | Operator identity, jurisdiction, monitored privacy contact, hosting-data details, retention, and qualified review remain owner-dependent. |
| Alternative queue | NOT ESTABLISHED | Product pages examined did not expose a distinct, exact purchasable configuration with sufficient public evidence to justify a replacement proposal. |
| Production launch | NO-GO | No real offers, affiliate approvals, or owner/legal evidence; production settings and deployed behavior were not examined or changed. |

## Prior evidence

Phase 3.6's recorded test results are historical, not Phase 3.7 execution results. See [Phase 3.6 test report](./PHASE3_6_TEST_REPORT.md), [Phase 3.6 research evidence](./PHASE3_6_RESEARCH_EVIDENCE.md), [Phase 3.6 editorial workflow](./PHASE3_6_EDITORIAL_WORKFLOW.md), and [Phase 3.6 release recommendation](./PHASE3_6_RELEASE_RECOMMENDATION.md). New validation outcomes are in [Phase 3.7 test report](./PHASE3_7_TEST_REPORT.md).

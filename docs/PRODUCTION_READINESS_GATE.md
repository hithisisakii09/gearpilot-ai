# Production readiness gate — GearPilot AI

Status: **NOT APPROVED FOR PRODUCTION**. This checklist is an engineering handoff, not an authorization to lift the Phase 4.8 hold.

## Automated evidence (last verified)

- Commit `3ed98e7b77e8caa9c3b0d83a9cc2752514836cf1`: Verify run 41169982151, Evidence audit run 41169982227, Global research audit run 41169982032 — all successful.
- Subsequent commits require fresh workflow checks. Green CI alone is not a launch approval.

## Required before production release

- [ ] Independent reviewer(s) assigned and PR #23 reviewed; resolve blocking feedback. Keep developer, evidence collector, and approvers separate.
- [ ] Implement and verify two authenticated independent approvers plus a separate collector; reviewer selection remains undecided.
- [ ] Establish private, versioned, encrypted evidence storage with restricted access and auditable provenance. Do not commit sensitive evidence to Git.
- [ ] Resolve Branch Duo 36×24 assessment versus 48×24 catalog identity discrepancy. Do not transfer evidence between configurations.
- [ ] Independently verify the Vari Essential 48×24 SKU 401512 pilot: configuration, current price, shipping, availability, source capture, and approval records.
- [ ] Confirm every published offer's identity, source, merchant, market, currency, timestamps, affiliate eligibility, and required disclosure.
- [x] Automated CI runs unit tests, typecheck, catalog checks, production build, dependency audit, and Chromium smoke tests (Verify workflow; most recent green run listed above). This does not substitute for live staging checks.
- [ ] Validate staging deployment behavior, external links, DNS/TLS, secrets, observability, rollback rehearsal, and real-browser UAT against the deployed origin.
- [ ] Confirm hosting/domain, analytics privacy and cookie requirements, affiliate terms, and India/target-market legal and tax obligations with appropriate reviewers.
- [ ] Capture final release decision with approver identities, evidence links, scope, and rollback owner. Do not infer approval from an automation or a developer's own checks.

## Safe work while blocked

Run tests, build, read-only audits, research preparation, documentation, and staging-only checks that do not publish unapproved offers. No merge to main, production deployment, or affiliate activation under the current hold.

## Machine-readable status

Run `npm run release:readiness` for a read-only fail-closed report. Its verdict remains `NO_GO` while Phase 4.8 is active, even if supplied booleans claim approval. No automatic approval or deployment path is provided.

## 31 October 2026 — evidence separation and reviewer assignment

- Branch Duo assessment for 36×24 is explicitly quarantined in `src/data/observations.json`; the catalog's 48×24 record is unchanged. This resolves the immediate risk of silent evidence reuse, **not** the factual identity discrepancy or independent review.
- Reviewer roles required: collector (source capture), approver A, approver B, and independent code reviewer. Approver A and B must be distinct authenticated people, neither may be the collector, and no agent may impersonate them.
- Reviewer assignment: **OPEN**. Repository access and availability must be confirmed by real invitees. The project owner granting general authority does not constitute independent approval.
- Evidence storage: **NOT VERIFIED**. Do not store source screenshots, personal data, tokens, or sensitive evidence in the repository. A private encrypted versioned store and an auditable review record must be demonstrated before closing the gate.
- Pilot Vari Essential 48×24 SKU 401512: remains pending independent verification; existing research is not an approved offer.
- Staging and rollback: **NOT VERIFIED**. Record deployed-origin tests, timestamps, environment, rollback rehearsal and reviewer signatures before marking complete.

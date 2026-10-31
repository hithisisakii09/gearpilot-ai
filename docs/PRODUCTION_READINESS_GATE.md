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
- [x] Automated CI runs unit tests, typecheck, catalog checks, production build, dependency audit, and Chromium smoke tests (Verify workflow; most recent green run listed above). This does not substitute for live staging checks.\n- [ ] Validate staging deployment behavior, external links, DNS/TLS, secrets, observability, rollback rehearsal, and real-browser UAT against the deployed origin.
- [ ] Confirm hosting/domain, analytics privacy and cookie requirements, affiliate terms, and India/target-market legal and tax obligations with appropriate reviewers.
- [ ] Capture final release decision with approver identities, evidence links, scope, and rollback owner. Do not infer approval from an automation or a developer's own checks.

## Safe work while blocked

Run tests, build, read-only audits, research preparation, documentation, and staging-only checks that do not publish unapproved offers. No merge to main, production deployment, or affiliate activation under the current hold.

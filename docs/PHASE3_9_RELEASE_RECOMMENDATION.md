# Phase 3.9 release recommendation

## Code review: GO after local validation. Affiliate application: NOT READY. Commercial launch: NO-GO.

Phase 3.9 prioritizes owner handoff and evidence capture over new infrastructure. It adds focused synthetic tests for concrete publication blockers and documents the manual CJ/product verification paths. No merchant application or product promotion was performed.

| Gate | State | Evidence |
| --- | --- | --- |
| Feature baseline | PASS | `feature/phase3-merchant-onboarding` created from fetched `origin/main` at `cd7edc44311a84a4277f06e9fbeb60016d526571`. |
| Candidate inventory | PASS | 10 research candidates; 2 historical Vari observations pending; 0 verified products/offers. |
| Branch Duo exact current evidence | BLOCKED | No exact sellable variant/SKU or current price, shipping, stock, or applicable policy capture. |
| FlexiSpot E7 exact current evidence | BLOCKED | No exact variant/SKU or current price/order shipping/stock; generic policy text remains unlinked to a SKU. |
| CJ India publisher eligibility | UNKNOWN | Branch-linked signup route is confirmed; public eligibility and campaign terms did not display. Owner must confirm through official channels before any application. |
| Affiliate approval/link | BLOCKED | All eight programs remain `not_applied`; no domains, tracking references, or active links. |
| Owner/legal/privacy/site credibility | BLOCKED | Legal operator, monitored contact, hosting data/retention facts, actual target jurisdictions, and qualified review remain pending. Analytics is disabled. |
| Local validation | See [test report](./PHASE3_9_TEST_REPORT.md) | Fill in actual results after sequential execution. Remote CI and production behavior were not checked. |
| Merge/deployment/publication | NOT DONE | No merge, deploy, offer publication, affiliate activation, application, account, or merchant contact. |

## Required owner actions

1. Confirm the operator's country/legal identity and authority to apply; manually ask CJ whether an India-based publisher may register and separately join Branch's advertiser program for US-targeted content.
2. Review genuine website/content/audience information and live program eligibility, promotion restrictions, payouts/tax handling, and secure submission steps. Do not store sensitive data in Git or chat.
3. Assign a real collector and different authorized reviewer.
4. Capture exact Branch Duo or E7 variant/SKU and sourced current price/shipping/stock/specification/policy evidence using the [capture worksheet](./PHASE3_9_PRODUCT_EVIDENCE_CAPTURE.md).
5. Provide operator/contact/hosting-retention/jurisdiction facts and obtain qualified legal/privacy/accessibility review.
6. Review validation and remote CI on the draft PR before considering code merge. Product publication, application submission, affiliate activation, and deployment each require separate explicit authorization.

**Code review:** GO after all local checks pass and a reviewer examines the change.
**Affiliate application:** NOT READY; eligibility and terms need owner confirmation.
**Commercial launch:** NO-GO; no verified products, offers, or approved programs exist.

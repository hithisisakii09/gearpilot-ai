# Reviewer separation — planning-only audit

The offline `scripts/reviewer-separation-audit.mjs` validates a hypothetical staffing plan: one collector and exactly two distinct reviewers. It rejects self-review, duplicate reviewers, purported authentication and any publication or bypass permission. This tool **does not authenticate people**, select real reviewers, grant approvals or authorize publication. It is not a production access-control mechanism.

Reviewer selection remains undecided. Phase 4.8 hold stays active. Do not commit real identity documents or credentials. Use independent identity verification and access controls before any actual review workflow.

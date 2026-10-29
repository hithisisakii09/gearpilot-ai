# Phase 4.0 affiliate approval intake

## Purpose and safety boundary

The Branch/CJ intake schema validates evidence for two distinct events: registration with CJ as a publisher and approval by Branch as an advertiser. CJ registration alone is not Branch approval. The helper accepts only a Branch program already in `applied` or `pending`, validates owner authorization and evidence, and returns a proposed in-memory program object. It does not write the registry, create an account, submit a form, or activate a link.

The checked-in registry remains unchanged: all eight merchant records are `not_applied`, with no approved hosts or tracking references.

## Required evidence for a future owner-authorized review

1. Official CJ registration evidence and date, stored as a safe `approval-ref:` reference with an official CJ HTTPS source URL.
2. Separate official Branch advertiser acceptance evidence and date with an official Branch HTTPS source URL.
3. Explicit owner authorization, identifying the authorizer and timestamp.
4. Program name, confirmed US market, exact approved destination hostnames, current written restrictions, and any expiry.
5. A `credential-ref:` pointer only. Never commit a tracking value, password, tax/payment details, or identity documents.
6. Review timestamp after the evidence and authorization dates.

The validator rejects unsupported markets, malformed/noncanonical hosts, unsafe references, unrelated proof hosts, empty restrictions, invalid date ordering, expired approval, and future-dated proof. The actual program terms and destination permissions must still be verified by a human against the merchant/network evidence; validation is not proof of authenticity or legal approval.

## Owner-operated intake procedure

- Keep sensitive account materials outside the repository in an owner-controlled secure system.
- Record references to, rather than copies of, sensitive credentials or documents.
- Have an authorized owner explicitly approve any proposed status transition.
- Have a separate reviewer check both official proof sources and the permitted market/hosts/restrictions.
- Run the validator against a proposed record, review the diff, and only then make an explicitly authorized registry change in a separate task.
- Re-test affiliate URL resolution and verify no destination outside the approved host list resolves.

No application, account creation, merchant contact, status transition, tracking activation, or offer publication was performed for Phase 4.0.

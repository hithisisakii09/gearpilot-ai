# Phase 3.2 affiliate architecture

## Scope

Phase 3.2 adds an internal, Git-reviewable affiliate-program registry. It does not apply to programs, create tracking IDs, add a referral URL, record commissions or cookie durations, activate click tracking, deploy, or change production.

`src/data/affiliate-programs.json` has eight research merchants, all `not_applied`. It contains no application URL, program/network claim, approval evidence, credential reference, allowlisted destination, or affiliate link.

## Program lifecycle

`not_applied` -> `applied` -> `pending` -> `approved`; a record may also be `rejected`, `suspended`, or `expired`. Only `approved` permits a destination allowlist, and that state requires all of the following:

- program name and US-region applicability;
- a non-secret approval-evidence reference and approval date;
- a `credential-ref:` reference to a separately stored tracking identifier, never the identifier itself;
- at least one approved destination domain.

The actual credential belongs in a merchant-approved secrets system or affiliate network dashboard. It must not be committed to the repository, source map, static page, or test fixture.

## Central resolver

`resolveAffiliateLink()` is the only link resolver used by the rendered finder. It returns `null` unless:

1. product and offer are both `verified` and the offer is in stock;
2. the offer identifies an approved registry program and a recorded affiliate URL;
3. merchant names match;
4. the program has evidence, date, credential reference, US region, and has not expired;
5. the exact URL is HTTPS and its host matches the program's allowlist.

Successful results always include `rel="sponsored nofollow noopener noreferrer"`. The resolver does not generate URLs, append query parameters, derive tracking IDs, or consider commission terms. The legacy offer-only helper intentionally returns `null`.

## Recommendation and privacy boundaries

Affiliate status is not an input to `recommend()`, and its deterministic score has no merchant, commission, approval, referral-fee, EPC, or cookie-duration field. Real products remain ineligible until their product and offer evidence is verified and fresh.

No outbound-click measurement is implemented. The static Workers deployment has no approved first-party measurement endpoint; adding one would require a separate privacy and infrastructure review. The site sets no affiliate-measurement cookie and sends no personal identifier or fingerprint to an analytics provider.

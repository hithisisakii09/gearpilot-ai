# Phase 4.3 Branch application status

## Status transition

Branch's registry status is now `pending`, which is the existing status representing the owner-observed CJ Relationship History state “Pending Application” for **Branch - Program Terms**, advertiser ID `5885920`.

The evidence record contains only:

- Classification: `owner_supplied_cj_screenshot`
- Owner-reported observation date: `2026-10-29` (date only; no exact submission or capture time is asserted)
- A non-secret owner evidence reference; the screenshot itself is not stored
- Advertiser ID supplied by the owner

This is not independently verified evidence and does **not** show acceptance, approval, activation, market eligibility, or tracking permission. No approval date, destination allowlist, or tracking credential reference was added. The other seven merchant statuses remain `not_applied`.

## Additional owner-reported account facts

The owner reports that CJ Payment & Tax showed “Account activated”, and that W-8BEN and bank/payment details were submitted. These account facts were not independently inspected. No tax, identity, account, bank, or payment data is stored in this repository.

The owner also previously reported displayed US/Canada purchase terms of 5% commission and a 30-day referral period. These are recorded as unverified, potentially changing owner-observed terms—not approved or binding program terms. Reconfirm current CJ/Branch terms in the owner account before relying on them.

## Safety invariant

Schema validation requires application evidence for a Branch `applied` or `pending` record. The affiliate resolver continues to require `approved` status, approval evidence/date, approved US market and destination hosts, a safe credential reference, and an eligible independently approved offer. A pending application cannot generate an affiliate URL.

# Phase 4.1 CJ and Branch status reconciliation

## Source classification

The following are **owner-reported account observations**, supplied for this task. No CJ account screenshot, download, or external account access was provided for independent verification, and no sensitive account evidence was added to Git:

- A CJ promotional property named GearPilot AI has been created.
- A W-8BEN form was submitted.
- Bank/payment setup remained incomplete in the latest owner-observed account view.
- Branch advertiser ID `5885920` was visible in CJ.
- CJ showed a default US/Canada purchase commission of 5% and a 30-day referral period.
- An activation checklist was required before the Branch application.
- Branch advertiser approval has not been demonstrated.

These are not treated as independently verified program terms, accepted tax/payment setup, application submission, or advertiser approval. Rates, referral windows, markets, and policy terms can change and must be reconfirmed in the owner account and official current terms. Do not commit the W-8BEN, bank data, passwords, screenshots, or tracking credentials.

## Safe status proposal

No registry status change is justified by the evidence supplied. Keep the Branch merchant record `not_applied`: an advertiser ID being visible and a required checklist being incomplete do not demonstrate that the advertiser application was submitted. Do not set `pending` without proof of a submitted Branch application and its date. Do not set `approved` without official Branch advertiser acceptance evidence, approved market/hosts/restrictions, and explicit owner authorization.

CJ network/publisher setup is distinct from a merchant program and is not represented as a Branch approval status in the current merchant registry. Keep the registry unchanged. In a separate owner-controlled status log, the owner may track network account setup as `owner-reported / activation incomplete` until the account confirms the actual state and current checklist is complete.

## Owner-operated activation checklist

- Complete the account activation checklist inside the official CJ account; do not share financial/tax details in this repo or chat.
- Resolve bank/payment setup directly in the CJ account using the owner’s secure process.
- Confirm current account/property activation status from the account itself and preserve any evidence in owner-controlled storage.
- Confirm publisher identity, website/property details, geographic eligibility, application requirements, tax/payment prerequisites, and applicable publisher policies in current official CJ documentation.
- Only after activation and owner authorization, apply to Branch through the official advertiser application route shown by CJ.
- Record proof and date of an actual submission before changing any Branch status to `applied` or `pending`.
- Require separate Branch acceptance proof before `approved`; confirm approved markets, destination hosts, restrictions, and expiry.
- Do not activate tracking or publish links until program approval, applicable product/offer eligibility, and separate publication authorization are all established.

## Reconciliation decision

**Current code registry:** unchanged; Branch and all other seven merchants remain `not_applied`. The supplied account facts do not justify a more advanced status.

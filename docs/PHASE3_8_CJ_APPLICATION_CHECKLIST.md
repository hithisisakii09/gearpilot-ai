# Phase 3.8 Branch / CJ publisher application checklist

Review date: 2026-10-29. No account was created, form submitted, merchant contacted, or application started.

## Public-source findings

| Claim | Status | Evidence |
| --- | --- | --- |
| Branch publicly promotes an affiliate program and exposes an application link | CONFIRMED | [Branch Affiliate Program](https://www.branchfurniture.com/pages/affiliate-program) describes a program for publications/voices and links its APPLY action to [CJ publisher signup for Branch advertiser ID 5885920](https://signup.cj.com/member/signup/publisher/?cid=5885920). |
| CJ is the network/application destination for this Branch link | CONFIRMED | The Branch CTA points to `signup.cj.com`; the attempted public request redirects to `public.cj.com/signup/publisher?advertiserId=5885920`. This is evidence of the signup destination only, not a relationship approval. |
| CJ's public publisher page describes a platform for monetizing a business and connecting with brands | CONFIRMED | [CJ publisher page](https://www.cj.com/publisher) makes this general statement. It does not disclose eligibility rules for this specific publisher/campaign. |
| Publisher resident/operating in India can join CJ generally | UNKNOWN | The public unauthenticated application response exposed no readable eligibility terms. |
| India-based publisher can join Branch's US-targeted campaign | UNKNOWN | Branch/CJ public pages checked do not establish country eligibility, advertiser-specific restrictions, or acceptance. US audience targeting does not establish publisher-country eligibility. |
| Identity/entity, website/content, audience/traffic, age, payment, tax, or verification requirements | UNKNOWN | No public form requirements were readable from the signup route; do not treat a form prompt or a general network workflow as confirmed until owner review. |
| Commission, cookie duration, approval criteria/time, payment threshold/currency, payout method, disallowed channels | UNKNOWN | No official current campaign terms were exposed in the public pages checked. |

The Branch page's qualitative “above average commission rate” is not a published numeric rate and is not recorded as one. A CJ signup URL is not evidence of an application, acceptance, available campaign, tracking ID, or approved destination. Do not represent GearPilot as a Branch/CJ affiliate.

## Owner-only manual checklist (not started)

- [ ] Confirm legal operator identity, country of residence/establishment, business/entity status, and authority to apply.
- [ ] Confirm with CJ/Branch, through their authorized process, whether an India-based publisher and a US-focused website are eligible for the network and this particular advertiser.
- [ ] Review the live publisher signup prompts and current network/program agreements yourself. Record only terms actually displayed and obtain counsel review where needed.
- [ ] Check whether an established public website, specific content, audience evidence, minimum traffic, or age/entity criteria are required. These are questions, not confirmed requirements.
- [ ] Confirm payment method/currency, thresholds, payout availability for India, identity verification, and applicable tax forms before deciding to apply.
- [ ] Review program-specific rules for paid search, trademarks, email, coupon/deal content, social/video channels, traffic sources, disclosure placement, and approved destination domains.
- [ ] Ensure the site has a real operator identity, monitored contact, final privacy notice, and clear affiliate disclosure before representing itself to a network.
- [ ] If an authorized owner later applies and is accepted, retain official acceptance/terms and approved destination hosts; store credentials only in an authorized secret manager and add a reference, never a secret, to the repository.

Affiliate registry remains unchanged: every merchant is `not_applied`; no domains, approval, tracking reference, or active URL were added.

# Trade Fortress Cold Outbound Strategy

Status: draft for human review only. No leads were uploaded and no messages were sent.

## 1. Pre-analysis

Trade Fortress has a clear operational problem to solve but does not yet have approved customer case studies, verified outbound performance, or confirmed Instantly infrastructure. The first campaign must sell relevance and a short walkthrough, not unproven results. Sending must remain blocked until domains, authentication, warmup, suppression, and lead quality are verified.

## 2. Starting assumptions

- Mode: starting from scratch
- Initial market: Bakersfield and Kern County, California
- Primary contacts: owner, president, general manager, operations manager, office manager
- Primary trades: electrical, plumbing, roofing, HVAC, general contracting, landscaping, cleaning, and junk removal
- Sweet spot: 2-25 employees; enough call and office volume to feel the problem, small enough for owner-led buying
- Primary offer: a short walkthrough using sample data, followed by a map of the prospect’s current lead flow
- Anti-ICP: solo businesses with no inbound calls; companies outside trade services; current customers; prior opt-outs; unverified email addresses; missing first names; businesses already using a tightly adopted equivalent system
- Proof boundary: no specific revenue lift, conversion improvement, or customer result may be claimed until documented and approved

## 3. Infrastructure status

| Requirement | Current status | Launch rule |
|---|---|---|
| Instantly account/API | Not confirmed | Audit before any upload |
| Sending domains | Not confirmed | Use separate outreach domains, not the primary product domain |
| SPF, DKIM, DMARC, MX | Not verified | All must pass |
| Custom tracking domain | Not verified | Configure before links are introduced |
| Warmup | Not verified | Minimum 14 days and score 80+ |
| Suppression list | Not present in this workspace | Import and test before launch |
| Verified lead data | Not present | Require firstName, companyName, verified email |

Ready sending accounts: **0 confirmed**. Current safe capacity: **0 emails/day**.

## 4. Expert-panel scoring

### Round 1

| Panelist | Score | Rationale |
|---|---:|---|
| Alex Berman | 87 | Clear offer, but the first draft explained too much product. |
| Oren Klaff | 84 | Useful frame, though the CTA still sounded vendor-led. |
| Josh Braun | 91 | Respectful and honest with no invented proof. |
| Becc Holland | 85 | Relevant opening, but not enough pattern interruption. |
| Sam McKenna | 82 | Personalization requirement was too generic. |
| Kyle Coleman | 88 | Good sequence ladder; the middle steps needed more distinct value. |
| Will Allred | 90 | Short and readable on mobile. |
| Jeremy Donovan | 92 | Plain text, no links in early steps, safe language. |
| Jeb Blount | 83 | Email-only motion lacked a deliberate phone/social handoff. |
| Patrick Dang | 84 | Needed a clearer LinkedIn and local-social support plan. |
| **Average** | **86.6** | **Below target** |

Top weaknesses: generic personalization, product-heavy second sentence, and insufficient value progression. The revision requires a real per-lead observation, makes the offer a lead-flow map rather than a software pitch, and gives each follow-up a different operational angle.

### Round 2

| Panelist | Score | Rationale |
|---|---:|---|
| Alex Berman | 92 | Fast problem-to-offer path with a low-friction reply. |
| Oren Klaff | 90 | The sender offers a useful diagnosis without chasing a meeting. |
| Josh Braun | 94 | Honest, specific, and respectful of the owner’s time. |
| Becc Holland | 91 | The observed handoff issue earns attention without clickbait. |
| Sam McKenna | 91 | Launch requires a genuine company-specific observation. |
| Kyle Coleman | 93 | Each step adds a new revenue or operations angle. |
| Will Allred | 94 | Compact sentences and simple language fit mobile reading. |
| Jeremy Donovan | 93 | Safe link density, realistic targets, and strict infrastructure gates. |
| Jeb Blount | 90 | Includes manual phone and social touches without automating consent-sensitive channels. |
| Patrick Dang | 91 | Social support is present and does not duplicate the email. |
| **Average** | **91.9** | **Target reached** |

## 5. Final five-step email sequence

Use only after every lead has a verified first name, company name, email, and a true `{{personalization}}` observation.

### Step 1 — Day 0

Subject A: `one lead handoff question`

Subject B: `{{companyName}} call follow-up`

```text
{{personalization}}

Trade owners often have calls, estimates, and paperwork living in separate places, so the next follow-up depends on someone remembering it. Worth seeing a one-page map of how {{companyName}} could keep that handoff in one view?

{{sendingAccountFirstName}}
```

### Step 2 — Day 2

Subject: `missed calls`

```text
Most missed-call tools stop after the automatic text.

The harder part is making the callback, estimate, and job status visible to the office and the field. I can send the three-stage workflow we use for that — useful?

{{sendingAccountFirstName}}
```

### Step 3 — Day 6

Subject: `commercial paperwork`

```text
Larger buyers often ask for the W-9, insurance certificate, license, bond, or safety documents before work starts.

Trade Fortress keeps those requirements beside the opportunity instead of in a separate email hunt. Does commercial-account readiness matter for {{companyName}} this year?

{{sendingAccountFirstName}}
```

### Step 4 — Day 13

Subject: `one clean screen`

```text
The point is not another CRM.

Trade Fortress puts lead response, job stages, field records, and credential paperwork in one command center. If that matches a problem you are already trying to fix, a ten-minute sample walkthrough would be enough to test the fit.

{{sendingAccountFirstName}}
```

### Step 5 — Day 23

Subject: `workflow checklist`

```text
Leaving you with the quick test we use: can the right person see every new lead, the next action, the estimate status, and required paperwork without asking around?

If not, reply “map” and I’ll send the one-page workflow. No pressure on the software.

{{sendingAccountFirstName}}
```

## 6. Implementation plan

1. Create separate outreach domains and mailboxes that clearly identify the real sender.
2. Configure and verify SPF, DKIM, DMARC, MX, and a custom tracking subdomain.
3. Warm each mailbox for at least 14 days; do not launch below an 80 warmup score.
4. Build a lead list only from legitimate business sources and applicable outreach rules.
5. Remove current customers, competitors, prior opt-outs, role accounts, duplicates, and unverified addresses.
6. Manually research a true `personalization` line for every uploaded lead.
7. Upload a test batch, inspect rendered variables, and send internal seed tests.
8. Start at 10-15 emails per ready mailbox per day; increase only after bounce and complaint data are clean.
9. Stop sequences immediately on reply or opt-out. Record the suppression permanently.
10. Review results weekly; do not change multiple variables at once.

## 7. Capacity math

No capacity can be claimed until accounts are audited.

- Conservative: ready accounts × 30 emails/day
- Aggressive: ready accounts with 30+ warmup days and 90+ score × 50 emails/day
- Monthly: daily volume × 22 working days

Example only: two fully ready accounts would allow 60 conservative emails/day or about 1,320/month. This is capacity, not a revenue forecast.

## 8. Weekly measurement targets

- Bounce rate: below 2%; pause and investigate at or above 3%
- Spam complaints: as close to zero as possible
- Reply rate: 3%+ baseline
- Positive reply rate: 1%+ baseline
- Meeting rate: 0.5%+ baseline
- Opt-outs: tracked and suppressed immediately

Open rate is directional because privacy protections make it unreliable. Positive replies and qualified conversations matter more.

## 9. Stop list

- Do not send from `leadshield.live` until its primary-domain risk is explicitly accepted.
- Do not use scraped personal emails, guessed addresses, or leads without a verified first name.
- Do not claim guaranteed bookings, revenue, grants, or legal outcomes.
- Do not send automatic SMS or social DMs without the required consent and platform-safe workflow.
- Do not use demo metrics as customer proof.
- Do not add links, images, or attachments to Steps 1-2.

## 10. Start list

- Approve the ICP, geography, offer, and naming architecture.
- Secure two dedicated outreach domains and two real sender identities.
- Build a 50-lead, manually reviewed Bakersfield pilot list.
- Prepare the one-page lead-flow map promised by the sequence.
- Send only after infrastructure, suppression, and seed-test checks pass.

## Human review gate

This document does not authorize sending. A person must approve the final copy, lead source, suppression results, sender identities, and a rendered seed test before any campaign is activated.


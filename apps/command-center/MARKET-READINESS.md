# Trade Fortress — market readiness review

Reviewed: October 19, 2026 · Scope: `apps/command-center` (the production Next.js app)

This document records what was hardened in this pass, what is still required before
selling to customers, and the order to do it in. Anything marked **blocker** must be
finished before a paid launch.

---

## 1. What shipped in this pass

### Commercial surface (previously missing)

| Area | Before | Now |
| --- | --- | --- |
| Pricing | No pricing anywhere on the site; buyers had to ask | `/pricing` with three plans, annual option, comparison table, and pricing FAQ |
| Self-serve signup | Admin had to manually create every account | `/start-trial` + `POST /api/signup` creates a `trialing` account, signs the owner in, and notifies sales |
| Checkout | Stripe keys were listed in `.env.example` but no code used them | `POST /api/billing/checkout`, `/crm/billing`, and `/api/billing/portal` |
| Subscription state | Nothing updated plans when a customer paid | `POST /api/webhooks/stripe` handles checkout, renewals, failed payments, and cancellations |
| Trial lifecycle | Trial status had no expiry | `trial_ends_at` column, daily cron (`/api/cron/trial-expiry`), and `expire_finished_trials()` |
| Legal | Privacy only, written for the old LeadShield brand | Brand-consistent Privacy, Terms of Service, and SMS & Consent policy |
| Plan catalogue | Hard-coded `single/pro/agency` in one screen | `lib/plans.ts` is the single source of truth for pricing, seats, and checkout |

### Security and reliability

| Fix | Detail |
| --- | --- |
| Server-side route protection | `proxy.ts` now redirects anonymous visitors away from `/crm` and `/admin` before rendering, instead of relying on a client-side redirect |
| Admin authorization | `app/admin/layout.tsx` verifies the admin role on the server for every `/admin` request |
| Login throttling | Per-IP and per-identifier limits, generic error messages, suspended accounts blocked, `last_login_at` recorded |
| Signup abuse controls | Per-IP and per-email limits plus a hidden honeypot field |
| Notes data loss | Updating a lead status no longer nulls out its notes (previous `notes: notes ?? null` bug) |
| Input validation | Lead updates, SMS templates, admin plan/fee changes, and signup fields are validated. Plan and status values are whitelisted |
| Suspended accounts | Client APIs return `403` for suspended accounts, including operations and SMS template changes |
| SMS compliance guard | A template must contain opt-out language (`STOP`) before it can be saved |
| Webhook integrity | Stripe signatures verified with HMAC SHA-256 and a five-minute replay window; every event is de-duplicated in `billing_events` |
| Security headers | `nosniff`, referrer policy, permissions policy, and a `frame-ancestors` CSP on every route; HSTS in production |
| Cached private data | Session-dependent API responses send `Cache-Control: no-store` |
| Operability | `GET /api/health` reports integration configuration without leaking secrets; `app/error.tsx`, `app/global-error.tsx`, and a branded 404 added |
| Dependencies | Next.js 16.4.2 and React 19.3; the stale `postcss`/`sharp` overrides that forced vulnerable versions were removed. `npm audit --omit=dev` now reports **0 vulnerabilities** (was 6, including one critical) |
| CI | `.github/workflows/ci.yml` runs typecheck, production build, and smoke tests on every PR |

### Removed or corrected

- The privacy policy no longer describes a different product name than the marketing site.
- Structured data, canonical URLs, sitemap, robots, and OpenGraph metadata now derive from `NEXT_PUBLIC_APP_URL`.
- Admin plan changes now validate values and re-align the monthly fee with the catalogue.
- The demo API now uses the shared rate limiter and returns an explicit success message.

---

## 2. Launch blockers that require credentials or a human

These cannot be completed from code alone. Each one is a **blocker** for charging money.

1. **Run the migrations.** Apply every file in `supabase/migrations` in filename order,
   including `20261019_add_trial_signup_and_billing.sql`. The billing webhook and trial
   signup need its columns and the `billing_events` table.
2. **Verify tenant isolation.** Create two test businesses and confirm neither can read
   or update the other's leads, jobs, templates, or billing data. Check RLS from a
   browser session, not only through the service role.
3. **Stripe live configuration.** Create six prices (three plans × monthly/annual), set
   the `STRIPE_PRICE_*` variables, add the webhook endpoint
   `https://<domain>/api/webhooks/stripe` for
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `invoice.paid`, and `invoice.payment_failed`, then
   run one live test charge and refund it.
4. **A2P 10DLC / messaging registration.** Register the brand and campaign with the
   carrier (via Telnyx) and make sure the published SMS policy matches the submitted
   opt-in description. Carriers will reject unregistered traffic.
5. **Legal review.** The Terms, Privacy, and SMS policy are complete drafts, not legal
   advice. Have counsel review liability limits, arbitration/venue, and California
   privacy language before launch.
6. **Email domain.** Verify the sending domain in Resend, set `SIGNUP_NOTIFY_EMAIL`, and
   send one live trial notification plus the welcome email.
7. **Cron secret.** Set `CRON_SECRET` in Vercel so the daily trial-expiry job is
   authenticated.
8. **Uptime monitoring.** Point a monitor at `/api/health` (expect `200`) and at `/`.
   Alert to a channel someone actually reads.

---

## 3. Known limitations (acceptable for launch, fix in the first 90 days)

| Limitation | Impact | Recommended fix |
| --- | --- | --- |
| Rate limiting is in-process memory | Limits reset per serverless instance; a determined attacker gets more attempts | Move counters to Postgres or Upstash Redis and add a login lockout table |
| No full Content-Security-Policy | XSS defense relies on React escaping and header basics | Add a nonce-based CSP for Next.js inline runtime |
| No self-serve data export/delete | Privacy requests are handled by email | Add account settings pages calling admin APIs |
| No dunning sequence | A failed payment shows as `overdue` but nobody is emailed | Add Stripe smart retries plus a reminder email at day 3 and day 7 |
| No automated RLS tests | Isolation relies on manual review | Add `pgTAP` or a scripted two-tenant test to CI |
| Single admin role | No support/read-only staff role | Add roles and an audit log of admin actions |
| Trial signup does not provision a phone number | Sales/onboarding must do it | Add Telnyx number search/purchase to the admin panel |
| Logo asset is a JPG crop | Scales poorly and has a visible edge on retina | Supply SVG/PNG mark and favicon set |
| Tailwind 3 dev-dependency advisories | `npm audit` (including dev) reports 7 issues in the CSS toolchain; they are build-time only and not shipped to production | Plan the Tailwind 4 upgrade and re-run the audit |

---

## 4. Recommended launch sequence

1. Merge this branch and deploy a preview.
2. Run migrations in the staging Supabase project; configure staging keys for all
   providers.
3. Walk the funnel end to end: `/pricing` → `/start-trial` → `/crm` → trial → checkout
   (test mode) → webhook → `/crm/billing` shows paid → cancel → access downgraded.
4. Complete carrier registration and one real SMS round trip, including STOP.
5. Run `npm run smoke` against staging.
6. Point the production domain at the deployment, set live keys, and re-run the funnel
   with a refunded live charge.
7. Turn on uptime monitoring and the cron job.
8. Only then invite paying customers.

---

## 5. Verification commands

```bash
cd apps/command-center
npm ci
npm run lint          # next typegen + tsc --noEmit
npm run build
npm run start -- -p 3001
SMOKE_BASE_URL=http://127.0.0.1:3001 npm run smoke
curl -s http://127.0.0.1:3001/api/health | jq
```

The smoke suite checks public pages, legal pages, 404 handling, anonymous redirects for
`/crm` and `/admin`, health output, and rejection of unsigned Telnyx/Stripe webhooks,
consent-free demo requests, invalid signups, and empty logins.

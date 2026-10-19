# Trade Fortress

Trade Fortress is a multi-tenant command center for trade-service businesses: missed-call
text-back, lead pipeline, field operations, commercial credential packets, and subscription
billing. The production web application lives in `apps/command-center`.

## What the app includes

- **Public site** — landing page with a lost-revenue calculator, live SMS demo, `/pricing`,
  `/start-trial`, `/privacy`, `/terms`, and `/sms-policy`.
- **Self-serve trials** — a new business can create an account, get a 14-day `trialing`
  record, and land in the CRM without an admin touching the database.
- **Client command center** — lead pipeline, lead detail, customers/jobs/permits/proposals/
  materials, credential packets, SMS template settings, and plan/billing management.
- **Admin** — client provisioning, payments, analytics, and the module/service orchestrator.
- **Billing** — Stripe Checkout, billing portal, signed webhook processing, and a daily
  trial-expiry cron.
- **Missed-call webhook** — signature-verified Telnyx events that log leads and send the
  configured auto-reply.

## Quick start

```bash
# from the repository root
npm run install:all

cd apps/command-center
cp .env.example .env.local     # fill in what you have
npm run dev                    # http://localhost:3000
```

The public pages render with no credentials. Sign-in, signup, SMS, and billing report a
clear "not configured" error until their environment variables are set.

## Verification

```bash
cd apps/command-center
npm run lint                   # next typegen + TypeScript
npm run build
npm run start -- -p 3001
SMOKE_BASE_URL=http://127.0.0.1:3001 npm run smoke
```

CI runs the same typecheck, build, and smoke suite on every pull request
(`.github/workflows/ci.yml`).

## Deployment (Vercel)

1. Import `jasonmanuel-cmd/tradefortress` into Vercel and set **Root Directory** to
   `apps/command-center`.
2. Run every migration in `apps/command-center/supabase/migrations` in filename order
   against the production Supabase project.
3. Add the variables from `apps/command-center/.env.example` to Vercel's encrypted
   environment settings. Never expose service-role, Telnyx, Resend, Stripe, or cron
   secrets with a `NEXT_PUBLIC_` prefix.
4. Point the Stripe webhook at `https://<domain>/api/webhooks/stripe` and the Telnyx
   webhook at `https://<domain>/api/webhook/missed-call`.
5. Set `CRON_SECRET` so the daily trial-expiry cron in `vercel.json` is authenticated.
6. After deploying, check `https://<domain>/api/health` returns `200` with
   `"status":"ok"`.

Follow [ENVIRONMENT-SETUP.md](ENVIRONMENT-SETUP.md),
[apps/command-center/DEPLOYMENT.md](apps/command-center/DEPLOYMENT.md), and the launch
blockers in [apps/command-center/MARKET-READINESS.md](apps/command-center/MARKET-READINESS.md).

## Repository layout

- `apps/command-center` — production Next.js application (App Router, Tailwind)
- `services` — optional connected service modules
- `sales` — outreach and sales material
- `uploads` — supplied media assets used by the project
- `tradesman_package` — supporting product package and legacy prototypes

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the command center in development |
| `npm run build` | Production build |
| `npm run lint` | Generate Next.js types and typecheck |
| `npm run smoke` | HTTP smoke checks (run against a started server) |
| `npm run check` | Alias for the production build |

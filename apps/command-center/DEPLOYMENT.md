# Trade Fortress deployment

The command center is a Next.js application intended for Vercel. A successful local build is necessary but does not prove that the provider-backed workflows are ready.

## Required setup

1. Create the production Supabase project, run every migration in `supabase/migrations` in filename order, and verify tenant isolation with two test clients.
2. Add the variables from `.env.example` to the host's encrypted environment manager. Never expose service-role, Telnyx, Resend, Stripe, cron, or sync secrets with a `NEXT_PUBLIC_` prefix.
3. Register and configure Telnyx messaging, set the signed webhook endpoint to `/api/webhook/missed-call`, and verify consent, STOP handling, retries, duplicates, and delivery logging.
4. Verify the Resend sending domain and monitored reply mailbox, then set `SIGNUP_NOTIFY_EMAIL`.
5. Configure Stripe in test mode: create six prices, set the `STRIPE_PRICE_*` variables, and add a webhook for `https://<domain>/api/webhooks/stripe` covering checkout, subscription updates/deletion, `invoice.paid`, and `invoice.payment_failed`. Exercise checkout, renewal, failed payment, cancellation, and duplicate webhook delivery before using live keys.
6. Set `NEXT_PUBLIC_APP_URL` to the canonical HTTPS origin and `CRON_SECRET` to a random value. Confirm Vercel registers the daily `/api/cron/trial-expiry` cron from `vercel.json`.
7. Deploy each enabled optional module, then set its public URL and server-side health URL for the orchestrator.

The complete variable-by-variable instructions are in the repository-level `ENVIRONMENT-SETUP.md`.

## Release verification

```powershell
npm.cmd install
npm.cmd audit --omit=dev
npm.cmd run lint
npm.cmd run build
npm.cmd run start -- -p 3001
$env:SMOKE_BASE_URL='http://127.0.0.1:3001'
npm.cmd run smoke
```

Repeat the smoke test against staging and production by changing `SMOKE_BASE_URL`. Also sign in as an admin and two separate client tenants, then verify that neither client can read or update the other's records.

Then walk the commercial funnel end to end:

1. `/pricing` → `/start-trial` creates a `trialing` account and signs the owner in.
2. The CRM loads with an empty pipeline and a clear setup path.
3. `/crm/billing` starts Stripe Checkout; the Stripe test card completes payment.
4. The `checkout.session.completed` webhook flips the account to `active`/`paid` and the
   billing screen reflects the new plan.
5. Cancelling in Stripe marks the subscription deleted and the payment unpaid.
6. `GET /api/health` returns `200` with `"status":"ok"` on the deployed domain.

## Rollback triggers

Rollback when authentication or tenant isolation fails, signed Telnyx events stop processing, outbound messages are duplicated, the landing page or sign-in route returns errors, or the API error rate exceeds 2% for five minutes. Keep the previous Vercel deployment available for instant rollback and pause affected Telnyx webhooks if message duplication occurs.

## Current release boundary

Do not call the system production-ready until real Supabase, Telnyx, Resend, and billing credentials are configured and the end-to-end tests above pass on the deployed domain. The public landing page can be previewed without those credentials; the live SMS demo correctly returns unavailable when Telnyx is not configured.

# Trade Fortress deployment

The command center is a Next.js application intended for Vercel. A successful local build is necessary but does not prove that the provider-backed workflows are ready.

## Required setup

1. Create the production Supabase project, run every migration in `supabase/migrations` in filename order, and verify tenant isolation with two test clients.
2. Add the variables from `.env.example` to the host's encrypted environment manager. Never expose service-role, Telnyx, Resend, Stripe, or sync secrets with a `NEXT_PUBLIC_` prefix.
3. Register and configure Telnyx messaging, set the signed webhook endpoint to `/api/webhook/missed-call`, and verify consent, STOP handling, retries, duplicates, and delivery logging.
4. Verify the Resend sending domain and monitored reply mailbox.
5. Configure Stripe in test mode and exercise checkout, renewal, failed payment, cancellation, and duplicate webhook delivery before using live keys.
6. Deploy each enabled optional module, then set its public URL and server-side health URL for the orchestrator.

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

## Rollback triggers

Rollback when authentication or tenant isolation fails, signed Telnyx events stop processing, outbound messages are duplicated, the landing page or sign-in route returns errors, or the API error rate exceeds 2% for five minutes. Keep the previous Vercel deployment available for instant rollback and pause affected Telnyx webhooks if message duplication occurs.

## Current release boundary

Do not call the system production-ready until real Supabase, Telnyx, Resend, and billing credentials are configured and the end-to-end tests above pass on the deployed domain. The public landing page can be previewed without those credentials; the live SMS demo correctly returns unavailable when Telnyx is not configured.

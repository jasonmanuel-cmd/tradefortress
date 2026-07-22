# Trade Fortress Environment Setup

No real credentials are stored in this repository. Copy each service’s `.env.example` to `.env.local` or use the host’s encrypted environment-variable manager. Never paste secrets into source files, screenshots, issues, or chat logs.

## Minimum stack for the master command center

### 1. Supabase

Create one production Supabase project and run the SQL migrations under `apps/command-center/supabase/migrations` in filename order.

Set:

- `NEXT_PUBLIC_SUPABASE_URL`: project URL; safe for browser use
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: public/anon key; safe for browser use only when Row Level Security is correct
- `SUPABASE_URL`: project URL for server routes
- `SUPABASE_SERVICE_ROLE_KEY`: server-only service-role key; never expose it with a `NEXT_PUBLIC_` prefix

Before launch, verify that Row Level Security isolates every client by `client_id` and that admin routes never return service-role credentials.

### 2. Telnyx

Create a Telnyx account, configure messaging-capable numbers, and complete required messaging registration and consent setup.

Set:

- `TELNYX_API_KEY`
- `TELNYX_DEMO_FROM_NUMBER` in E.164 format
- `TELNYX_PUBLIC_KEY` from the Telnyx webhook-signing configuration
- `LEADSHIELD_SYNC_TOKEN` to a new random server-to-server secret

Point the applicable voice and messaging webhooks to the deployed Trade Fortress endpoints. Test missed-call behavior, delivery status, STOP handling, duplicate webhooks, and retries before connecting a customer number.

### 3. Resend and domain email

Create a Resend account, verify a sending domain, and publish the required DNS records.

Set:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` using the verified domain

Use a monitored reply-to mailbox. Test success, provider rejection, bounce, and missing-configuration paths.

### 4. Stripe

Create the three recurring prices used by the application and configure a webhook endpoint for the deployed app.

Set:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_OPERATOR`
- `STRIPE_PRICE_TEAM`
- `STRIPE_PRICE_VOICE`

Start in Stripe test mode. Verify checkout, subscription activation, payment failure, cancellation, duplicate webhook delivery, and client-access changes before switching to live keys.

### 5. Module URLs and health checks

Deploy each enabled service and set its user-facing and server health URLs where applicable:

- `NEXT_PUBLIC_LEAD_ENGINE_URL`
- `NEXT_PUBLIC_GRANT_COMMAND_URL`
- `NEXT_PUBLIC_SMALLCLAIMS_URL` (legacy variable name for Construction Collections)
- `LEAD_ENGINE_HEALTH_URL`
- `CONSTRUCTION_COLLECTIONS_HEALTH_URL`
- `GRANT_COMMAND_HEALTH_URL`

Health URLs must be callable from the command-center host and must not reveal secrets, customer records, or internal stack traces.

## Optional module providers

### COAI Lead Engine

Configure only the AI provider actually used. `AI_PROVIDER` selects the provider; do not enter unnecessary keys.

- `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, or `PERPLEXITY_API_KEY`
- `GOOGLE_PLACES_API_KEY` for approved location and business discovery
- `CAPSOLVER_API_KEY` and proxy variables only when their use is lawful, necessary, and permitted by the target service
- `APP_PASSWORD` for the service access gate

### Grant Command

- Supabase public URL/anon key and server-only service role
- `ANTHROPIC_API_KEY`

Grant Command is optional. Its copy and workflows must not promise funding or imply government affiliation.

### Construction Collections

- Supabase server credentials
- `OPENAI_API_KEY` and `OPENAI_MODEL` if AI document processing is enabled
- Resend sender credentials
- `PDFSHIFT_API_KEY` if hosted PDF rendering is enabled
- Square webhook signature and notification URL if Square events are enabled
- new random values for `WORKER_SECRET` and `ADMIN_REPLAY_TOKEN`
- alert/webhook URLs and rate-limit/table settings from its `.env.example`

This module organizes construction payment and document workflows. It must not be marketed as a law firm or as legal advice.

## Deployment order

1. Choose the production domain and decide whether `leadshield.live` remains public or redirects to a Trade Fortress domain.
2. Create Supabase, run migrations, enable RLS, and create a non-production test tenant.
3. Deploy the command center with Supabase configured; verify authentication and tenant isolation.
4. Configure Telnyx in a test flow and validate consent, STOP, retry, and delivery logging.
5. Configure Resend with a verified domain and monitored mailbox.
6. Configure Stripe test mode and verify the full billing lifecycle.
7. Deploy optional modules one at a time and add their health URLs to the orchestrator.
8. Run end-to-end tests with sample tenants before entering real client information.
9. Rotate any credential ever shared in a repository, screenshot, terminal transcript, or chat.
10. Add production monitoring, backups, incident contacts, and a credential-rotation owner.

## Credential handoff still required

The default centralized files (`Documents/Access.txt`, `Access.txt`, `.secrets/keys.txt`, and `.credentials.txt`) were not present during this audit. To wire providers, supply a secure credentials-file path or enter values directly in the hosting provider’s encrypted environment manager. Validate values with small provider-auth checks and report them only in masked form.

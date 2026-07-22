# Trade Fortress production setup

## What is in this folder

- `apps/command-center`: master login, tenants, leads, missed calls, customers, jobs, permits, proposals, materials, and credentials.
- `services/coaileads`: lightweight Google Places lead finder.
- `services/coai-lead-engine`: deeper lead research and outreach-draft service.
- `services/grant-command`: grant research and proposal-draft application.
- `services/smallclaimspro`: construction-collections workflow for eligible unpaid contractor invoices.

The command center is the master customer and job record. Specialist services remain separately deployable so payment, document-production, and lead-research failures cannot take down the CRM. Grant Command is optional per client.

## 1. Accounts you need

1. **Vercel** for the command center, lead engine, and Grant Command deployments.
2. **Supabase** for authentication and the master Postgres database.
3. **Telnyx** for a tracking number, missed-call webhook, and SMS replies.
4. **Google Places API** for local-business lead discovery.
5. **Netlify** for SmallClaimsPro functions and scheduled workers.
6. **Square** for checkout and signed payment webhooks.
7. **OpenAI** for packet generation and **Anthropic** for grant drafting.
8. **Resend** with a verified sending domain for transactional email.
9. **PDFShift** for delivered PDF packets.

Optional lead-research providers are Gemini, Perplexity, CapSolver, and a residential proxy. Do not configure them until the basic lead finder works and their cost is justified.

## 2. Master command center

1. Create or select the Supabase project.
2. Apply every SQL file in `apps/command-center/supabase/migrations` in filename order.
3. Copy `apps/command-center/.env.example` to `.env.local` and enter the Supabase keys.
4. Create separate admin and client users. Set each `clients.role`; never share the service-role key with a browser.
5. In Telnyx, point the missed-call webhook to `https://YOUR-DOMAIN/api/webhook/missed-call` and configure a messaging number.
6. Deploy `apps/command-center` to Vercel and set the same environment variables there.

## 3. Lead systems

Deploy `services/coaileads` first. Set:

- `APP_PASSWORD`: a unique server-side password.
- `GOOGLE_PLACES_API_KEY`: restrict it to the required API and deployment.

Deploy `services/coai-lead-engine` only for deeper research. Start with `APP_PASSWORD` and `GOOGLE_PLACES_API_KEY`; add one AI provider key only if outreach drafting is used. Outreach must remain review-before-send.

Set the deployed URL as `NEXT_PUBLIC_LEAD_ENGINE_URL` in the command center.

## 4. Grant Command

1. Create a separate Supabase project or deliberately migrate its tables into the master project after reviewing row-level-security policies.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `ANTHROPIC_API_KEY`.
3. Deploy `services/grant-command` to Vercel.
4. Set its URL as `NEXT_PUBLIC_GRANT_COMMAND_URL` in the command center.
5. Require human approval before any proposal is submitted.

## 5. SmallClaimsPro

1. Apply `services/smallclaimspro/PRODUCTION_SCHEMA.sql` to its Supabase project.
2. Configure all variables documented in `services/smallclaimspro/.env.example`.
3. Deploy to Netlify and configure the scheduled queue worker.
4. Create the Square webhook using the deployed `square-webhook` function URL and store its signature key.
5. Verify the Resend domain and sender address; send a real test email.
6. Run one sandbox payment through intake, signed webhook, queue, AI generation, PDF generation, and email delivery before enabling live payments.
7. Keep `AUTO_PROCESS_INTAKE=false` until the full sandbox path passes and packet language has been reviewed for legal-compliance boundaries.
8. Set its URL as `NEXT_PUBLIC_SMALLCLAIMS_URL` in the command center.

## 6. Customer provisioning

For every trades customer:

1. Create a Supabase auth user and matching `clients` row with `role=client`.
2. Assign a Telnyx tracking number and test call forwarding plus missed-call SMS.
3. Add the customer, first job, credentials, and service-area settings.
4. Confirm the account cannot open `/admin` or another tenant's records.
5. Run a test missed call, lead status update, job creation, proposal/material entry, and credential export.
6. Enable only the package modules the customer purchased.

## 7. Release gate

Do not accept a customer's live payment until all of these pass:

- `npm run install:all`
- `npm run check`
- Supabase migrations are applied and row-level security is enabled.
- Admin/client role isolation and two different tenant accounts are tested.
- Telnyx signature, forwarding, opt-out handling, and SMS delivery are verified.
- Square signature and duplicate-event handling are verified in sandbox.
- Resend sender domain and real inbox delivery are verified.
- No secrets are tracked by Git.
- Privacy policy, terms, service agreement, refund terms, and legal-document disclaimer match the actual package.
- Backups, error alerts, support ownership, and customer offboarding are documented.

## 8. Multi-client orchestrator

1. Apply `apps/command-center/supabase/migrations/20260722_add_orchestrator.sql`.
2. Add one `client_modules` row per purchased module. Every client receives `core`; grants remain optional.
3. Configure the three server-side health URLs in `apps/command-center/.env.local`.
4. Sign in as an admin and open `/admin/orchestrator`.
5. Run checks before onboarding, after provider changes, and whenever a client reports an issue.
6. Treat `action_required` as an operating queue: fix overdue payments, inactive numbers, failed SMS, missing URLs, or unhealthy services before marking the client healthy.

The prototype is available at `/demo` and intentionally uses labeled sample data. It does not require provider credentials.

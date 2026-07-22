# Database Schema Reference

## Trade CRM relationships

- `clients.id` 1:N `trade_customers.client_id`
- `clients.id` 1:N `trade_jobs.client_id`
- `clients.id` 1:N `trade_job_items.client_id`
- `trade_customers.id` 1:N `trade_jobs.customer_id`
- `trade_customers.id` 1:N `trade_job_items.customer_id`
- `trade_jobs.id` 1:N `trade_job_items.job_id`

All public IDs are UUIDs. All tenant queries filter by `client_id`. `trade_job_items.kind` is one of `permit`, `document`, `proposal`, or `material`. Money and quantity values are non-negative numeric fields. Optional contact, linkage, date, and notes fields are nullable.

## Client login identity

- `clients.username` is an optional, case-insensitive unique login name using 3-32 lowercase letters, numbers, or underscores.
- Supabase Auth continues to use the client's email internally. The server resolves a username to that email without exposing the mapping to the browser.
- `clients.role` controls the post-login destination and protects every admin API. Tradesman accounts use the `client` role and land on `/crm`.

## Orchestrator

- `clients.id` 1:N `client_modules.client_id`; modules are `core`, `lead_engine`, `construction_collections`, or optional `grants`.
- `clients.id` 1:N `orchestrator_checks.client_id`; null `client_id` represents a platform-wide check.
- Health status is `healthy`, `degraded`, or `action_required` with response time, detail, and timestamp.

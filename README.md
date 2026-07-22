# Trade Fortress

Trade Fortress is a multi-tenant command center for trade-service businesses. The production web application lives in `apps/command-center` and includes the public sales site, contractor CRM, admin orchestration, missed-call text-back webhook, trade operations, and provider integration points.

## Local verification

```powershell
cd apps/command-center
npm.cmd install
npm.cmd run lint
npm.cmd run build
npm.cmd run start -- -p 3001
$env:SMOKE_BASE_URL='http://127.0.0.1:3001'
npm.cmd run smoke
```

## Vercel setup

Import `jasonmanuel-cmd/tradefortress` into Vercel and set the project **Root Directory** to:

```text
apps/command-center
```

Vercel will detect Next.js and use the committed `package-lock.json`, `vercel.json`, and build script. Copy every required key from `apps/command-center/.env.example` into Vercel's encrypted environment-variable settings. Do not commit `.env.local` or provider credentials.

The public site can deploy without provider keys, but authentication, SMS, email, billing, and orchestrator integrations are not production-ready until their credentials and migrations are configured. Follow [ENVIRONMENT-SETUP.md](ENVIRONMENT-SETUP.md) and [apps/command-center/DEPLOYMENT.md](apps/command-center/DEPLOYMENT.md).

## Repository layout

- `apps/command-center` — production Next.js application
- `services` — optional connected service modules
- `sales` — outreach and sales material
- `uploads` — supplied media assets used by the project
- `tradesman_package` — supporting product package and legacy prototypes

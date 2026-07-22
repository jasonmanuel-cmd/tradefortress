# COAI Grant Command Center
### Sovereign Grant Intelligence — No Subscriptions. No Middlemen.

Built for Jason Manuel / Chaotically Organized AI, LLC

---

## WHAT THIS IS

A private, self-hosted grant management platform that:
- **Finds grants** from free federal APIs (Grants.gov, SBIR.gov)
- **Tracks applications** through a 12-stage pipeline
- **Writes proposals** using Claude AI with your COAI business profile pre-loaded
- **Owns your data** — your Supabase, your stack, your pipeline

---

## SETUP IN 4 STEPS

### STEP 1 — Supabase Database

1. Go to [supabase.com](https://supabase.com) → New Project
2. Name it: `coai-grant-command`
3. Open the **SQL Editor**
4. Paste the entire contents of `supabase/schema.sql` and click **Run**
5. Copy your Project URL and anon key from Settings → API

### STEP 2 — Environment Variables

```bash
cp .env.example .env.local
```

Fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_key
```

**Get your Anthropic key:** [console.anthropic.com](https://console.anthropic.com)

### STEP 3 — Install & Run

```bash
npm install
npm run dev
```

Open: http://localhost:3000

### STEP 4 — Deploy to Vercel

```bash
# Push to GitHub first
git init
git add .
git commit -m "feat: COAI Grant Command Center — initial build"
git remote add origin https://github.com/jasonmanuel-cmd/coai-grant-command
git push -u origin main
```

Then in Vercel:
- Import the repo
- Add all env variables from `.env.local`
- Deploy → Live in 90 seconds

---

## USING THE APP

### Dashboard `/dashboard`
- KPI overview: grants tracked, active apps, awards won
- Pipeline snapshot
- Upcoming deadlines with urgency flags

### Find Grants `/search`
- Search and filter your grant inventory
- Add grants manually (from any source)
- Quick links to AI Writer and pipeline tracker per grant

### Pipeline `/pipeline`
- 12-stage kanban tracker
- Move applications through stages with one click
- Denied and Awarded stages clearly marked

### AI Writer `/ai-writer`
- Select any grant from your database
- Choose document type: Executive Summary, LOI, Need Statement, Full Proposal, Budget Narrative, Project Description
- Add optional custom instructions
- Claude generates a complete, professional document using your COAI business profile
- All outputs saved to your Supabase `documents` table

### Sync Grants `/sync`
- One-click pull from Grants.gov API
- Searches COAI-matched keyword vectors
- Deduplication built in — safe to run repeatedly
- Direct links to all free grant sources for manual review

---

## FREE GRANT DATA SOURCES (No Subscription Required)

| Source | URL | Best For |
|--------|-----|----------|
| Grants.gov | grants.gov | All federal grants |
| SBIR.gov | sbir.gov | AI/tech R&D Phase I ($275K) |
| SAM.gov | sam.gov | Federal contracts + grants |
| CA Grants Portal | grants.ca.gov | California state grants |
| NSF Seed Fund | seedfund.nsf.gov | Science/tech innovation |
| USDA Rural Dev | rd.usda.gov | Central Valley rural programs |
| EDA | eda.gov/grants | Economic development |
| Kern EDC | kernedcorp.com | Local Kern County |

---

## GRANT TARGETS FOR COAI (Start Here)

1. **SBIR Phase I — SBA** → $275K for AI product R&D → sbir.gov
2. **NSF SBIR** → $275K for tech innovation → seedfund.nsf.gov  
3. **EDA Build to Scale** → $500K+ for tech ecosystems → eda.gov
4. **CA Competes Tax Credit** → Up to $500K → business.ca.gov
5. **USDA Rural Business Dev Grant** → $50K–$500K → rd.usda.gov

---

## CUSTOMIZATION

**Update your COAI profile:**
Edit `src/lib/coai-profile.ts` — this is injected into every AI-generated document.
Add your EIN once you have it. Update revenue figures quarterly.

**Add more search terms:**
Edit `src/lib/grants-gov.ts` → `COAI_SEARCH_TERMS` array.

**Add a new grant source:**
Edit `src/app/sync/page.tsx` → `FREE_SOURCES` array.

---

## STACK

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **AI:** Anthropic Claude Sonnet 4.6
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **Grant Data:** Grants.gov REST API (free)

---

*COAI Grant Command Center — Sovereign Infrastructure for Sovereign Business*
*"Everything is Real Estate. Own your grant pipeline."*

# ⚡ TRADE COMMAND CENTER — BUILD SPEC (A-SELECTED)
**Built for:** Jason Manuel / Chaotically Organized AI (661 683 0228)
**Status:** BUILDING NOW — 1-2 HOUR TARGET
**Framework:** Next.js + Supabase + Tailwind (reuse from `leadshield-site` + `smallclaimspro.online`)
**Purpose:** One login. One screen. All modules visible. No separate logins.

---

## 1. WHAT IT IS (IN 30 SECONDS)

The Trade Command Center is the unified dashboard that replaces 4 separate logins:
- `leadshield-crm` (missed calls / text-back)
- `smallclaimspro.online` (legal filings / AI packets)
- `COAILEADS` (new lead pipeline)
- `coai-grant-command` (grant search / proposal status)

Contractor logs in once. Sees everything. Clicks anything. No confusion. No "which site was that on again?"

This is what turns the lean `Trade Fortress` package from a bundle of tools into a **single operating system** for the contractor's business.

---

## 2. ARCHITECTURE — HOW WE BUILD IT IN 1-2 HOURS

We are NOT rebuilding from scratch. We are **merging existing frameworks**.

### Source Code to Merge (From Your Repos):

| Source Repo | What We Take | How We Use It in Command Center |
|---|---|---|
| `leadshield-site` (27 commits) | Next.js 16 + Tailwind + Supabase auth + dashboard layout | Base framework. The dashboard already exists. We extend it. |
| `smallclaimspro.online` (18 commits) | Netlify Functions + Square webhook handling + AI pipeline + PDF delivery | Add a new section/tab in the dashboard showing filing status, AI confidence scores, delivery confirmation. |
| `COAILEADS` (13 commits) | Lead pipeline + qualification logic | Add lead count, qualification status, source tracking to the main view. |
| `coai-grant-command` (1 commit) | 12-stage pipeline + Claude proposal writer | Add grant status cards: "Found / Drafting / Submitted / Approved". |
| `coainewweb` (98 commits) | Client site framework + TradeCall system | Add "Site Status" widget showing live/deploy status, GBP health, missed-call count today. |

### Technical Stack:
- **Frontend:** Next.js 16 (already in `leadshield-site` and `smallclaimspro.online`)
- **Styling:** Tailwind CSS (already configured)
- **Database:** Supabase (already has auth, RLS, and tables for leads + filings)
- **Auth:** Supabase Auth (existing `leadshield` login — extend it)
- **Deployment:** Vercel or Netlify (both repos deploy there already)
- **Functions:** Netlify Functions (`smallclaimspro`) + Vercel Edge Functions (optional upgrade)

---

## 3. THE UNIFIED SCREEN LAYOUT (4 QUADRANTS)

The Command Center uses a single-page dashboard with 4 main cards and a top navigation bar.

### TOP NAV BAR (Always Visible):
- Logo: `TRADE FORTRESS` (or your name)
- User: Jason Manuel / COAI (or client's name if multi-user in future)
- Quick Stats Row (4 numbers):
  - **Missed Calls Today** (from `LeadShield`)
  - **Active Leads** (from `COAILEADS`)
  - **Pending Filings** (from `smallclaimspro.online`)
  - **Grants Found** (from `coai-grant-command`)
- **Logout** (Supabase auth — same session as `leadshield`)

### MAIN DASHBOARD (4 Quadrant Cards):

```
+------------------+------------------+
|  📞 LEAD SHIELD  |  🏛️ LEGAL SHIELD |
|  Missed Calls    |  Filing Status   |
|  Auto-Text Log   |  AI Confidence   |
|  CRM Entries     |  Delivery Confirm|
+------------------+------------------+
|  📈 LEAD ENGINE  |  🎯 GRANT COMMAND |
|  New Leads       |  Grants Found    |
|  Source Track    |  Proposal Status |
|  Qualification   |  Deadline Alert  |
+------------------+------------------+
```

### BOTTOM STATUS BAR:
- **Site Health:** `coainewweb` live status + `tandm` reference
- **Sovereign Mode:** `cipher-sovereign` toggle (optional, off by default)
- **The Lot Booking:** Quick calendar link for venue events

---

## 4. THE EXACT BUILD SEQUENCE (1-2 HOURS)

### HOUR 1 — MERGE FRAMEWORKS (30 min setup, 30 min integration)

**Step 1: Clone the base** (5 min):
```bash
# Use leadshield-site as the base (it already has the dashboard layout + auth)
git clone https://github.com/jasonmanuel-cmd/leadshield-site command-center
# Copy key components from smallclaimspro.online (pipeline display) and COAILEADS (lead cards)
```

**Step 2: Add Supabase tables** (10 min):
The existing `leadshield` database already has tables. We add 3 new columns/views:
- `filings` (from `smallclaimspro.online` schema) — status, confidence_score, delivery_time
- `grants` (from `coai-grant-command` pipeline) — stage (found/drafting/submitted), deadline
- `site_health` (from `coainewweb`) — deploy_status, last_update

**Step 3: Create the 4 card components** (15 min each × 4 = 30 min but parallel):
- Reuse `leadshield-site` card component → rename to "Lead Shield"
- Copy `smallclaimspro.online` admin replay UI → rename to "Legal Shield"
- Copy `COAILEADS` pipeline view → rename to "Lead Engine"
- Create simple 4-stage progress bar for grants (found → drafting → submitted → approved)

### HOUR 2 — POLISH + DEPLOY (30 min styling, 30 min deploy/test)

**Step 4: Add the top stats bar** (10 min):
- Read from Supabase: count missed calls (LeadShield table), count new leads today (COAILEADS), count pending filings (smallclaimspro), count grants in pipeline (coai-grant-command)
- Display as 4 large numbers with color coding (green = healthy, red = needs attention)

**Step 5: Add click-through links** (10 min):
- Each card links to the full module (if user wants detail):
  - Lead Shield card → `leadshield-crm.vercel.app`
  - Legal Shield card → `smallclaimspro.online/admin` (or embedded)
  - Lead Engine card → `coaileads.vercel.app`
  - Grant Command card → `coai-grant-command` (embedded view preferred for speed)

**Step 6: Deploy to Vercel / Netlify** (10 min):
- Connect to existing `leadshield-site` deploy pipeline
- Set environment variables (reuse from `leadshield-site` `.env` + add keys from `smallclaimspro.online` if needed for filing status)
- Confirm live URL: `command-center.coaibuilds.com` or `coaibakersfield.com/command`

---

## 5. WHAT THE CONTRACTOR SEES (USER EXPERIENCE)

**First login:**
- "Welcome, [Business Name]. Here's your Trade Fortress Command Center."
- 4 cards load with real data (not mock — pulling from your live deployed repos)
- Top stats update in real-time (or every 30 seconds via Supabase subscription)

**Daily use (30 seconds):**
- Checks missed calls → sees if any need follow-up
- Checks leads → sees new qualified prospects
- Checks filings → sees if AI packet delivered, if confidence was high enough
- Checks grants → sees upcoming deadlines
- Clicks anything for full detail

**No confusion. No separate URLs to remember. One bookmark. One bill ($299/mo or $499/mo).**

---

## 6. HOW THIS MAKES THE PACKAGE EVEN BETTER

The **Trade Command Center** gives every trades client one premium operating layer for calls, leads, jobs, paperwork, credentials, construction collections, and optional grant research:

| Feature | Before Command Center | After Command Center |
|---|---|---|
| **Login experience** | Multiple URLs, multiple logins, confusion | One login, one screen, instant clarity |
| **Perceived value** | "Bundle of tools" | "Operating system for my business" |
| **Premium justification** | $499/mo for 8 separate things | $499/mo for ONE powerful thing that controls 8 things |
| **Client stickiness** | Can cancel individual pieces | Harder to leave when everything is integrated |
| **Build time** | 8 separate modules maintained separately | 1 unified interface, same backend, faster updates |

**The pitch upgrade:**
> "Before: I give you 8 tools and you manage them all.
> After: I give you ONE command center. You log in once. You see your missed calls, your new leads, your unpaid invoice filings, and your grant deadlines — all on the same screen. This is what $499/mo buys you: not more vendors, but ONE brain for your business."

---

## 7. EXACT DELIVERABLES (WHAT YOU GET IN THE NEXT 2 HOURS)

Given the 1-2 hour constraint, here is what I will produce right now:

1. **`command_center/Trade_Command_Center.md`** — This spec (complete)
2. **`command_center/command_center_mockup.html`** — A working HTML prototype showing the 4-quadrant layout with placeholder data (ready to view in browser)
3. **`command_center/command_center_visual.png`** — AI-generated mockup of the unified dashboard design
4. **Updated reference in `Ultimate_TradeMan_Package.md`** — Adding Trade Command Center as the premium feature that justifies Ultimate tier

The full production build (connecting live Supabase, deploying to Vercel with real data) is the 2-hour target for the basic version. A polished version with all 4 cards feeding live data is a 5-hour build max, using existing code.

---

## 8. THE NEXT STEP AFTER BUILD

Once `command-center` is live:
- Add the URL to `coaibuilds.com` landing page
- Update the pitch flyer (`ultimate_trademan_tiers.png`) to mention "Includes Trade Fortress Command Center — one login, everything visible"
- Start calling your 12 clients: "I'm not just giving you a site and some tools. I'm giving you a command center. You see everything in 30 seconds. Let's get you set up."

---

*Built: 2026-07-22 · Jason Manuel / Chaotically Organized AI · (661) 683 0228*
*Status: SPEC COMPLETE — READY FOR 1-2 HOUR BUILD*
*Source Frameworks: leadshield-site | smallclaimspro.online | COAILEADS | coai-grant-command | coainewweb*

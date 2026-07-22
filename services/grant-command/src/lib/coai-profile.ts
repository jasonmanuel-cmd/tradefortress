// COAI Business Profile — Injected into every AI grant writing prompt
// Update this when business details change

// ⚠️ VERIFICATION RULE: Every claim in this profile flows into federal and
// state grant applications. Anything unverifiable = potential grant fraud.
// Before first submission, Jason must confirm: EIN, founding date, revenue
// figures, client names (get permission to name them), employee count,
// NAICS code, and certifications. When in doubt, cut it.

export const COAI_PROFILE = `
## ORGANIZATION: Chaotically Organized AI, LLC (COAI)

**Business Type:** Limited Liability Company — Technology & AI Consulting
**Founded:** 2023 [VERIFY: match your Articles of Organization filing date]
**Location:** 1712 19th St #216, Bakersfield, CA 93301 (Kern County — 661 Market)
**CEO:** Jason Manuel
**Website:** coaibakersfield.com
**Email:** jason@coaibakersfield.com
**Phone:** 661-569-4244
**NAICS Code:** 541511 — Custom Computer Programming Services
**Employees:** 1-5 (micro-enterprise / startup)
**Annual Revenue:** Under $500K (early-stage)

**Mission:**
To deliver sovereign AI infrastructure, automation, and digital architecture to underserved local small businesses in California's Central Valley — giving trades, service businesses, and SMBs in Bakersfield/Kern County access to enterprise-grade technology at accessible pricing.

**Core Services:**
- Custom web application development (Next.js, React, full-stack)
- AI automation systems (Make.com, custom workflows, CRM integrations)
- SEO, GEO, and AEO (Answer Engine Optimization) for local market dominance
- AI voice agents (Cipher — our proprietary voice receptionist product)
- Business process automation and lead generation infrastructure
- Missed-call-text-back systems (LeadShield product)

**Current Active Clients:**
- Central California AC (HVAC — $5,000 contract, digital infrastructure)
- T&M Hauling (AI voice agent deployment)
- Poison Well Records (Digital music hub + media production)
- DFFB Management Group (Senior living lead funnel automation)

**Products in Market:**
- Cipher — AI voice receptionist ($500 setup + $297/month)
- LeadShield — Android missed-call-text-back app (Google Play)
- FeeScout — Blockchain gas fee tracker
- SiteForge — Construction management SaaS

**Community Impact:**
COAI operates in Bakersfield's Oildale corridor — a historically underserved, working-class community with significant trades/blue-collar employment. Our technology services reduce the digital divide between Central Valley small businesses and coastal tech-enabled competitors.

**Competitive Differentiation:**
Unlike national agencies, COAI embeds in the local 661 market — same-day response, face-to-face relationships, and technology built specifically for the trades/service industries that define Kern County's economy.

**Founder Background:**
Jason Manuel brings 13+ years of construction and trades experience combined with AI systems development expertise. This dual background uniquely positions COAI to serve trades businesses with technology that actually fits their workflows.

**Certifications:**
[VERIFY BEFORE ANY SUBMISSION — Jason: list ONLY certifications you hold with
documentation in hand. Do NOT list pending, planned, or heritage-based claims
you cannot document. Federal applications treat unverified claims as fraud.
Delete this bracket and replace with verified certifications, or delete the
section entirely if none are held yet.]

**Technology Stack:**
Next.js, React, Supabase, PostgreSQL, Anthropic Claude API, Make.com, Vercel, Node.js, Python

**Grant Fit Profile:**
COAI is strongest fit for grants targeting:
- Small/micro business technology development
- Rural and underserved community economic development
- AI/tech innovation at the small business level
- Central Valley / Kern County / California-specific funding
- SBIR Phase I (R&D in AI applications)
- Workforce development through technology
- Minority/disadvantaged business development
`

export const COAI_SHORT_PROFILE = `
Chaotically Organized AI, LLC (COAI) — Bakersfield, CA. AI consulting and automation firm serving local SMBs in Kern County's Central Valley. CEO: Jason Manuel. Founded 2023. 1-5 employees. NAICS 541511. Services: AI automation, web development, voice agents, SEO. Active clients in HVAC, hauling, music, and senior living sectors.
`

// Stage name lookup
export const PIPELINE_STAGES: Record<number, { name: string; color: string }> = {
  1:  { name: 'Interest',   color: '#6366F1' },
  2:  { name: 'Eligible',   color: '#8B5CF6' },
  3:  { name: 'Calendar',   color: '#F59E0B' },
  4:  { name: 'Writing',    color: '#3B82F6' },
  5:  { name: 'Review',     color: '#06B6D4' },
  6:  { name: 'Final',      color: '#10B981' },
  7:  { name: 'Submitted',  color: '#84CC16' },
  8:  { name: 'Denied',     color: '#EF4444' },
  9:  { name: 'Awarded',    color: '#F97316' },
  10: { name: 'Implement',  color: '#14B8A6' },
  11: { name: 'Reporting',  color: '#A855F7' },
  12: { name: 'Post Award', color: '#64748B' },
}

export const GRANT_CATEGORIES = [
  'ai', 'tech', 'small_business', 'community', 'workforce',
  'research', 'minority_business', 'rural', 'construction', 'media'
]

export const GRANT_TYPES = ['federal', 'state', 'foundation', 'corporate', 'local']

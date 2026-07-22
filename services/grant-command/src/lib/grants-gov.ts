// Grants.gov API Integration — v1.1
// VERIFIED LIVE 2026-07-02 against https://api.grants.gov/v1/api/search2
// POST-based REST API. No authentication required.
// Docs: https://www.grants.gov/api/api-guide

const SEARCH2_URL = 'https://api.grants.gov/v1/api/search2'
const FETCH_OPP_URL = 'https://api.grants.gov/v1/api/fetchOpportunity'

// COAI-relevant search keywords — tighter terms, small-biz eligibility filter applied
export const COAI_SEARCH_TERMS = [
  'artificial intelligence',
  'small business technology',
  'digital economy rural',
  'economic development technology',
]

// Grants.gov eligibility code 23 = "Small businesses"
const SMALL_BIZ_ELIGIBILITY = '23'

export interface OppHit {
  id: string
  number: string
  title: string
  agencyCode: string
  agency: string
  openDate: string   // MM/DD/YYYY
  closeDate: string  // MM/DD/YYYY
  oppStatus: string
  docType: string
  cfdaList: string[]
}

/**
 * Search Grants.gov — POST with JSON body.
 * Response shape (verified): { errorcode, msg, data: { hitCount, oppHits: [...] } }
 */
export async function searchGrantsGov(keyword: string, rows = 15): Promise<OppHit[]> {
  try {
    const res = await fetch(SEARCH2_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keyword,
        oppStatuses: 'posted|forecasted',
        eligibilities: SMALL_BIZ_ELIGIBILITY,
        rows,
        startRecordNum: 0,
      }),
    })

    if (!res.ok) throw new Error(`search2 HTTP ${res.status}`)
    const json = await res.json()
    if (json.errorcode !== 0) throw new Error(`search2 error: ${json.msg}`)
    return json.data?.oppHits || []
  } catch (err) {
    console.error('Grants.gov search failed:', err)
    return []
  }
}

/**
 * Fetch full opportunity detail — award amounts, description, eligibility live here.
 * Response shape (verified): { data: { synopsis: { awardCeiling, awardFloor,
 *   synopsisDesc, applicantTypes, estimatedFunding, responseDate, ... } } }
 */
export async function fetchOpportunityDetail(oppId: string | number) {
  try {
    const res = await fetch(FETCH_OPP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opportunityId: Number(oppId) }),
    })
    if (!res.ok) throw new Error(`fetchOpportunity HTTP ${res.status}`)
    const json = await res.json()
    return json.data || null
  } catch (err) {
    console.error('fetchOpportunity failed:', err)
    return null
  }
}

/** Convert MM/DD/YYYY → YYYY-MM-DD for Postgres DATE column */
function toISODate(mdy: string | null | undefined): string | null {
  if (!mdy) return null
  const parts = mdy.split('/')
  if (parts.length !== 3) return null
  const [m, d, y] = parts
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

/** Strip HTML tags from synopsisDesc (Grants.gov returns HTML) */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
}

/**
 * Map search hit + optional detail to our grants schema
 */
export function mapToSchema(hit: OppHit, detail: any = null) {
  const syn = detail?.synopsis || {}
  const applicants = (syn.applicantTypes || [])
    .map((a: any) => a.description).join('; ')

  return {
    title: hit.title,
    funder: hit.agency,
    amount_min: syn.awardFloor ? Number(syn.awardFloor) : null,
    amount_max: syn.awardCeiling ? Number(syn.awardCeiling) : null,
    deadline: toISODate(hit.closeDate),
    category: 'small_business',
    grant_type: 'federal',
    location: 'National',
    description: syn.synopsisDesc ? stripHtml(syn.synopsisDesc).slice(0, 2000) : `${hit.title} — ${hit.agency}`,
    source_url: `https://www.grants.gov/search-results-detail/${hit.id}`,
    cfda_number: hit.cfdaList?.[0] || null,
    eligibility: applicants || null,
    status: 'active',
  }
}

/**
 * Normalize title+funder for fuzzy dedup — lowercase, strip punctuation/spaces
 */
export function dedupKey(title: string, funder: string): string {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  return `${norm(title)}::${norm(funder)}`
}

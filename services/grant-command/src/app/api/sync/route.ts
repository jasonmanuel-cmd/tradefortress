import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { createServerSupabase } from '@/lib/supabase-server'
import {
  searchGrantsGov, fetchOpportunityDetail, mapToSchema, dedupKey, COAI_SEARCH_TERMS
} from '@/lib/grants-gov'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  // Auth check — only logged-in users can trigger sync
  const userClient = createServerSupabase()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = supabaseAdmin()
  const results = { fetched: 0, inserted: 0, skipped: 0, errors: [] as string[] }

  try {
    // Build fuzzy dedup set from existing grants (title+funder normalized)
    const { data: existing } = await db.from('grants').select('title, funder, source_url')
    const existingKeys = new Set(
      (existing || []).map(g => dedupKey(g.title, g.funder))
    )
    const existingUrls = new Set((existing || []).map(g => g.source_url).filter(Boolean))

    for (const term of COAI_SEARCH_TERMS) {
      const hits = await searchGrantsGov(term, 10)
      results.fetched += hits.length

      for (const hit of hits) {
        try {
          const key = dedupKey(hit.title, hit.agency)
          const url = `https://www.grants.gov/search-results-detail/${hit.id}`

          // Fuzzy dedup: title+funder match OR exact URL match
          if (existingKeys.has(key) || existingUrls.has(url)) {
            results.skipped++
            continue
          }

          // Fetch detail for award amounts + description
          const detail = await fetchOpportunityDetail(hit.id)
          const mapped = mapToSchema(hit, detail)

          const { error } = await db.from('grants').insert(mapped)
          if (error) {
            results.errors.push(`Insert failed: ${error.message}`)
          } else {
            results.inserted++
            existingKeys.add(key)  // Prevent dupes within same sync run
            existingUrls.add(url)
          }
        } catch (e: any) {
          results.errors.push(e.message)
        }
      }
    }

    return NextResponse.json({ success: true, ...results })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, ...results }, { status: 500 })
  }
}

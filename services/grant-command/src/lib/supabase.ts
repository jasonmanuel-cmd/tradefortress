// Shared browser client + types
// Uses @supabase/ssr cookie-based sessions so RLS + middleware auth work correctly.
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
)

// ── Types ────────────────────────────────────────────────

export type Grant = {
  id: string
  title: string
  funder: string
  amount_min: number | null
  amount_max: number | null
  deadline: string | null
  category: string | null
  grant_type: string | null
  location: string | null
  description: string | null
  source_url: string | null
  requirements: string | null
  eligibility: string | null
  status: string
  is_saved: boolean
  created_at: string
}

export type Application = {
  id: string
  grant_id: string
  stage: number
  stage_name: string
  notes: string | null
  requested_amount: number | null
  awarded_amount: number | null
  submitted_date: string | null
  award_date: string | null
  result: string | null
  priority: string
  assigned_to: string
  created_at: string
  grants?: Grant
}

export type Document = {
  id: string
  application_id: string | null
  grant_id: string | null
  doc_type: string
  title: string | null
  content: string | null
  ai_generated: boolean
  version: number
  created_at: string
}

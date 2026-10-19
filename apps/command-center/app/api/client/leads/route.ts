import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { jsonError, noStore } from '@/lib/api'
import { getClientRecord } from '@/lib/session'
import { cleanMultiline, cleanText, oneOf } from '@/lib/validation'

const LEAD_STATUSES = ['new', 'called_back', 'quoted', 'booked', 'lost'] as const

async function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const cookieStore = await cookies()
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet, _headers) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
      },
    },
  })
}

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createServerClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    cookies: { getAll() { return [] }, setAll(_cookies, _headers) {} },
  })
}

export async function GET() {
  const supabase = await getClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return jsonError('Not authenticated', 401)
  }

  const profile = await getClientRecord(user.id)
  if (!profile) {
    return noStore(NextResponse.json({ leads: [], client: null }))
  }
  if (profile.status === 'suspended') {
    return jsonError('This account is suspended. Contact support to restore access.', 403)
  }

  const { data: leads, error } = await getAdmin()
    .from('lead_logs')
    .select('*')
    .eq('client_id', user.id)
    .order('timestamp', { ascending: false })

  if (error) {
    console.error('Lead list failed:', error.message)
    return jsonError('Could not load leads. Please refresh and try again.', 500)
  }

  return noStore(NextResponse.json({ leads: leads ?? [] }))
}

export async function PATCH(req: NextRequest) {
  const supabase = await getClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return jsonError('Not authenticated', 401)
  }

  const profile = await getClientRecord(user.id)
  if (!profile) return jsonError('No business account is linked to this login.', 403)
  if (profile.status === 'suspended') {
    return jsonError('This account is suspended. Contact support to restore access.', 403)
  }

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return jsonError('Invalid JSON', 400) }

  const id = typeof body.id === 'string' ? body.id : ''
  if (!id) return jsonError('A lead id is required.', 400)

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  let hasUpdate = false

  if (body.status !== undefined) {
    const status = oneOf(body.status, LEAD_STATUSES)
    if (!status) return jsonError('Choose a valid lead status.', 422)
    updates.status = status
    if (status === 'called_back') updates.called_back_at = new Date().toISOString()
    hasUpdate = true
  }

  if (body.contact_name !== undefined) {
    const contactName = cleanText(body.contact_name, 120)
    updates.contact_name = contactName || null
    hasUpdate = true
  }

  if (body.notes !== undefined) {
    const notes = cleanMultiline(body.notes, 5000)
    updates.notes = notes || null
    hasUpdate = true
  }

  if (!hasUpdate) {
    return jsonError('Nothing to update. Provide a status, contact name, or notes.', 400)
  }

  const { data, error } = await getAdmin()
    .from('lead_logs')
    .update(updates)
    .eq('id', id)
    .eq('client_id', user.id)
    .select('id')
    .maybeSingle()

  if (error) {
    console.error('Lead update failed:', error.message)
    return jsonError('Could not update this lead. Please try again.', 500)
  }
  if (!data) return jsonError('Lead not found.', 404)

  return noStore(NextResponse.json({ ok: true }))
}

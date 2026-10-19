import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { isAdminSession } from '@/lib/supabase-admin'
import { PLAN_KEYS, PLAN_MAP, normalizePlanKey } from '@/lib/plans'
import { cleanText, isEmail, isStrongEnoughPassword, oneOf } from '@/lib/validation'

const CLIENT_STATUSES = ['active', 'suspended', 'trialing'] as const
const PAYMENT_STATUSES = ['paid', 'unpaid', 'overdue'] as const

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// GET /api/admin/clients — list all clients with lead counts & phone
export async function GET() {
  if (!await isAdminSession()) return unauthorized()

  const supabase = getAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const [clientsRes, leadsRes, configRes] = await Promise.all([
    supabase.from('clients').select('*').order('created_at', { ascending: false }),
    supabase.from('lead_logs').select('client_id, id'),
    supabase.from('telephony_config').select('*').eq('is_active', true),
  ])

  if (clientsRes.error) {
    return NextResponse.json({ error: clientsRes.error.message }, { status: 500 })
  }

  const leadCounts: Record<string, number> = {}
  for (const row of leadsRes.data ?? []) {
    leadCounts[row.client_id] = (leadCounts[row.client_id] ?? 0) + 1
  }

  const configByClient: Record<string, NonNullable<typeof configRes.data>> = {}
  for (const row of configRes.data ?? []) {
    if (!configByClient[row.client_id]) configByClient[row.client_id] = []
    configByClient[row.client_id]!.push(row)
  }

  const clients = (clientsRes.data ?? []).map((c) => ({
    ...c,
    lead_count: leadCounts[c.id] ?? 0,
    telephony: configByClient[c.id] ?? [],
  }))

  return NextResponse.json({ clients })
}

// POST /api/admin/clients — provision a new client business
// PATCH /api/admin/clients — update client (suspend/activate, change plan, mark payment)
export async function PATCH(req: NextRequest) {
  if (!await isAdminSession()) return unauthorized()

  const supabase = getAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { id, status, plan_tier, monthly_fee, payment_status } = body as Record<string, string | undefined>

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Client id required' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}

  if (status !== undefined) {
    const nextStatus = oneOf(status, CLIENT_STATUSES)
    if (!nextStatus) return NextResponse.json({ error: 'Invalid account status' }, { status: 422 })
    updates.status = nextStatus
  }

  if (plan_tier !== undefined) {
    const nextPlan = oneOf(plan_tier, PLAN_KEYS)
    if (!nextPlan) return NextResponse.json({ error: 'Invalid plan' }, { status: 422 })
    updates.plan_tier = nextPlan
    // Keep the stored fee aligned with the catalogue unless a custom fee is sent.
    if (monthly_fee === undefined) updates.monthly_fee = PLAN_MAP[nextPlan].monthly
  }

  if (monthly_fee !== undefined) {
    const fee = Number.parseFloat(monthly_fee)
    if (!Number.isFinite(fee) || fee < 0 || fee > 100_000) {
      return NextResponse.json({ error: 'Monthly fee must be between 0 and 100000' }, { status: 422 })
    }
    updates.monthly_fee = Math.round(fee * 100) / 100
  }

  if (payment_status !== undefined) {
    const nextPayment = oneOf(payment_status, PAYMENT_STATUSES)
    if (!nextPayment) return NextResponse.json({ error: 'Invalid payment status' }, { status: 422 })
    updates.payment_status = nextPayment
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select('id, status, plan_tier, monthly_fee, payment_status')
    .maybeSingle()

  if (error) {
    console.error('Client update failed:', error.message)
    return NextResponse.json({ error: 'Could not update the client.' }, { status: 500 })
  }
  if (!data) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  return NextResponse.json({ ok: true, client: { ...data, plan_tier: normalizePlanKey(data.plan_tier) } })
}

export async function POST(req: NextRequest) {
  if (!await isAdminSession()) return unauthorized()

  const supabase = getAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    business_name,
    owner_name,
    email,
    password,
    provisioned_phone_number,
    forwarding_phone_number,
    sms_template,
  } = body as Record<string, string | undefined>

  const cleanBusinessName = cleanText(business_name, 120)
  const cleanEmail = isEmail(email) ? email.trim().toLowerCase() : ''

  if (!cleanBusinessName || !cleanEmail || !isStrongEnoughPassword(password)) {
    return NextResponse.json(
      { error: 'Business name, a valid email, and a password of at least 10 characters are required.' },
      { status: 422 }
    )
  }

  // 1. Create Supabase Auth user
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: cleanEmail,
    password,
    email_confirm: true,
    user_metadata: { business_name: cleanBusinessName, owner_name: owner_name ?? null },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  const userId = authUser.user.id

  // 2. Insert client record (id = auth user id so RLS works)
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert({
      id: userId,
      business_name: cleanBusinessName,
      owner_name: owner_name ?? null,
      email: cleanEmail,
      status: 'active',
    })
    .select()
    .single()

  if (clientError) {
    // rollback: delete auth user
    await supabase.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: clientError.message }, { status: 500 })
  }

  // 3. Create telephony config (optional)
  if (provisioned_phone_number && forwarding_phone_number) {
    const { error: telError } = await supabase.from('telephony_config').insert({
      client_id: userId,
      provisioned_phone_number,
      forwarding_phone_number,
      is_active: true,
    })

    if (telError) {
      await supabase.from('clients').delete().eq('id', userId)
      await supabase.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: telError.message }, { status: 500 })
    }
  }

  // 4. Create default text template (optional)
  if (sms_template) {
    await supabase.from('text_templates').insert({
      client_id: userId,
      trigger_event: 'no-answer',
      sms_body: sms_template,
    })
  }

  return NextResponse.json({ client }, { status: 201 })
}

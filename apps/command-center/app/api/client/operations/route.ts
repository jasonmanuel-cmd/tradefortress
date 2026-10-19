import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { TradeKind, TradeRecord } from '@/lib/trade-types'

const itemKinds = new Set<TradeKind>(['permit', 'document', 'proposal', 'material'])
const statuses = new Set(['open', 'scheduled', 'in_progress', 'complete', 'cancelled', 'draft', 'sent', 'approved', 'expired', 'ordered', 'received'])

async function userId() {
  const store = await cookies()
  const client = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => store.getAll(), setAll: (items) => items.forEach(({ name, value, options }) => store.set(name, value, options)) },
  })
  const { data: { user } } = await client.auth.getUser()
  return user?.id
}

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
}

function problem(status: number, title: string, detail: string) {
  return NextResponse.json({ title, status, detail }, { status })
}

async function accountBlocked(clientId: string) {
  const { data } = await admin()
    .from('clients')
    .select('status')
    .eq('id', clientId)
    .maybeSingle()
  return data?.status === 'suspended'
}

async function customerName(db: SupabaseClient, clientId: string, customerId?: string) {
  if (!customerId) return null
  const { data } = await db.from('trade_customers').select('name').eq('id', customerId).eq('client_id', clientId).maybeSingle()
  return data?.name ?? null
}

async function jobName(db: SupabaseClient, clientId: string, jobId?: string) {
  if (!jobId) return null
  const { data } = await db.from('trade_jobs').select('title').eq('id', jobId).eq('client_id', clientId).maybeSingle()
  return data?.title ?? null
}

export async function GET() {
  const clientId = await userId()
  if (!clientId) return problem(401, 'Not authenticated', 'Please sign in to continue.')
  if (await accountBlocked(clientId)) return problem(403, 'Account suspended', 'Contact support to restore access.')
  const db = admin()
  const [customers, jobs, items] = await Promise.all([
    db.from('trade_customers').select('*').eq('client_id', clientId).order('updated_at', { ascending: false }),
    db.from('trade_jobs').select('*, trade_customers(name)').eq('client_id', clientId).order('updated_at', { ascending: false }),
    db.from('trade_job_items').select('*, trade_customers(name), trade_jobs(title)').eq('client_id', clientId).order('updated_at', { ascending: false }),
  ])
  const error = customers.error || jobs.error || items.error
  if (error) return problem(500, 'Operations unavailable', 'The job board could not be loaded.')

  const records: TradeRecord[] = [
    ...(customers.data ?? []).map((row) => ({ ...row, kind: 'customer' as const, title: row.name, status: 'active', customer_id: row.id, job_id: null, customer_name: row.name, job_name: null, due_date: null, amount: null, quantity: null, unit: null })),
    ...(jobs.data ?? []).map((row) => ({ ...row, kind: 'job' as const, job_id: row.id, customer_name: row.trade_customers?.name ?? null, job_name: row.title, phone: null, amount: null, quantity: null, unit: null })),
    ...(items.data ?? []).map((row) => ({ ...row, customer_name: row.trade_customers?.name ?? null, job_name: row.trade_jobs?.title ?? null, phone: null })),
  ]
  return NextResponse.json({ records })
}

export async function POST(req: NextRequest) {
  const clientId = await userId()
  if (!clientId) return problem(401, 'Not authenticated', 'Please sign in to continue.')
  if (await accountBlocked(clientId)) return problem(403, 'Account suspended', 'Contact support to restore access.')
  const body = await req.json().catch(() => null)
  const kind = body?.kind as TradeKind
  const title = String(body?.title ?? '').trim()
  if (!kind || !title || title.length > 255) return problem(422, 'Invalid record', 'Choose a record type and enter a title under 256 characters.')
  const db = admin()

  if (kind === 'customer') {
    const { data, error } = await db.from('trade_customers').insert({ client_id: clientId, name: title, phone: body.phone || null, notes: body.notes || null }).select().single()
    if (error) return problem(500, 'Customer not saved', 'Please try again.')
    return NextResponse.json({ record: { ...data, kind, title: data.name, status: 'active', customer_id: data.id, job_id: null, customer_name: data.name, job_name: null, due_date: null, amount: null, quantity: null, unit: null } }, { status: 201 })
  }

  const linkedCustomer = await customerName(db, clientId, body.customer_id)
  if (body.customer_id && !linkedCustomer) return problem(422, 'Invalid customer', 'Choose a customer from this business.')
  if (kind === 'job') {
    const { data, error } = await db.from('trade_jobs').insert({ client_id: clientId, customer_id: body.customer_id || null, title, due_date: body.due_date || null, notes: body.notes || null }).select().single()
    if (error) return problem(500, 'Job not saved', 'Please try again.')
    return NextResponse.json({ record: { ...data, kind, job_id: data.id, customer_name: linkedCustomer, job_name: data.title, phone: null, amount: null, quantity: null, unit: null } }, { status: 201 })
  }

  if (!itemKinds.has(kind)) return problem(422, 'Invalid record type', 'Choose a supported record type.')
  const linkedJob = await jobName(db, clientId, body.job_id)
  if (body.job_id && !linkedJob) return problem(422, 'Invalid job', 'Choose a job from this business.')
  const { data, error } = await db.from('trade_job_items').insert({ client_id: clientId, customer_id: body.customer_id || null, job_id: body.job_id || null, kind, title, due_date: body.due_date || null, amount: body.amount ?? null, quantity: body.quantity ?? null, unit: body.unit || null, notes: body.notes || null }).select().single()
  if (error) return problem(500, 'Record not saved', 'Please check the values and try again.')
  return NextResponse.json({ record: { ...data, customer_name: linkedCustomer, job_name: linkedJob, phone: null } }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const clientId = await userId()
  if (!clientId) return problem(401, 'Not authenticated', 'Please sign in to continue.')
  if (await accountBlocked(clientId)) return problem(403, 'Account suspended', 'Contact support to restore access.')
  const body = await req.json().catch(() => null)
  if (!body?.id || !body?.kind || !statuses.has(body.status)) return problem(422, 'Invalid update', 'Record id, type, and a valid status are required.')
  const table = body.kind === 'job' ? 'trade_jobs' : itemKinds.has(body.kind) ? 'trade_job_items' : null
  if (!table) return problem(422, 'Invalid update', 'This record type cannot use job statuses.')
  const { data, error } = await admin().from(table).update({ status: body.status, updated_at: new Date().toISOString() }).eq('id', body.id).eq('client_id', clientId).select('id').maybeSingle()
  if (error) return problem(500, 'Update failed', 'Please try again.')
  if (!data) return problem(404, 'Record not found', 'That record no longer exists.')
  return NextResponse.json({ ok: true })
}

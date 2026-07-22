import { NextResponse } from 'next/server'
import { getAdmin, isAdminSession } from '@/lib/supabase-admin'

type Status = 'healthy' | 'degraded' | 'action_required'

async function checkService(system: string, url?: string) {
  if (!url) return { system, status: 'action_required' as Status, response_ms: null, detail: 'Deployment URL is not configured' }
  const started = Date.now()
  try {
    const response = await fetch(url, { method: 'HEAD', cache: 'no-store', signal: AbortSignal.timeout(5000) })
    return { system, status: (response.ok ? 'healthy' : 'degraded') as Status, response_ms: Date.now() - started, detail: `HTTP ${response.status}` }
  } catch (error) {
    return { system, status: 'action_required' as Status, response_ms: Date.now() - started, detail: error instanceof Error ? error.message : 'Health check failed' }
  }
}

export async function GET() {
  if (!await isAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = getAdmin()
  if (!admin) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const [clientsResult, phonesResult, leadsResult, modulesResult, services] = await Promise.all([
    admin.from('clients').select('id,business_name,status,payment_status').order('business_name'),
    admin.from('telephony_config').select('client_id,is_active'),
    admin.from('lead_logs').select('client_id,timestamp,sms_sent_status').gte('timestamp', new Date(Date.now() - 86400000).toISOString()),
    admin.from('client_modules').select('client_id,module,enabled'),
    Promise.all([
      checkService('lead_engine', process.env.LEAD_ENGINE_HEALTH_URL || process.env.NEXT_PUBLIC_LEAD_ENGINE_URL),
      checkService('construction_collections', process.env.CONSTRUCTION_COLLECTIONS_HEALTH_URL || process.env.NEXT_PUBLIC_SMALLCLAIMS_URL),
      checkService('grants', process.env.GRANT_COMMAND_HEALTH_URL || process.env.NEXT_PUBLIC_GRANT_COMMAND_URL),
    ]),
  ])

  const phones = phonesResult.data ?? []
  const leads = leadsResult.data ?? []
  const modules = modulesResult.data ?? []
  const clients = (clientsResult.data ?? []).map(client => {
    const clientLeads = leads.filter(lead => lead.client_id === client.id)
    const issues: string[] = []
    if (client.status !== 'active') issues.push(`account ${client.status}`)
    if (client.payment_status === 'unpaid') issues.push('payment overdue')
    if (!phones.some(phone => phone.client_id === client.id && phone.is_active)) issues.push('no active tracking number')
    if (clientLeads.some(lead => lead.sms_sent_status === 'failed')) issues.push('SMS failure in last 24h')
    return {
      ...client,
      enabledModules: modules.filter(module => module.client_id === client.id && module.enabled).map(module => module.module),
      leads24h: clientLeads.length,
      health: issues.length ? 'action_required' : 'healthy',
      issues,
    }
  })

  return NextResponse.json({ checkedAt: new Date().toISOString(), services, clients, schemaReady: !modulesResult.error })
}

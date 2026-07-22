'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Check = { system: string; status: string; response_ms: number | null; detail: string }
type ClientHealth = { id: string; business_name: string; health: string; enabledModules: string[]; leads24h: number; issues: string[] }

export default function OrchestratorPage() {
  const router = useRouter()
  const [data, setData] = useState<{ checkedAt: string; services: Check[]; clients: ClientHealth[]; schemaReady: boolean } | null>(null)
  const [error, setError] = useState('')

  async function refresh() {
    setError('')
    const response = await fetch('/api/admin/orchestrator', { cache: 'no-store' })
    if (response.status === 401) { router.replace('/crm'); return }
    if (!response.ok) { setError('Orchestrator could not complete its checks.'); return }
    setData(await response.json())
  }

  useEffect(() => { refresh() }, [])
  const color = (status: string) => status === 'healthy' ? '#00FF88' : status === 'degraded' ? '#FFD700' : '#FF6B6B'

  return <main className="min-h-screen px-5 py-10" style={{ background: '#050814', color: '#E2E8F0' }}><div className="max-w-6xl mx-auto">
    <div className="flex justify-between items-start gap-4 flex-wrap"><div><p className="text-xs font-bold uppercase tracking-[.16em]" style={{ color: '#00E5FF' }}>Trade Fortress Orchestrator</p><h1 className="text-3xl font-bold mt-2">All-client health</h1><p className="text-sm mt-2" style={{ color: '#94A3B8' }}>Account, payment, phone, SMS, module, and service health in one view.</p></div><div className="flex gap-3"><a href="/admin" className="px-4 py-2 rounded-xl border border-white/10">Admin</a><button onClick={refresh} className="px-4 py-2 rounded-xl font-bold" style={{ background: '#00E5FF', color: '#050814' }}>Run checks</button></div></div>
    {error && <p className="mt-6" style={{ color: '#FF6B6B' }}>{error}</p>}{!data && !error && <p className="mt-8" style={{ color: '#94A3B8' }}>Running checks…</p>}
    {data && <>{!data.schemaReady && <p className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(255,107,107,.08)', border: '1px solid rgba(255,107,107,.25)' }}>Apply the orchestrator migration before assigning modules.</p>}
      <section className="grid md:grid-cols-3 gap-4 mt-8">{data.services.map(service => <article key={service.system} className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)' }}><div className="flex justify-between gap-3"><h2 className="font-bold capitalize">{service.system.replaceAll('_', ' ')}</h2><span className="text-xs font-bold uppercase" style={{ color: color(service.status) }}>{service.status.replaceAll('_', ' ')}</span></div><p className="text-sm mt-3" style={{ color: '#94A3B8' }}>{service.detail}{service.response_ms !== null ? ` · ${service.response_ms}ms` : ''}</p></article>)}</section>
      <section className="mt-8 overflow-x-auto rounded-2xl border border-white/10"><table className="w-full text-sm"><thead style={{ background: 'rgba(255,255,255,.05)' }}><tr><th className="text-left p-4">Client</th><th className="text-left p-4">Health</th><th className="text-left p-4">Leads 24h</th><th className="text-left p-4">Modules</th><th className="text-left p-4">Attention</th></tr></thead><tbody>{data.clients.map(client => <tr key={client.id} className="border-t border-white/10"><td className="p-4 font-bold">{client.business_name}</td><td className="p-4 font-bold" style={{ color: color(client.health) }}>{client.health.replaceAll('_', ' ')}</td><td className="p-4">{client.leads24h}</td><td className="p-4">{client.enabledModules.join(', ') || 'core'}</td><td className="p-4" style={{ color: client.issues.length ? '#FFB4B4' : '#94A3B8' }}>{client.issues.join(', ') || 'None'}</td></tr>)}</tbody></table></section>
      <p className="text-xs mt-4" style={{ color: '#64748B' }}>Last checked {new Date(data.checkedAt).toLocaleString()}</p></>}
  </div></main>
}

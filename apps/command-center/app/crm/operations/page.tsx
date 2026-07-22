'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase'
import type { TradeKind as Kind, TradeRecord as RecordItem, TradeRecordsResponse } from '@/lib/trade-types'

const kinds: { key: Kind; label: string; icon: string }[] = [
  { key: 'job', label: 'Active Jobs', icon: '01' }, { key: 'customer', label: 'Customers', icon: '02' },
  { key: 'permit', label: 'Permits', icon: '03' }, { key: 'document', label: 'Paperwork', icon: '04' },
  { key: 'proposal', label: 'Proposals', icon: '05' }, { key: 'material', label: 'Materials', icon: '06' },
]

export default function OperationsPage() {
  const router = useRouter()
  const [records, setRecords] = useState<RecordItem[]>([])
  const [active, setActive] = useState<Kind>('job')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({ title: '', customer_id: '', job_id: '', phone: '', due_date: '', amount: '', quantity: '', unit: '', notes: '' })

  const load = useCallback(async () => {
    const { data: { session } } = await createClient().auth.getSession()
    if (!session) return router.push('/signon')
    const res = await fetch('/api/client/operations')
    const data = await res.json() as TradeRecordsResponse & { detail?: string }
    if (!res.ok) setError(data.detail ?? 'Could not load operations')
    else setRecords(data.records)
    setLoading(false)
  }, [router])
  useEffect(() => { load() }, [load])

  const current = records.filter((record) => record.kind === active)
  const stats = useMemo(() => ({
    jobs: records.filter((r) => r.kind === 'job' && r.status !== 'complete').length,
    due: records.filter((r) => ['permit', 'document'].includes(r.kind) && r.status !== 'complete').length,
    proposals: records.filter((r) => r.kind === 'proposal' && r.status !== 'approved').reduce((sum, r) => sum + Number(r.amount || 0), 0),
    materials: records.filter((r) => r.kind === 'material').reduce((sum, r) => sum + Number(r.amount || 0) * Number(r.quantity || 0), 0),
  }), [records])

  async function addRecord(event: FormEvent) {
    event.preventDefault(); setError(''); setNotice(''); setSaving(true)
    const res = await fetch('/api/client/operations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: active, ...form, amount: form.amount ? Number(form.amount) : undefined, quantity: form.quantity ? Number(form.quantity) : undefined }) })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) return setError(data.detail ?? 'Could not save record')
    setRecords((items) => [data.record, ...items]); setForm({ title: '', customer_id: '', job_id: '', phone: '', due_date: '', amount: '', quantity: '', unit: '', notes: '' }); setNotice(`${data.record.title} added to the board.`)
  }

  async function setStatus(record: RecordItem, status: string) {
    const res = await fetch('/api/client/operations', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: record.id, kind: record.kind, status }) })
    if (res.ok) setRecords((items) => items.map((item) => item.id === record.id ? { ...item, status } : item))
  }

  function proposalText(record: RecordItem) {
    return `PROPOSAL\n\nPrepared for: ${record.customer_name || 'Customer'}\nProject: ${record.job_name || record.title}\nScope: ${record.notes || 'Scope to be confirmed'}\n\nInvestment: $${Number(record.amount || 0).toLocaleString()}\n\nThis proposal includes labor, listed materials, jobsite cleanup, and completion of the scope above. Changes require written approval. Thank you for the opportunity to earn your business.`
  }

  if (loading) return <div className="min-h-screen grid place-items-center text-cyan-300">Loading job board…</div>
  const meta = kinds.find((kind) => kind.key === active)!
  return <div className="min-h-screen field-grid"><Navbar /><main id="main-content" tabIndex={-1} className="pt-20 md:pt-24 pb-28 px-3 md:px-6 max-w-[1480px] mx-auto">
    <header className="field-enter border-b border-white/10 pb-5 mb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4"><div><div className="flex items-center gap-3"><span className="h-[3px] w-10 bg-amber-300"/><p className="font-mono-ui text-[10px] font-bold tracking-[.22em] uppercase text-amber-300">LeadShield / Field Operations</p></div><h1 className="font-display text-5xl md:text-7xl uppercase font-black tracking-tight leading-[.88] text-slate-100 mt-3">Today&apos;s <span className="text-cyan-300">Job Board</span></h1><p className="text-slate-400 mt-3 max-w-2xl">Customers, work, permits, proposals, documents and supply costs—on one crew-ready board.</p></div><div className="md:text-right"><p className="font-mono-ui text-[9px] uppercase tracking-widest text-slate-600">Crew view</p><p className="font-display text-2xl uppercase text-slate-300">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p></div></header>
    <section className="field-enter grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4" style={{ animationDelay: '60ms' }}>
      <Stat label="Active jobs" value={stats.jobs} /><Stat label="Paperwork open" value={stats.due} /><Stat label="Proposals open" value={`$${stats.proposals.toLocaleString()}`} /><Stat label="Material value" value={`$${stats.materials.toLocaleString()}`} />
    </section>
    {(error || notice) && <div role={error ? 'alert' : 'status'} aria-live={error ? 'assertive' : 'polite'} className={`mb-4 border-l-4 p-3 text-sm font-semibold ${error ? 'border-red-400 bg-red-400/10 text-red-200' : 'border-emerald-400 bg-emerald-400/10 text-emerald-200'}`}>{error || notice}</div>}
    <div className="grid xl:grid-cols-[230px_minmax(0,1fr)_360px] gap-3 items-start">
      <nav className="field-enter ticket-edge border border-white/10 bg-[#0c111b]/95 p-2 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-1 gap-1" aria-label="Field office sections">{kinds.map((kind) => <button key={kind.key} onClick={() => { setActive(kind.key); setError(''); setNotice('') }} aria-pressed={active === kind.key} className={`min-h-14 text-left px-3 py-3 border font-display uppercase text-lg font-bold ${active === kind.key ? 'border-amber-300 bg-amber-300 text-slate-950' : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5'}`}><span className="font-mono-ui text-[10px] mr-3 opacity-50">{kind.icon}</span>{kind.label}<span className="float-right font-mono-ui text-[10px] opacity-60">{records.filter((r) => r.kind === kind.key).length}</span></button>)}</nav>
      <section className="field-enter ticket-edge border border-white/10 bg-[#0c111b]/85" style={{ animationDelay: '100ms' }}><div className="flex justify-between items-end p-4 md:p-5 border-b border-white/10 bg-white/[.025]"><div><p className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-cyan-300">Current register</p><h2 className="font-display text-3xl md:text-4xl uppercase font-black text-slate-100">{meta.label}</h2></div><span className="font-mono-ui text-xs text-slate-500">{String(current.length).padStart(2, '0')} total</span></div>
        <div className="p-2 md:p-3 space-y-2">{current.length === 0 && <div className="min-h-52 grid place-items-center border border-dashed border-white/10 text-center"><div><p className="font-display text-3xl uppercase font-bold text-slate-500">Clear board</p><p className="text-sm text-slate-600">Use the work ticket to add the first record.</p></div></div>}{current.map((record, index) => <article key={record.id} className={`grid md:grid-cols-[48px_1fr_auto] border border-white/10 bg-black/20 hover:border-cyan-300/25 ${record.status === 'complete' ? 'opacity-55' : ''}`}><div className="hidden md:grid place-items-center border-r border-white/10 font-mono-ui text-xs text-slate-600">{String(index + 1).padStart(2, '0')}</div><div className="p-4 min-w-0"><h3 className={`font-display text-2xl uppercase font-bold leading-none ${record.status === 'complete' ? 'line-through text-slate-500' : 'text-slate-100'}`}>{record.title}</h3><p className="text-slate-500 text-xs mt-2">{[record.customer_name, record.job_name, record.phone].filter(Boolean).join(' / ') || 'No linked customer or job'}</p>{record.notes && <p className="text-slate-300 text-sm mt-3 whitespace-pre-wrap line-clamp-2">{record.notes}</p>}<div className="flex gap-4 flex-wrap mt-3 font-mono-ui text-[10px] uppercase text-slate-500">{record.due_date && <span>Due {new Date(`${record.due_date}T00:00:00`).toLocaleDateString()}</span>}{record.amount != null && <span>${Number(record.amount).toLocaleString()}</span>}{record.quantity != null && <span>{record.quantity} {record.unit}</span>}{record.kind === 'proposal' && <button onClick={() => navigator.clipboard.writeText(proposalText(record))} className="text-cyan-300 font-bold uppercase">Copy proposal</button>}</div></div>{record.kind !== 'customer' && <button onClick={() => setStatus(record, record.status === 'complete' ? 'open' : 'complete')} className={`m-3 min-h-11 md:w-24 border font-display uppercase text-base font-bold ${record.status === 'complete' ? 'border-emerald-400 bg-emerald-400 text-slate-950' : 'border-white/15 text-slate-300 hover:border-emerald-300'}`}>{record.status === 'complete' ? 'Done' : 'Mark done'}</button>}</article>)}</div>
      </section>
      <form onSubmit={addRecord} className="field-enter ticket-edge xl:sticky xl:top-20 border border-amber-300/35 bg-[#12130f]" style={{ animationDelay: '150ms' }}><div className="bg-amber-300 text-slate-950 p-4"><p className="font-mono-ui text-[9px] font-bold tracking-[.18em] uppercase">New work ticket</p><h2 className="font-display text-3xl uppercase font-black leading-none mt-1">Add {active}</h2></div><div className="p-4">
        <Field label={active === 'customer' ? 'Customer name' : 'Title'} required value={form.title} onChange={(title) => setForm({ ...form, title })} />
        {active !== 'customer' && <Select label="Customer" value={form.customer_id} onChange={(customer_id) => setForm({ ...form, customer_id })} options={records.filter((r) => r.kind === 'customer').map((r) => ({ value: r.id, label: r.title }))} />}
        {!['customer', 'job'].includes(active) && <Select label="Job" value={form.job_id} onChange={(job_id) => setForm({ ...form, job_id })} options={records.filter((r) => r.kind === 'job').map((r) => ({ value: r.id, label: r.title }))} />}
        {active === 'customer' && <Field label="Phone" type="tel" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />}
        {['permit', 'document', 'proposal', 'job'].includes(active) && <Field label="Due date" type="date" value={form.due_date} onChange={(due_date) => setForm({ ...form, due_date })} />}
        {['proposal', 'material'].includes(active) && <Field label={active === 'proposal' ? 'Proposal total' : 'Unit cost'} type="number" value={form.amount} onChange={(amount) => setForm({ ...form, amount })} />}
        {active === 'material' && <div className="grid grid-cols-2 gap-2"><Field label="Quantity" type="number" value={form.quantity} onChange={(quantity) => setForm({ ...form, quantity })} /><Field label="Unit" value={form.unit} onChange={(unit) => setForm({ ...form, unit })} /></div>}
        <label className="block font-mono-ui text-[9px] font-semibold uppercase tracking-[.14em] text-slate-500 mb-4">Scope / notes<textarea className="field-input min-h-24 resize-y" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="What needs to happen?" /></label>
        <button disabled={saving} className="w-full min-h-12 bg-amber-300 text-slate-950 font-display text-xl uppercase font-black hover:bg-amber-200 disabled:opacity-50">{saving ? 'Saving ticket…' : `Add ${active}`}</button>
      </div></form>
    </div>
  </main></div>
}

function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) { return <label className="block font-mono-ui text-[9px] font-semibold uppercase tracking-[.14em] text-slate-500 mb-4">{label}<input required={required} type={type} min={type === 'number' ? 0 : undefined} step={type === 'number' ? 'any' : undefined} value={value} onChange={(e) => onChange(e.target.value)} className="field-input" /></label> }
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) { return <label className="block font-mono-ui text-[9px] font-semibold uppercase tracking-[.14em] text-slate-500 mb-4">{label}<select value={value} onChange={(e) => onChange(e.target.value)} className="field-input bg-[#090d15]"><option value="">Not linked</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label> }
function Stat({ label, value }: { label: string; value: string | number }) { return <div className="ticket-edge border border-white/10 bg-[#0c111b]/85 p-3 md:p-4"><p className="font-mono-ui text-[9px] font-bold uppercase tracking-[.14em] text-slate-500">{label}</p><strong className="font-display text-3xl md:text-4xl uppercase font-black text-cyan-300 leading-none mt-2 block">{value}</strong></div> }

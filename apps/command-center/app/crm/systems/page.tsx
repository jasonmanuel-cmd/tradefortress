import Navbar from '@/components/Navbar'
import { systems } from '@/lib/systems'

export default function SystemsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#050814', color: '#E2E8F0' }}>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="pt-22 pb-24 px-4 max-w-6xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-[.18em]" style={{ color: '#00E5FF' }}>Trade Fortress</p>
        <h1 className="text-3xl font-bold mt-2">Connected systems</h1>
        <p className="mt-2 max-w-2xl" style={{ color: '#94A3B8' }}>Your calls, jobs, and paperwork stay in the command center. Open a specialist system only when that workflow is needed.</p>

        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {systems.map(system => (
            <article key={system.name} className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)' }}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold">{system.name}</h2>
                <span className="text-[10px] font-bold uppercase rounded-full px-2 py-1" style={{ color: system.href ? '#00FF88' : '#94A3B8', background: system.href ? 'rgba(0,255,136,.1)' : 'rgba(148,163,184,.1)' }}>{system.href ? 'Connected' : 'Setup needed'}</span>
              </div>
              <p className="text-sm mt-3 min-h-20" style={{ color: '#94A3B8' }}>{system.description}</p>
              {system.href ? <a href={system.href} target="_blank" rel="noreferrer" className="inline-block mt-5 rounded-xl px-4 py-2 text-sm font-bold" style={{ background: system.color, color: '#050814' }}>Open {system.name} →</a> : <p className="mt-5 text-xs font-mono" style={{ color: '#64748B' }}>Set {system.env}</p>}
            </article>
          ))}
        </div>

        <section className="rounded-2xl p-6 mt-5" style={{ background: 'rgba(0,229,255,.04)', border: '1px solid rgba(0,229,255,.18)' }}>
          <h2 className="font-bold">Master record</h2>
          <p className="text-sm mt-2" style={{ color: '#94A3B8' }}>Customers, jobs, permits, proposals, materials, credentials, and missed calls belong here. The specialist systems handle discovery or document production and should send approved results back to the customer/job record.</p>
        </section>
      </main>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { Zap, CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react'
import { COAI_SEARCH_TERMS } from '@/lib/grants-gov'

const FREE_SOURCES = [
  { name: 'Grants.gov',            url: 'https://www.grants.gov/search-grants',          type: 'Federal — All agencies', note: 'Auto-synced via API' },
  { name: 'SBIR.gov',              url: 'https://www.sbir.gov/solicitations',             type: 'Federal — R&D / Tech', note: 'Search: AI, software, automation' },
  { name: 'SAM.gov',               url: 'https://sam.gov/content/opportunities',          type: 'Federal — Contracts + Grants', note: 'Register your business here too' },
  { name: 'CA Grants Portal',      url: 'https://www.grants.ca.gov/',                     type: 'State — California', note: 'Filter: small business, tech' },
  { name: 'Kern EDC',              url: 'https://kernedcorp.com',                         type: 'Local — Kern County', note: 'Call directly — limited online listings' },
  { name: 'USDA Rural Dev',        url: 'https://www.rd.usda.gov/programs-services/all-programs/business-programs', type: 'Federal — Rural/Agricultural', note: 'Central Valley eligibility likely' },
  { name: 'NSF SBIR',              url: 'https://seedfund.nsf.gov/',                      type: 'Federal — Science/Tech', note: 'Phase I: $275K for R&D' },
  { name: 'EDA (Commerce Dept)',   url: 'https://eda.gov/grants',                         type: 'Federal — Economic Dev', note: 'Tech hubs, local economy' },
  { name: 'Wells Fargo Open For Business', url: 'https://openforsmallbusiness.com',       type: 'Corporate Foundation', note: 'Periodic cycles — watch calendar' },
]

export default function SyncPage() {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const runSync = async () => {
    setSyncing(true)
    setResult(null)
    setError('')
    try {
      const res = await fetch('/api/sync', { method: 'POST' })
      const data = await res.json()
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="p-6 md:p-8 pt-20 md:pt-8 max-w-4xl">
      <div className="mb-6">
        <div className="text-xs font-mono text-sovereign-400 mb-1">GRANT INTELLIGENCE — AUTO-SYNC</div>
        <h1 className="text-2xl font-bold text-white">Sync Grants</h1>
        <p className="text-slate-400 text-sm mt-1">Pull live opportunities from Grants.gov matching COAI's profile.</p>
      </div>

      {/* Sync Button */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">Grants.gov Auto-Sync</h2>
            <p className="text-xs text-slate-400">Searches {COAI_SEARCH_TERMS.slice(0,4).length} COAI-matched keyword sets across all federal agencies.</p>
          </div>
          <button
            onClick={runSync}
            disabled={syncing}
            className="flex items-center gap-2 px-5 py-2.5 bg-sovereign-500 hover:bg-sovereign-400 text-black font-bold text-sm rounded-md transition-colors disabled:opacity-40"
          >
            {syncing
              ? <><Loader2 size={14} className="animate-spin" /> Syncing...</>
              : <><Zap size={14} /> Run Sync</>
            }
          </button>
        </div>

        {/* Search terms preview */}
        <div className="space-y-1">
          <div className="text-[10px] font-mono text-slate-500 mb-2">SEARCH VECTORS:</div>
          {COAI_SEARCH_TERMS.map((term, i) => (
            <div key={i} className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <span className="text-sovereign-500 shrink-0">{String(i+1).padStart(2,'0')}</span>
              {term}
            </div>
          ))}
        </div>

        {/* Result */}
        {result && (
          <div className={`mt-4 p-4 rounded border ${result.success ? 'border-sovereign-500/30 bg-sovereign-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
            {result.success
              ? <div className="flex items-center gap-2 text-sm text-sovereign-400 font-semibold">
                  <CheckCircle2 size={16} />
                  Sync complete — {result.inserted} new grants added, {result.skipped} duplicates skipped
                </div>
              : <div className="flex items-center gap-2 text-sm text-red-400">
                  <AlertCircle size={16} />
                  Sync failed: {result.error}
                </div>
            }
            {result.errors?.length > 0 && (
              <div className="mt-2 text-xs text-slate-500">{result.errors.slice(0,3).join(' · ')}</div>
            )}
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 border border-red-500/30 bg-red-500/5 rounded text-xs text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Manual Sources */}
      <div className="card p-5">
        <div className="text-xs font-mono text-slate-400 mb-4">FREE GRANT SOURCES — MANUAL REVIEW</div>
        <div className="space-y-3">
          {FREE_SOURCES.map(source => (
            <div key={source.name} className="flex items-start gap-3 py-2 border-b border-[#1e1e35] last:border-0">
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{source.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{source.type}</div>
                <div className="text-xs text-sovereign-400/70 mt-0.5">{source.note}</div>
              </div>
              <a href={source.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 border border-[#1e1e35] rounded hover:border-sovereign-500/40 shrink-0">
                Open <ExternalLink size={10} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase-browser'
import { PIPELINE_STAGES } from '@/lib/coai-profile'
import Link from 'next/link'
import {
  ArrowLeft, ExternalLink, Calendar, DollarSign, MapPin, Building2,
  FileText, Kanban, Loader2, CheckCircle2, Trash2, Wand2
} from 'lucide-react'

export default function GrantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createBrowserSupabase()

  const [grant, setGrant] = useState<any>(null)
  const [application, setApplication] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  useEffect(() => {
    const load = async () => {
      const [grantRes, appRes, docsRes] = await Promise.all([
        supabase.from('grants').select('*').eq('id', id).single(),
        supabase.from('applications').select('*').eq('grant_id', id).maybeSingle(),
        supabase.from('documents').select('*').eq('grant_id', id).order('created_at', { ascending: false }),
      ])
      setGrant(grantRes.data)
      setApplication(appRes.data)
      setNotes(appRes.data?.notes || '')
      setDocuments(docsRes.data || [])
      setLoading(false)
    }
    load()
  }, [id])

  const startApplication = async () => {
    setCreating(true)
    const { data, error } = await supabase.from('applications').insert({
      grant_id: id,
      stage: 1,
      stage_name: 'Interest',
      requested_amount: grant?.amount_max || null,
      result: 'pending',
    }).select().single()
    if (!error && data) setApplication(data)
    setCreating(false)
  }

  const moveStage = async (newStage: number) => {
    if (!application) return
    const stageName = PIPELINE_STAGES[newStage]?.name || ''
    const { error } = await supabase.from('applications')
      .update({ stage: newStage, stage_name: stageName })
      .eq('id', application.id)
    if (!error) setApplication({ ...application, stage: newStage, stage_name: stageName })
  }

  const saveNotes = async () => {
    if (!application) return
    setSavingNotes(true)
    await supabase.from('applications').update({ notes }).eq('id', application.id)
    setSavingNotes(false)
  }

  const removeApplication = async () => {
    if (!application) return
    if (!confirm('Remove this application from the pipeline? Documents stay saved.')) return
    await supabase.from('applications').delete().eq('id', application.id)
    setApplication(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96 pt-20 md:pt-0">
      <Loader2 size={20} className="animate-spin text-sovereign-400" />
    </div>
  )

  if (!grant) return (
    <div className="p-8 pt-20 md:pt-8">
      <p className="text-slate-400 text-sm">Grant not found.</p>
      <Link href="/search" className="text-sovereign-400 text-sm mt-2 inline-block">← Back to search</Link>
    </div>
  )

  const daysLeft = grant.deadline
    ? Math.ceil((new Date(grant.deadline).getTime() - Date.now()) / 86400000)
    : null
  const currentStage = application ? PIPELINE_STAGES[application.stage] : null

  return (
    <div className="p-6 md:p-8 pt-20 md:pt-8 max-w-5xl">
      <Link href="/search" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-white mb-5 transition-colors">
        <ArrowLeft size={12} /> Back to grants
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#1e1e35] text-slate-400">{grant.grant_type}</span>
          {grant.category && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sovereign-500/10 text-sovereign-400 border border-sovereign-500/20">{grant.category}</span>
          )}
          {grant.cfda_number && (
            <span className="text-[10px] font-mono text-slate-600">CFDA {grant.cfda_number}</span>
          )}
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">{grant.title}</h1>
        <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
          <Building2 size={14} /> {grant.funder}
        </div>
      </div>

      {/* Key Facts */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 mb-2">
            <DollarSign size={11} /> AWARD
          </div>
          <div className="text-sm font-mono font-bold text-sovereign-400">
            {grant.amount_max
              ? `${grant.amount_min ? `$${(grant.amount_min/1000).toFixed(0)}K – ` : 'up to '}$${grant.amount_max >= 1000000 ? `${(grant.amount_max/1000000).toFixed(1)}M` : `${(grant.amount_max/1000).toFixed(0)}K`}`
              : 'Unspecified'}
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 mb-2">
            <Calendar size={11} /> DEADLINE
          </div>
          <div className={`text-sm font-mono font-bold ${daysLeft !== null && daysLeft <= 14 ? 'text-red-400' : 'text-yellow-400'}`}>
            {grant.deadline
              ? `${new Date(grant.deadline).toLocaleDateString()} ${daysLeft !== null ? `(${daysLeft > 0 ? `${daysLeft}d` : 'EXPIRED'})` : ''}`
              : 'Rolling'}
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 mb-2">
            <MapPin size={11} /> LOCATION
          </div>
          <div className="text-sm font-mono font-bold text-slate-300">{grant.location || '—'}</div>
        </div>
      </div>

      {/* Application Status / Start Button */}
      <div className="card p-5 mb-6 border-sovereign-500/20">
        {!application ? (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Not in pipeline yet</h3>
              <p className="text-xs text-slate-400">Start tracking this grant through the 12-stage lifecycle.</p>
            </div>
            <button
              onClick={startApplication}
              disabled={creating}
              className="flex items-center gap-2 px-5 py-2.5 bg-sovereign-500 hover:bg-sovereign-400 text-black font-bold text-sm rounded-md transition-colors disabled:opacity-40"
            >
              {creating
                ? <><Loader2 size={14} className="animate-spin" /> Creating...</>
                : <><Kanban size={14} /> Start Application</>}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-sovereign-400" />
                <span className="text-sm font-semibold text-white">In Pipeline</span>
                <span className="stage-badge text-black" style={{ background: currentStage?.color }}>
                  {String(application.stage).padStart(2,'0')} — {currentStage?.name}
                </span>
              </div>
              <button onClick={removeApplication} className="flex items-center gap-1 text-xs text-slate-600 hover:text-red-400 transition-colors">
                <Trash2 size={12} /> Remove
              </button>
            </div>

            {/* Stage controls */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {Object.entries(PIPELINE_STAGES).map(([num, { name, color }]) => {
                const n = parseInt(num)
                const active = application.stage === n
                return (
                  <button
                    key={num}
                    onClick={() => moveStage(n)}
                    className={`text-[10px] font-mono px-2 py-1 rounded border transition-all ${
                      active
                        ? 'text-black font-bold border-transparent'
                        : 'text-slate-500 border-[#1e1e35] hover:text-slate-300 hover:border-[#2a2a45]'
                    }`}
                    style={active ? { background: color } : {}}
                  >
                    {n} {name}
                  </button>
                )
              })}
            </div>

            {/* Notes */}
            <div>
              <label className="text-[10px] font-mono text-slate-500 block mb-2">NOTES</label>
              <textarea
                className="w-full bg-[#141420] border border-[#1e1e35] rounded-md px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sovereign-500 resize-none"
                rows={3}
                placeholder="Contact names, requirements, strategy notes..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                onBlur={saveNotes}
              />
              {savingNotes && <span className="text-[10px] text-slate-500 font-mono">Saving...</span>}
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {grant.description && (
        <div className="card p-5 mb-6">
          <div className="text-[10px] font-mono text-slate-500 mb-3">DESCRIPTION</div>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{grant.description}</p>
        </div>
      )}

      {/* Eligibility */}
      {grant.eligibility && (
        <div className="card p-5 mb-6">
          <div className="text-[10px] font-mono text-slate-500 mb-3">ELIGIBILITY</div>
          <p className="text-sm text-slate-300 leading-relaxed">{grant.eligibility}</p>
        </div>
      )}

      {/* Generated Documents */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] font-mono text-slate-500">GENERATED DOCUMENTS ({documents.length})</div>
          <Link href={`/ai-writer?grant=${grant.id}`}
            className="flex items-center gap-1.5 text-xs bg-sovereign-500/10 text-sovereign-400 border border-sovereign-500/20 px-3 py-1.5 rounded hover:bg-sovereign-500/20 transition-colors">
            <Wand2 size={12} /> Generate New
          </Link>
        </div>
        {documents.length === 0 ? (
          <p className="text-xs text-slate-600">No documents generated for this grant yet.</p>
        ) : (
          <div className="space-y-2">
            {documents.map(doc => (
              <Link key={doc.id} href={`/documents/${doc.id}`}
                className="flex items-center gap-3 hover:bg-[#141420] -mx-2 px-2 py-2 rounded transition-colors group">
                <FileText size={14} className="text-sovereign-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-200 group-hover:text-white truncate">{doc.title}</div>
                  <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                    {doc.doc_type} · v{doc.version} · {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Source link */}
      {grant.source_url && (
        <a href={grant.source_url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          View original listing <ExternalLink size={13} />
        </a>
      )}
    </div>
  )
}

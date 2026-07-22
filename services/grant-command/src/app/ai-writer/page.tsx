'use client'
import { useState, useEffect } from 'react'
import { supabase, Grant } from '@/lib/supabase'
import { FileText, Wand2, Copy, CheckCheck, ChevronDown, Loader2, Save } from 'lucide-react'

const DOC_TYPES = [
  { value: 'executive_summary',  label: 'Executive Summary',    desc: '300-400 words — pitch opener' },
  { value: 'need_statement',     label: 'Need Statement',        desc: '400-500 words — problem framing' },
  { value: 'project_description',label: 'Project Description',  desc: '600-800 words — what you will do' },
  { value: 'budget_narrative',   label: 'Budget Narrative',      desc: 'Line-item funding justification' },
  { value: 'loi',                label: 'Letter of Intent',      desc: '1-2 pages — pre-application intro' },
  { value: 'full_proposal',      label: 'Full Proposal',         desc: 'Complete submission-ready document' },
]

export default function AIWriterPage() {
  const [grants, setGrants] = useState<Grant[]>([])
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null)
  const [docType, setDocType] = useState('executive_summary')
  const [customInstructions, setCustomInstructions] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('grants').select('*').eq('status','active').order('created_at', { ascending: false })
      .then(({ data }) => setGrants(data || []))
  }, [])

  const generate = async () => {
    if (!selectedGrant) { setError('Select a grant first.'); return }
    setLoading(true)
    setOutput('')
    setError('')
    setSaved(false)

    try {
      const res = await fetch('/api/ai-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grantId: selectedGrant.id,
          docType,
          customInstructions,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setOutput(data.content)
      if (data.saved) setSaved(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const selectedDocType = DOC_TYPES.find(d => d.value === docType)

  return (
    <div className="p-6 md:p-8 pt-20 md:pt-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs font-mono text-sovereign-400 mb-1">AI SYSTEMS — CLAUDE SONNET 4.6</div>
        <h1 className="text-2xl font-bold text-white">Grant Writer</h1>
        <p className="text-slate-400 text-sm mt-1">
          COAI profile pre-loaded. Select a grant, pick a document type, generate.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* LEFT — Controls */}
        <div className="space-y-4">
          {/* Grant Selector */}
          <div className="card p-4">
            <label className="text-xs font-mono text-slate-400 block mb-3">
              01 — SELECT GRANT
            </label>
            <div className="relative">
              <select
                className="w-full bg-[#141420] border border-[#1e1e35] rounded-md px-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-sovereign-500"
                value={selectedGrant?.id || ''}
                onChange={e => {
                  const g = grants.find(g => g.id === e.target.value)
                  setSelectedGrant(g || null)
                  setOutput('')
                }}
              >
                <option value="">— Select a grant —</option>
                {grants.map(g => (
                  <option key={g.id} value={g.id}>{g.title} ({g.funder})</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3 text-slate-500 pointer-events-none" />
            </div>

            {selectedGrant && (
              <div className="mt-3 p-3 bg-[#0a0a0f] rounded border border-[#1e1e35] space-y-1">
                <div className="text-xs text-slate-300">{selectedGrant.funder}</div>
                <div className="text-xs text-slate-500">{selectedGrant.grant_type} · {selectedGrant.location}</div>
                {selectedGrant.amount_max && (
                  <div className="text-xs font-mono text-sovereign-400">
                    Up to ${selectedGrant.amount_max.toLocaleString()}
                  </div>
                )}
                {selectedGrant.deadline && (
                  <div className="text-xs text-yellow-400">
                    Deadline: {new Date(selectedGrant.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Document Type */}
          <div className="card p-4">
            <label className="text-xs font-mono text-slate-400 block mb-3">
              02 — DOCUMENT TYPE
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DOC_TYPES.map(dt => (
                <button
                  key={dt.value}
                  onClick={() => setDocType(dt.value)}
                  className={`text-left p-2.5 rounded border text-xs transition-all ${
                    docType === dt.value
                      ? 'border-sovereign-500/50 bg-sovereign-500/10 text-sovereign-300'
                      : 'border-[#1e1e35] text-slate-400 hover:border-[#2a2a45] hover:text-slate-300'
                  }`}
                >
                  <div className="font-medium mb-0.5">{dt.label}</div>
                  <div className="text-[10px] opacity-70">{dt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Instructions */}
          <div className="card p-4">
            <label className="text-xs font-mono text-slate-400 block mb-3">
              03 — CUSTOM INSTRUCTIONS (OPTIONAL)
            </label>
            <textarea
              className="w-full bg-[#141420] border border-[#1e1e35] rounded-md px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sovereign-500 resize-none"
              rows={4}
              placeholder="e.g., Emphasize our Oildale/661 market focus. Mention the T&M Hauling deployment as a case study. Keep it under 350 words."
              value={customInstructions}
              onChange={e => setCustomInstructions(e.target.value)}
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={generate}
            disabled={!selectedGrant || loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-md bg-sovereign-500 hover:bg-sovereign-400 text-black font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Generating with Claude...</>
              : <><Wand2 size={16} /> Generate {selectedDocType?.label}</>
            }
          </button>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* RIGHT — Output */}
        <div className="card p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-sovereign-400" />
              <span className="text-xs font-mono text-slate-400">OUTPUT</span>
              {saved && (
                <span className="text-[10px] font-mono text-sovereign-400 bg-sovereign-500/10 px-2 py-0.5 rounded">
                  ✓ SAVED TO DB
                </span>
              )}
            </div>
            {output && (
              <button
                onClick={copyOutput}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                {copied ? <CheckCheck size={12} className="text-sovereign-400" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>

          <div className="flex-1 bg-[#0a0a0f] rounded border border-[#1e1e35] p-4 overflow-auto min-h-96">
            {loading && (
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Loader2 size={14} className="animate-spin text-sovereign-400" />
                Claude is writing your {selectedDocType?.label}...
              </div>
            )}
            {!loading && !output && (
              <div className="text-slate-600 text-sm">
                <div className="font-mono text-xs mb-2 text-slate-500">READY</div>
                <p>Select a grant and document type, then hit Generate.</p>
                <p className="mt-2 text-xs">COAI profile is pre-loaded into every generation — no re-explaining your business required.</p>
              </div>
            )}
            {output && (
              <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                {output}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

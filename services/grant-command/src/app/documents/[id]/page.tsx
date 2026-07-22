'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase-browser'
import Link from 'next/link'
import { ArrowLeft, Copy, CheckCheck, Download, Save, Loader2, Pencil } from 'lucide-react'

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createBrowserSupabase()

  const [doc, setDoc] = useState<any>(null)
  const [content, setContent] = useState('')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    supabase.from('documents').select('*, grants(title, funder)').eq('id', id).single()
      .then(({ data }) => {
        setDoc(data)
        setContent(data?.content || '')
        setLoading(false)
      })
  }, [id])

  const save = async () => {
    setSaving(true)
    await supabase.from('documents')
      .update({ content, version: (doc?.version || 1) + 1 })
      .eq('id', id)
    setDoc({ ...doc, content, version: (doc?.version || 1) + 1 })
    setSaving(false)
    setEditing(false)
  }

  const copyContent = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadTxt = () => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(doc?.title || 'document').replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96 pt-20 md:pt-0">
      <Loader2 size={20} className="animate-spin text-sovereign-400" />
    </div>
  )

  if (!doc) return (
    <div className="p-8 pt-20 md:pt-8">
      <p className="text-slate-400 text-sm">Document not found.</p>
      <Link href="/documents" className="text-sovereign-400 text-sm mt-2 inline-block">← Back to documents</Link>
    </div>
  )

  return (
    <div className="p-6 md:p-8 pt-20 md:pt-8 max-w-4xl">
      <Link href="/documents" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-white mb-5 transition-colors">
        <ArrowLeft size={12} /> All documents
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-white leading-tight">{doc.title}</h1>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            {doc.doc_type} · v{doc.version} · {doc.grants?.title || 'No grant linked'}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={copyContent}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-2 border border-[#1e1e35] rounded transition-colors">
            {copied ? <CheckCheck size={12} className="text-sovereign-400" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={downloadTxt}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-2 border border-[#1e1e35] rounded transition-colors">
            <Download size={12} /> Export
          </button>
          {editing ? (
            <button onClick={save} disabled={saving}
              className="flex items-center gap-1.5 text-xs bg-sovereign-500 text-black font-semibold px-3 py-2 rounded transition-colors disabled:opacity-40">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Save v{(doc.version || 1) + 1}
            </button>
          ) : (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-xs bg-sovereign-500/10 text-sovereign-400 border border-sovereign-500/20 px-3 py-2 rounded hover:bg-sovereign-500/20 transition-colors">
              <Pencil size={12} /> Edit
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <textarea
          className="w-full bg-[#0f0f1a] border border-sovereign-500/30 rounded-md p-5 text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-sovereign-500 font-sans resize-y"
          rows={30}
          value={content}
          onChange={e => setContent(e.target.value)}
        />
      ) : (
        <div className="card p-6">
          <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{content}</div>
        </div>
      )}
    </div>
  )
}

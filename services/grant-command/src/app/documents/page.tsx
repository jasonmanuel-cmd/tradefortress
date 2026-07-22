'use client'
import { useState, useEffect } from 'react'
import { createBrowserSupabase } from '@/lib/supabase-browser'
import Link from 'next/link'
import { FileText, Search, Loader2, Trash2 } from 'lucide-react'

export default function DocumentsPage() {
  const supabase = createBrowserSupabase()
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    supabase.from('documents')
      .select('*, grants(title, funder)')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setDocs(data || []); setLoading(false) })
  }, [])

  const deleteDoc = async (id: string) => {
    if (!confirm('Delete this document permanently?')) return
    await supabase.from('documents').delete().eq('id', id)
    setDocs(prev => prev.filter(d => d.id !== id))
  }

  const filtered = query
    ? docs.filter(d =>
        (d.title || '').toLowerCase().includes(query.toLowerCase()) ||
        (d.grants?.title || '').toLowerCase().includes(query.toLowerCase()) ||
        d.doc_type.includes(query.toLowerCase()))
    : docs

  return (
    <div className="p-6 md:p-8 pt-20 md:pt-8 max-w-5xl">
      <div className="mb-6">
        <div className="text-xs font-mono text-sovereign-400 mb-1">DOCUMENT VAULT</div>
        <h1 className="text-2xl font-bold text-white">Documents</h1>
        <p className="text-slate-400 text-sm mt-1">{docs.length} AI-generated documents saved in your database.</p>
      </div>

      <div className="relative mb-5 max-w-md">
        <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
        <input
          className="w-full pl-8 pr-3 py-2 bg-[#0f0f1a] border border-[#1e1e35] rounded-md text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sovereign-500"
          placeholder="Search documents..."
          value={query} onChange={e => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={20} className="animate-spin text-sovereign-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-400 text-sm">No documents yet.</p>
          <Link href="/ai-writer" className="text-sovereign-400 text-sm mt-2 inline-block">
            Generate your first proposal →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(doc => (
            <div key={doc.id} className="card p-4 flex items-center gap-4 hover:border-sovereign-500/30 transition-colors group">
              <FileText size={16} className="text-sovereign-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <Link href={`/documents/${doc.id}`}
                  className="text-sm font-medium text-white group-hover:text-sovereign-300 truncate block">
                  {doc.title || 'Untitled'}
                </Link>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {doc.grants?.title || 'No grant linked'} · {doc.doc_type} · {new Date(doc.created_at).toLocaleDateString()}
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-600 shrink-0">
                {((doc.content || '').split(/\s+/).length).toLocaleString()} words
              </span>
              <button onClick={() => deleteDoc(doc.id)}
                className="p-1.5 text-slate-700 hover:text-red-400 transition-colors shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

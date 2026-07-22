'use client'
import { useState, useEffect } from 'react'
import { supabase, Grant } from '@/lib/supabase'
import { GRANT_CATEGORIES, GRANT_TYPES } from '@/lib/coai-profile'
import Link from 'next/link'
import { Search, Plus, ExternalLink, Filter, Calendar, DollarSign, X, Loader2 } from 'lucide-react'

export default function SearchPage() {
  const [grants, setGrants] = useState<Grant[]>([])
  const [filtered, setFiltered] = useState<Grant[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)

  // New grant form state
  const [newGrant, setNewGrant] = useState({
    title: '', funder: '', amount_max: '', deadline: '',
    category: 'small_business', grant_type: 'federal',
    location: 'National', description: '', source_url: ''
  })

  useEffect(() => {
    supabase.from('grants').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setGrants(data || []); setFiltered(data || []); setLoading(false) })
  }, [])

  useEffect(() => {
    let list = [...grants]
    if (query) {
      const q = query.toLowerCase()
      list = list.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.funder.toLowerCase().includes(q) ||
        (g.description || '').toLowerCase().includes(q)
      )
    }
    if (catFilter) list = list.filter(g => g.category === catFilter)
    if (typeFilter) list = list.filter(g => g.grant_type === typeFilter)
    setFiltered(list)
  }, [query, catFilter, typeFilter, grants])

  const addGrant = async () => {
    setSaving(true)
    const { data, error } = await supabase.from('grants').insert({
      ...newGrant,
      amount_max: newGrant.amount_max ? parseFloat(newGrant.amount_max) : null,
      status: 'active',
    }).select().single()

    if (!error && data) {
      setGrants(prev => [data, ...prev])
      setShowAdd(false)
      setNewGrant({ title: '', funder: '', amount_max: '', deadline: '', category: 'small_business', grant_type: 'federal', location: 'National', description: '', source_url: '' })
    }
    setSaving(false)
  }

  return (
    <div className="p-6 md:p-8 pt-20 md:pt-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-xs font-mono text-sovereign-400 mb-1">GRANT INVENTORY</div>
          <h1 className="text-2xl font-bold text-white">Find Grants</h1>
          <p className="text-slate-400 text-sm mt-1">{filtered.length} grants in your sovereign database</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-sovereign-500 hover:bg-sovereign-400 text-black font-semibold text-sm rounded-md transition-colors"
        >
          <Plus size={14} /> Add Grant
        </button>
      </div>

      {/* Add Grant Form */}
      {showAdd && (
        <div className="card p-5 mb-6 border-sovereign-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Add Grant Manually</h3>
            <button onClick={() => setShowAdd(false)}><X size={16} className="text-slate-500 hover:text-white" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <input className="col-span-2 bg-[#141420] border border-[#1e1e35] rounded px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sovereign-500"
              placeholder="Grant title *" value={newGrant.title}
              onChange={e => setNewGrant(p => ({...p, title: e.target.value}))} />
            <input className="bg-[#141420] border border-[#1e1e35] rounded px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sovereign-500"
              placeholder="Funder name *" value={newGrant.funder}
              onChange={e => setNewGrant(p => ({...p, funder: e.target.value}))} />
            <input className="bg-[#141420] border border-[#1e1e35] rounded px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sovereign-500"
              placeholder="Max award amount (e.g. 50000)" type="number" value={newGrant.amount_max}
              onChange={e => setNewGrant(p => ({...p, amount_max: e.target.value}))} />
            <input className="bg-[#141420] border border-[#1e1e35] rounded px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sovereign-500"
              type="date" value={newGrant.deadline}
              onChange={e => setNewGrant(p => ({...p, deadline: e.target.value}))} />
            <input className="bg-[#141420] border border-[#1e1e35] rounded px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sovereign-500"
              placeholder="Location (e.g. CA, National)" value={newGrant.location}
              onChange={e => setNewGrant(p => ({...p, location: e.target.value}))} />
            <select className="bg-[#141420] border border-[#1e1e35] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-sovereign-500"
              value={newGrant.category} onChange={e => setNewGrant(p => ({...p, category: e.target.value}))}>
              {GRANT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="bg-[#141420] border border-[#1e1e35] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-sovereign-500"
              value={newGrant.grant_type} onChange={e => setNewGrant(p => ({...p, grant_type: e.target.value}))}>
              {GRANT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input className="col-span-2 bg-[#141420] border border-[#1e1e35] rounded px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sovereign-500"
              placeholder="Source URL (grants.gov link, funder website, etc.)" value={newGrant.source_url}
              onChange={e => setNewGrant(p => ({...p, source_url: e.target.value}))} />
            <textarea className="col-span-2 bg-[#141420] border border-[#1e1e35] rounded px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sovereign-500 resize-none"
              rows={3} placeholder="Grant description / what it funds"
              value={newGrant.description} onChange={e => setNewGrant(p => ({...p, description: e.target.value}))} />
          </div>
          <button onClick={addGrant} disabled={!newGrant.title || !newGrant.funder || saving}
            className="mt-4 px-5 py-2 bg-sovereign-500 hover:bg-sovereign-400 text-black font-semibold text-sm rounded-md transition-colors disabled:opacity-40 flex items-center gap-2">
            {saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : 'Save Grant'}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
          <input
            className="w-full pl-8 pr-3 py-2 bg-[#0f0f1a] border border-[#1e1e35] rounded-md text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sovereign-500"
            placeholder="Search grants, funders..."
            value={query} onChange={e => setQuery(e.target.value)}
          />
        </div>
        <select className="bg-[#0f0f1a] border border-[#1e1e35] rounded-md px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-sovereign-500"
          value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {GRANT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="bg-[#0f0f1a] border border-[#1e1e35] rounded-md px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-sovereign-500"
          value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {GRANT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {(catFilter || typeFilter || query) && (
          <button onClick={() => { setCatFilter(''); setTypeFilter(''); setQuery('') }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-2 border border-[#1e1e35] rounded-md">
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Grant List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={20} className="animate-spin text-sovereign-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 card">
          <p className="text-slate-400 text-sm">No grants match your filters.</p>
          <button onClick={() => setShowAdd(true)} className="mt-3 text-sovereign-400 text-sm">
            Add a grant manually →
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(grant => {
            const daysLeft = grant.deadline
              ? Math.ceil((new Date(grant.deadline).getTime() - Date.now()) / 86400000)
              : null
            const urgent = daysLeft !== null && daysLeft <= 14

            return (
              <div key={grant.id} className="card p-4 hover:border-sovereign-500/30 transition-colors group">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/grant/${grant.id}`}
                        className="text-sm font-semibold text-white group-hover:text-sovereign-300 transition-colors truncate">
                        {grant.title}
                      </Link>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#1e1e35] text-slate-500">
                        {grant.grant_type}
                      </span>
                      {grant.category && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sovereign-500/10 text-sovereign-400 border border-sovereign-500/20">
                          {grant.category}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{grant.funder} · {grant.location}</div>
                    {grant.description && (
                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{grant.description}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right space-y-1">
                    {grant.amount_max && (
                      <div className="text-sm font-mono font-bold text-sovereign-400">
                        ${grant.amount_max >= 1000000
                          ? `${(grant.amount_max/1000000).toFixed(1)}M`
                          : `${(grant.amount_max/1000).toFixed(0)}K`}
                      </div>
                    )}
                    {daysLeft !== null && (
                      <div className={`text-xs font-mono ${urgent ? 'text-red-400' : 'text-yellow-400'}`}>
                        {daysLeft > 0 ? `${daysLeft}d left` : 'EXPIRED'}
                      </div>
                    )}
                    <div className="flex gap-1 mt-2">
                      <Link href={`/ai-writer?grant=${grant.id}`}
                        className="text-[10px] px-2 py-1 bg-sovereign-500/10 text-sovereign-400 border border-sovereign-500/20 rounded hover:bg-sovereign-500/20 transition-colors">
                        Write
                      </Link>
                      <Link href={`/grant/${grant.id}`}
                        className="text-[10px] px-2 py-1 bg-[#141420] text-slate-400 border border-[#1e1e35] rounded hover:text-white transition-colors">
                        Track
                      </Link>
                      {grant.source_url && (
                        <a href={grant.source_url} target="_blank" rel="noopener noreferrer"
                          className="p-1 text-slate-600 hover:text-slate-300 transition-colors">
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

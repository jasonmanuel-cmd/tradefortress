import { createServerSupabase } from '@/lib/supabase-server'
import { PIPELINE_STAGES } from '@/lib/coai-profile'
import { formatDistanceToNow, parseISO, isPast } from 'date-fns'
import Link from 'next/link'
import { Trophy, Clock, AlertTriangle, TrendingUp, Plus, ExternalLink } from 'lucide-react'

async function getDashboardData() {
  const supabase = createServerSupabase()
  const [grantsRes, appsRes] = await Promise.all([
    supabase.from('grants').select('*').eq('status', 'active'),
    supabase.from('applications').select('*, grants(title, funder, deadline, amount_max)').order('created_at', { ascending: false })
  ])
  return {
    grants: grantsRes.data || [],
    applications: appsRes.data || [],
  }
}

export default async function Dashboard() {
  const { grants, applications } = await getDashboardData()

  const awarded    = applications.filter(a => a.result === 'awarded')
  const active     = applications.filter(a => !['denied','awarded','withdrawn'].includes(a.result || ''))
  const deadlines  = grants.filter(g => g.deadline && !isPast(parseISO(g.deadline)))
    .sort((a,b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 5)

  const totalAwarded = awarded.reduce((s, a) => s + (a.awarded_amount || 0), 0)

  // Stage distribution
  const stageCounts: Record<number, number> = {}
  active.forEach(a => {
    stageCounts[a.stage] = (stageCounts[a.stage] || 0) + 1
  })

  return (
    <div className="p-6 md:p-8 pt-20 md:pt-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs font-mono text-sovereign-400 mb-1">COAI GRANT COMMAND CENTER</div>
        <h1 className="text-2xl font-bold text-white">Command Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Sovereign grant intelligence — no subscriptions, no middlemen.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Grants Tracked',    value: grants.length,      icon: TrendingUp, color: 'text-blue-400' },
          { label: 'Active Apps',        value: active.length,      icon: Clock,      color: 'text-yellow-400' },
          { label: 'Awarded',            value: awarded.length,     icon: Trophy,     color: 'text-sovereign-400' },
          { label: 'Total Won',          value: `$${(totalAwarded/1000).toFixed(0)}K`, icon: Trophy, color: 'text-forge-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon size={14} className={color} />
              <span className="text-xs text-slate-500 font-mono">{label}</span>
            </div>
            <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Pipeline Snapshot */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-mono text-slate-500 mb-0.5">PIPELINE</div>
              <h2 className="text-sm font-semibold">Active Applications</h2>
            </div>
            <Link href="/pipeline" className="text-xs text-sovereign-400 hover:text-sovereign-300">
              Full View →
            </Link>
          </div>
          <div className="space-y-2">
            {Object.entries(PIPELINE_STAGES).map(([num, { name, color }]) => {
              const count = stageCounts[parseInt(num)] || 0
              if (count === 0) return null
              return (
                <div key={num} className="flex items-center gap-3">
                  <div className="stage-badge text-black" style={{ background: color }}>
                    {String(num).padStart(2,'0')}
                  </div>
                  <span className="text-xs text-slate-300 flex-1">{name}</span>
                  <span className="text-xs font-mono font-bold" style={{ color }}>{count}</span>
                </div>
              )
            })}
            {active.length === 0 && (
              <div className="text-center py-6">
                <p className="text-slate-500 text-xs">No active applications yet.</p>
                <Link href="/search" className="text-sovereign-400 text-xs mt-2 inline-block">
                  Find grants to apply for →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-mono text-slate-500 mb-0.5">DEADLINES</div>
              <h2 className="text-sm font-semibold">Coming Up</h2>
            </div>
            <Link href="/search?sort=deadline" className="text-xs text-sovereign-400 hover:text-sovereign-300">
              All Grants →
            </Link>
          </div>
          <div className="space-y-3">
            {deadlines.map(grant => {
              const daysLeft = Math.ceil((new Date(grant.deadline!).getTime() - Date.now()) / 86400000)
              const urgent = daysLeft <= 14
              return (
                <Link key={grant.id} href={`/grant/${grant.id}`}
                  className="flex items-start gap-3 hover:bg-[#141420] -mx-2 px-2 py-2 rounded transition-colors group">
                  {urgent
                    ? <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                    : <Clock size={14} className="text-slate-500 mt-0.5 shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-200 truncate group-hover:text-white">
                      {grant.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{grant.funder}</div>
                  </div>
                  <div className={`text-[11px] font-mono shrink-0 ${urgent ? 'text-red-400' : 'text-yellow-400'}`}>
                    {daysLeft}d
                  </div>
                </Link>
              )
            })}
            {deadlines.length === 0 && (
              <p className="text-slate-500 text-xs text-center py-6">No upcoming deadlines tracked.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Grants */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs font-mono text-slate-500 mb-0.5">INVENTORY</div>
            <h2 className="text-sm font-semibold">Recent Grants Added</h2>
          </div>
          <Link href="/search" className="flex items-center gap-1.5 text-xs bg-sovereign-500/10 text-sovereign-400 border border-sovereign-500/20 px-3 py-1.5 rounded hover:bg-sovereign-500/20 transition-colors">
            <Plus size={12} /> Add Grant
          </Link>
        </div>
        <div className="space-y-2">
          {grants.slice(0,6).map(grant => (
            <Link key={grant.id} href={`/grant/${grant.id}`}
              className="flex items-center gap-4 hover:bg-[#141420] -mx-2 px-2 py-2.5 rounded transition-colors group">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-slate-200 truncate group-hover:text-white">
                  {grant.title}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {grant.funder} · {grant.grant_type} · {grant.location}
                </div>
              </div>
              {grant.amount_max && (
                <div className="text-xs font-mono text-sovereign-400 shrink-0">
                  up to ${(grant.amount_max/1000).toFixed(0)}K
                </div>
              )}
              <div className="text-[11px] font-mono px-2 py-0.5 rounded border text-slate-400 border-[#1e1e35]">
                {grant.category}
              </div>
              <ExternalLink size={12} className="text-slate-600 shrink-0" />
            </Link>
          ))}
          {grants.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">No grants in your database yet.</p>
              <Link href="/sync" className="text-sovereign-400 text-sm mt-2 inline-block font-medium">
                Sync from Grants.gov →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

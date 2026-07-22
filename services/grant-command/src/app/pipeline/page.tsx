'use client'
import { useState, useEffect } from 'react'
import { supabase, Application } from '@/lib/supabase'
import { PIPELINE_STAGES } from '@/lib/coai-profile'
import Link from 'next/link'
import { Loader2, ArrowRight, Trophy, AlertCircle } from 'lucide-react'

export default function PipelinePage() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('applications')
      .select('*, grants(title, funder, deadline, amount_max)')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setApps(data || []); setLoading(false) })
  }, [])

  const moveStage = async (appId: string, newStage: number) => {
    const stageName = PIPELINE_STAGES[newStage]?.name || ''
    await supabase.from('applications').update({ stage: newStage, stage_name: stageName }).eq('id', appId)
    setApps(prev => prev.map(a => a.id === appId ? { ...a, stage: newStage, stage_name: stageName } : a))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96 pt-20 md:pt-0">
      <Loader2 size={20} className="animate-spin text-sovereign-400" />
    </div>
  )

  return (
    <div className="p-6 md:p-8 pt-20 md:pt-8">
      <div className="mb-6">
        <div className="text-xs font-mono text-sovereign-400 mb-1">GRANT PIPELINE</div>
        <h1 className="text-2xl font-bold text-white">Application Pipeline</h1>
        <p className="text-slate-400 text-sm mt-1">12-stage grant lifecycle tracker — Interest to Post Award.</p>
      </div>

      {apps.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-400 text-sm">No applications tracked yet.</p>
          <Link href="/search" className="text-sovereign-400 text-sm mt-2 inline-block">
            Find grants to apply for →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {Object.entries(PIPELINE_STAGES).map(([num, { name, color }]) => {
            const stageNum = parseInt(num)
            const stageApps = apps.filter(a => a.stage === stageNum)

            return (
              <div key={num} className="card overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e1e35]">
                  <div className="stage-badge text-black text-[10px]" style={{ background: color }}>
                    {String(stageNum).padStart(2,'0')}
                  </div>
                  <span className="text-xs font-semibold text-slate-300">{name}</span>
                  {stageApps.length > 0 && (
                    <span className="text-xs font-mono px-1.5 rounded" style={{ color, background: `${color}20` }}>
                      {stageApps.length}
                    </span>
                  )}
                  {stageNum === 9 && <Trophy size={12} className="text-forge-400 ml-1" />}
                </div>

                {stageApps.length > 0 && (
                  <div className="p-3 space-y-2">
                    {stageApps.map(app => (
                      <div key={app.id} className="flex items-center gap-3 bg-[#141420] rounded p-3">
                        <div className="flex-1 min-w-0">
                          <Link href={`/grant/${app.grant_id}`} className="text-xs font-medium text-white hover:text-sovereign-300 truncate block">
                            {(app as any).grants?.title || 'Untitled Grant'}
                          </Link>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {(app as any).grants?.funder}
                            {app.requested_amount && ` · $${app.requested_amount.toLocaleString()} requested`}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {stageNum > 1 && (
                            <button onClick={() => moveStage(app.id, stageNum - 1)}
                              className="p-1 text-slate-600 hover:text-slate-300 transition-colors text-xs border border-[#1e1e35] rounded">
                              ←
                            </button>
                          )}
                          {stageNum < 12 && stageNum !== 8 && (
                            <button onClick={() => moveStage(app.id, stageNum + 1)}
                              className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-slate-400 hover:text-white border border-[#1e1e35] hover:border-sovereign-500/40 rounded transition-colors">
                              {PIPELINE_STAGES[stageNum + 1]?.name} <ArrowRight size={10} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

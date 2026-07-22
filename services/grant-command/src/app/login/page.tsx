'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase-browser'
import { Lock, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createBrowserSupabase()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded bg-sovereign-500 flex items-center justify-center sovereign-glow">
            <span className="text-black text-sm font-bold font-mono">GC</span>
          </div>
          <div>
            <div className="text-base font-bold text-white leading-none">Grant Command</div>
            <div className="text-[11px] text-sovereign-400 font-mono mt-1">COAI — SOVEREIGN ACCESS</div>
          </div>
        </div>

        <form onSubmit={login} className="card p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-2">
            <Lock size={12} /> AUTHENTICATED ACCESS ONLY
          </div>

          <input
            type="email"
            required
            placeholder="Email"
            className="w-full bg-[#141420] border border-[#1e1e35] rounded-md px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sovereign-500"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            placeholder="Password"
            className="w-full bg-[#141420] border border-[#1e1e35] rounded-md px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sovereign-500"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded p-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-sovereign-500 hover:bg-sovereign-400 text-black font-semibold text-sm transition-colors disabled:opacity-40"
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> Authenticating...</> : 'Enter Command Center'}
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-600 mt-4 font-mono">
          Private system. Access created in Supabase Dashboard only.
        </p>
      </div>
    </div>
  )
}

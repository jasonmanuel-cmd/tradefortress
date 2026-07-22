'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase-browser'
import {
  LayoutDashboard, Search, Kanban, FileText, FolderOpen,
  Zap, LogOut, ChevronRight
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard',   label: 'Command',    icon: LayoutDashboard },
  { href: '/search',      label: 'Find Grants', icon: Search },
  { href: '/pipeline',    label: 'Pipeline',    icon: Kanban },
  { href: '/ai-writer',   label: 'AI Writer',   icon: FileText },
  { href: '/documents',   label: 'Documents',   icon: FolderOpen },
  { href: '/sync',        label: 'Sync Grants', icon: Zap },
]

export default function Nav() {
  const path = usePathname()

  return (
    <>
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-60 flex-col border-r border-[#1e1e35] bg-[#0a0a0f] z-50">
        {/* Logo */}
        <div className="p-5 border-b border-[#1e1e35]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-sovereign-500 flex items-center justify-center">
              <span className="text-black text-xs font-bold font-mono">GC</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-white leading-none">Grant Command</div>
              <div className="text-[10px] text-sovereign-400 font-mono mt-0.5">COAI — Sovereign Stack</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = path.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  active
                    ? 'bg-sovereign-500/10 text-sovereign-400 border border-sovereign-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-[#141420]'
                }`}
              >
                <Icon size={16} />
                {label}
                {active && <ChevronRight size={12} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#1e1e35] flex items-center justify-between">
          <div className="text-[11px] text-slate-600 font-mono">
            <div className="text-slate-400 font-semibold">Jason Manuel</div>
            <div>CEO — COAI</div>
            <div className="text-sovereign-500 mt-1">● System Online</div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0a0a0f] border-b border-[#1e1e35] z-50 flex items-center px-4 gap-4">
        <div className="w-6 h-6 rounded bg-sovereign-500 flex items-center justify-center">
          <span className="text-black text-[10px] font-bold">GC</span>
        </div>
        <span className="text-sm font-semibold">Grant Command</span>
        <div className="ml-auto flex gap-1">
          {NAV_ITEMS.slice(0,4).map(({ href, icon: Icon }) => (
            <Link key={href} href={href}
              className={`p-2 rounded ${path.startsWith(href) ? 'text-sovereign-400' : 'text-slate-500'}`}>
              <Icon size={18} />
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}

function LogoutButton() {
  const router = useRouter()
  const logout = async () => {
    const supabase = createBrowserSupabase()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }
  return (
    <button onClick={logout} title="Log out"
      className="p-2 text-slate-600 hover:text-red-400 transition-colors">
      <LogOut size={14} />
    </button>
  )
}

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isAdminSession } from '@/lib/supabase-admin'
import { supabaseConfigured } from '@/lib/session'

export const metadata: Metadata = {
  title: 'Administration',
  robots: { index: false, follow: false },
}

// Sessions are read from cookies on every request.
export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!supabaseConfigured()) {
    redirect('/signon?setup=required')
  }

  const admin = await isAdminSession()
  if (!admin) {
    redirect('/signon?next=/admin&admin=1')
  }

  return children
}

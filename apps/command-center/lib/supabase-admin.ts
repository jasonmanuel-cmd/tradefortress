import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function isAdminSession() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const admin = getAdmin()
  if (!url || !anonKey || !admin) return false

  const store = await cookies()
  const sessionClient = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => store.getAll(),
      // Called from a Server Component, where cookies are read-only. Token
      // refreshes are handled by proxy.ts, so a failure here is non-fatal.
      setAll: (items) => {
        try {
          items.forEach(({ name, value, options }) => store.set(name, value, options))
        } catch {
          /* read-only cookie store */
        }
      },
    },
  })
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) return false
  const { data } = await admin.from('clients').select('role').eq('id', user.id).maybeSingle()
  return data?.role === 'admin'
}

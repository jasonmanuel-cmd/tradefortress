import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getAdmin } from './supabase-admin'

export type SessionUser = { id: string; email: string | null }

export function supabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}

/**
 * Reads the signed-in user from Supabase auth cookies. Returns null when auth
 * is not configured or the caller is anonymous.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null

  try {
    const store = await cookies()
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (items) => {
          try {
            items.forEach(({ name, value, options }) => store.set(name, value, options))
          } catch {
            /* read-only cookie store */
          }
        },
      },
    })
    const { data } = await supabase.auth.getUser()
    if (!data.user) return null
    return { id: data.user.id, email: data.user.email ?? null }
  } catch {
    return null
  }
}

export type ClientRecord = {
  id: string
  business_name: string
  owner_name: string | null
  email: string
  status: string
  role: string
  plan_tier: string
  monthly_fee: number | null
  payment_status: string
  trial_ends_at?: string | null
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
}

export async function getClientRecord(userId: string): Promise<ClientRecord | null> {
  const admin = getAdmin()
  if (!admin) return null
  const { data } = await admin.from('clients').select('*').eq('id', userId).maybeSingle()
  return (data as ClientRecord | null) ?? null
}

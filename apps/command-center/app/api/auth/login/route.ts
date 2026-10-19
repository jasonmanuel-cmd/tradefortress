import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { enforceRateLimit, jsonError, noStore } from '@/lib/api'
import { clientIp } from '@/lib/rate-limit'
import { getAdmin } from '@/lib/supabase-admin'

const INVALID_LOGIN = 'Invalid username or password.'

export async function POST(request: Request) {
  const ipLimit = enforceRateLimit(`login:ip:${clientIp(request)}`, 20, 10 * 60 * 1000)
  if (ipLimit) return ipLimit

  let body: { identifier?: unknown; password?: unknown }

  try {
    body = await request.json()
  } catch {
    return jsonError(INVALID_LOGIN, 400)
  }

  const identifier = typeof body.identifier === 'string' ? body.identifier.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!identifier || identifier.length > 254 || !password || password.length > 256) {
    return jsonError(INVALID_LOGIN, 400)
  }

  const identifierLimit = enforceRateLimit(`login:id:${identifier}`, 8, 10 * 60 * 1000)
  if (identifierLimit) {
    return jsonError('Too many sign-in attempts for this account. Try again in a few minutes.', 429)
  }

  const admin = getAdmin()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!admin || !url || !anonKey) {
    return jsonError('Sign-in is temporarily unavailable. Please try again shortly.', 503)
  }

  let email = identifier
  if (!identifier.includes('@')) {
    if (!/^[a-z0-9_.-]{3,32}$/.test(identifier)) {
      return jsonError(INVALID_LOGIN, 401)
    }

    const { data: client } = await admin
      .from('clients')
      .select('email')
      .ilike('username', identifier)
      .maybeSingle()

    if (!client?.email) {
      return jsonError(INVALID_LOGIN, 401)
    }
    email = client.email
  }

  // Accounts that are suspended or unpaid past the grace window cannot sign in.
  const { data: profile } = await admin
    .from('clients')
    .select('id, role, status')
    .eq('email', email)
    .maybeSingle()

  if (profile?.status === 'suspended') {
    return jsonError(
      'This account is suspended. Email support@coaibakersfield.com so we can help you restore access.',
      403,
    )
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (items) => items.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
    },
  })

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) {
    return jsonError(INVALID_LOGIN, 401)
  }

  let destination = '/crm'

  if (profile) {
    const now = new Date().toISOString()
    await admin.from('clients').update({ last_login_at: now }).eq('id', profile.id)
    if (profile.role === 'admin') destination = '/admin'
  } else {
    const { data: client } = await admin
      .from('clients')
      .select('id, role')
      .eq('id', data.user.id)
      .maybeSingle()
    if (client?.role === 'admin') destination = '/admin'
  }

  return noStore(NextResponse.json({ ok: true, destination }))
}

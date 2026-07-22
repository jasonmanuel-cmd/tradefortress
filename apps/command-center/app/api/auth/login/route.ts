import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getAdmin } from '@/lib/supabase-admin'

const INVALID_LOGIN = 'Invalid username or password.'

export async function POST(request: Request) {
  let body: { identifier?: unknown; password?: unknown }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: INVALID_LOGIN }, { status: 400 })
  }

  const identifier = typeof body.identifier === 'string' ? body.identifier.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!identifier || identifier.length > 254 || !password || password.length > 256) {
    return NextResponse.json({ error: INVALID_LOGIN }, { status: 400 })
  }

  const admin = getAdmin()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!admin || !url || !anonKey) {
    return NextResponse.json({ error: 'Login is temporarily unavailable.' }, { status: 503 })
  }

  let email = identifier
  if (!identifier.includes('@')) {
    if (!/^[a-z0-9_]{3,32}$/.test(identifier)) {
      return NextResponse.json({ error: INVALID_LOGIN }, { status: 401 })
    }

    const { data: client } = await admin
      .from('clients')
      .select('email')
      .ilike('username', identifier)
      .maybeSingle()

    if (!client?.email) {
      return NextResponse.json({ error: INVALID_LOGIN }, { status: 401 })
    }
    email = client.email
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
    return NextResponse.json({ error: INVALID_LOGIN }, { status: 401 })
  }

  const { data: client } = await admin
    .from('clients')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle()

  return NextResponse.json({ destination: client?.role === 'admin' ? '/admin' : '/crm' })
}

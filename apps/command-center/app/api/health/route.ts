import { NextResponse } from 'next/server'
import { getAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Public liveness/readiness probe for uptime monitors.
 * Reports only whether each integration is configured — never key values.
 */
export async function GET() {
  const startedAt = Date.now()
  const admin = getAdmin()

  let database: 'ok' | 'error' | 'not_configured' = 'not_configured'
  if (admin) {
    database = 'error'
    try {
      const { error } = await admin
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .limit(1)
      if (!error) database = 'ok'
    } catch {
      database = 'error'
    }
  }

  const integrations = {
    auth: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    database,
    messaging: Boolean(process.env.TELNYX_API_KEY && process.env.TELNYX_PUBLIC_KEY),
    email: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL),
    billing: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
    self_serve_signup: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
    ),
  }

  const healthy = database === 'ok' && integrations.auth

  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'degraded',
      service: 'trade-fortress-command-center',
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'dev',
      checked_at: new Date().toISOString(),
      response_ms: Date.now() - startedAt,
      integrations,
    },
    {
      status: healthy ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    },
  )
}

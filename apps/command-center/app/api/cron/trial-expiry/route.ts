import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) return false
  const header = request.headers.get('authorization') ?? ''
  const provided = header.replace(/^Bearer\s+/i, '')
  if (provided.length !== secret.length) return false
  return timingSafeEqual(Buffer.from(provided), Buffer.from(secret))
}

/**
 * Daily housekeeping: suspends trials that ended more than three days ago and
 * were never converted to a paid plan. Triggered by Vercel Cron (see vercel.json).
 */
export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  const { data, error } = await admin.rpc('expire_finished_trials')
  if (error) {
    console.error('Trial expiry job failed:', error.message)
    return NextResponse.json({ error: 'Trial expiry failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, suspended: data ?? 0 })
}

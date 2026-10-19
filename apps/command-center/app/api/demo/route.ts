import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { normalizeUsPhone } from '@/lib/validation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function cleanHeaderValue(value: string) {
  return value.replace(/[^\x20-\x7E]/g, '').trim()
}

async function getDemoFromNumber() {
  if (process.env.TELNYX_DEMO_FROM_NUMBER) return process.env.TELNYX_DEMO_FROM_NUMBER
  if (!supabaseUrl || !supabaseKey) return null

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabase
    .from('telephony_config')
    .select('provisioned_phone_number')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Demo sender lookup failed:', error.message)
  }

  return data?.provisioned_phone_number || null
}

function isRateLimited(key: string, limit: number, windowMs: number) {
  return !rateLimit(key, limit, windowMs).ok
}

export async function POST(req: NextRequest) {
  const telnyxKey = process.env.TELNYX_API_KEY ? cleanHeaderValue(process.env.TELNYX_API_KEY) : ''

  if (!telnyxKey) {
    console.error('Demo SMS is not configured: TELNYX_API_KEY is missing.')
    return NextResponse.json(
      { error: 'The text demo is temporarily unavailable. Please call or message us directly.' },
      { status: 503 },
    )
  }

  try {
    const body = await req.json()
    const { phone, consent } = body

    if (typeof phone !== 'string' || !phone.trim() || consent !== true) {
      return NextResponse.json(
        { error: 'Enter a valid phone number and agree to receive the demo message.' },
        { status: 400 },
      )
    }

    const cleanPhone = normalizeUsPhone(phone)
    if (!cleanPhone) {
      return NextResponse.json({ error: 'Enter a 10-digit US phone number.' }, { status: 400 })
    }

    const ip = clientIp(req)
    if (isRateLimited(`demo:ip:${ip}`, 3, 60 * 60 * 1000) || isRateLimited(`demo:phone:${cleanPhone}`, 2, 24 * 60 * 60 * 1000)) {
      return NextResponse.json({ error: 'Demo limit reached. Please try again later.' }, { status: 429 })
    }

    const demoFromNumber = await getDemoFromNumber()
    if (!demoFromNumber) {
      return NextResponse.json({ error: 'The text demo is temporarily unavailable.' }, { status: 503 })
    }
    const smsContent = "Trade Fortress demo: This is a one-time example of the Trade Fortress missed-call reply. No subscription was created. Reply STOP to opt out."

    const smsRes = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: demoFromNumber,
        to: cleanPhone,
        text: smsContent,
      }),
    })

    if (!smsRes.ok) {
      const errorText = await smsRes.text()
      console.error('Telnyx demo SMS failed.', {
        status: smsRes.status,
        from: demoFromNumber,
        toSuffix: cleanPhone.slice(-4),
        error: errorText,
      })

      return NextResponse.json(
        { error: 'The text demo could not send to that number. Please try a mobile number or contact us directly.' },
        { status: 502 },
      )
    }

    return NextResponse.json({ ok: true, message: 'Demo text sent. Check your phone in a few seconds.' })
  } catch (err) {
    console.error('Demo API error:', err)
    return NextResponse.json(
      { error: 'The text demo is temporarily unavailable. Please try again in a few minutes.' },
      { status: 500 },
    )
  }
}

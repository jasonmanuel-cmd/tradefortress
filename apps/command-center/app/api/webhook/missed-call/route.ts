import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createPublicKey, verify } from 'node:crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function cleanHeaderValue(value: string) {
  return value.replace(/[^\x20-\x7E]/g, '').trim()
}

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) return null
  return createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function verifyTelnyxWebhook(rawBody: string, req: NextRequest) {
  const signature = req.headers.get('telnyx-signature-ed25519')
  const timestamp = req.headers.get('telnyx-timestamp')
  const configuredKey = process.env.TELNYX_PUBLIC_KEY?.trim()
  if (!signature || !timestamp || !configuredKey) return false

  const sentAt = Number(timestamp)
  if (!Number.isFinite(sentAt) || Math.abs(Date.now() / 1000 - sentAt) > 300) return false

  try {
    const publicKey = configuredKey.includes('BEGIN PUBLIC KEY')
      ? createPublicKey(configuredKey)
      : createPublicKey({
          key: Buffer.concat([
            Buffer.from('302a300506032b6570032100', 'hex'),
            Buffer.from(configuredKey, 'base64'),
          ]),
          format: 'der',
          type: 'spki',
        })
    return verify(
      null,
      Buffer.from(`${timestamp}|${rawBody}`),
      publicKey,
      Buffer.from(signature, 'base64'),
    )
  } catch {
    return false
  }
}

function parsePayload(body: unknown) {
  if (!body || typeof body !== 'object' || !('data' in body)) return null
  const data = (body as { data?: unknown }).data
  if (!data || typeof data !== 'object') return null
  const event = data as { event_type?: unknown; payload?: unknown }
  if (event.event_type !== 'call.hangup' || !event.payload || typeof event.payload !== 'object') return null
  const payload = event.payload as { from?: unknown; to?: unknown; hangup_cause?: unknown }
  return {
    from: typeof payload.from === 'string' ? payload.from : null,
    to: typeof payload.to === 'string' ? payload.to : null,
    isMissed: payload.hangup_cause === 'NO_ANSWER',
  }
}

export async function POST(req: NextRequest) {
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Unsupported webhook content type.' }, { status: 415 })
  }

  const rawBody = await req.text()
  if (!rawBody || rawBody.length > 100_000) {
    return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 })
  }
  if (!verifyTelnyxWebhook(rawBody, req)) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Webhook service not configured.' }, { status: 500 })
  }

  let raw: unknown
  const contentType = req.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) return NextResponse.json({ error: 'Invalid content type.' }, { status: 415 })
  try { raw = JSON.parse(rawBody) } catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }) }

  const payload = parsePayload(raw)
  if (!payload) return NextResponse.json({ error: 'Unsupported webhook event.' }, { status: 400 })
  const { from: customerNumber, to: trackingNumber, isMissed } = payload

  if (!isMissed || !customerNumber || !trackingNumber) {
    return new NextResponse('OK', { status: 200 })
  }

  try {
    const { data: config, error: configError } = await supabase
      .from('telephony_config')
      .select('client_id')
      .eq('provisioned_phone_number', trackingNumber)
      .single()

    if (configError || !config) {
      console.error('Telephony config lookup failed:', configError?.message)
      return NextResponse.json({ error: 'Client routing mapping not found.' }, { status: 404 })
    }

    const clientId = config.client_id

    const { data: template } = await supabase
      .from('text_templates')
      .select('sms_body')
      .eq('client_id', clientId)
      .eq('trigger_event', 'no-answer')
      .single()

    const smsContent = !template
      ? "Hey! Sorry we missed your call. We'll get back to you shortly."
      : template.sms_body

    // Send SMS via Telnyx API (if configured)
    const telnyxKey = process.env.TELNYX_API_KEY ? cleanHeaderValue(process.env.TELNYX_API_KEY) : ''
    if (telnyxKey) {
      const smsRes = await fetch('https://api.telnyx.com/v2/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${telnyxKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: trackingNumber,
          to: customerNumber,
          text: smsContent,
        }),
      })
      const smsResult = await smsRes.json()
      await supabase.from('lead_logs').insert({
        client_id: clientId,
        customer_phone: customerNumber,
        call_status: 'no-answer',
        sms_sent_status: smsRes.ok ? 'sent' : 'failed',
        status: 'new',
        timestamp: new Date().toISOString(),
      })
      if (!smsRes.ok) {
        console.error('Telnyx SMS failed:', JSON.stringify(smsResult))
      }
    } else {
      // No Telnyx key — log the lead but don't send SMS
      await supabase.from('lead_logs').insert({
        client_id: clientId,
        customer_phone: customerNumber,
        call_status: 'no-answer',
        sms_sent_status: 'not_configured',
        status: 'new',
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Internal error.' }, { status: 500 })
  }
}

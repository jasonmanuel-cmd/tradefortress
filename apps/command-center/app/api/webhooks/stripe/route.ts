import { NextRequest, NextResponse } from 'next/server'
import { getAdmin } from '@/lib/supabase-admin'
import { normalizePlanKey, PLAN_MAP } from '@/lib/plans'
import { verifyStripeSignature } from '@/lib/stripe'

type StripeEvent = {
  id?: string
  type?: string
  data?: { object?: Record<string, unknown> }
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value / 100 : null
}

async function clientIdForCustomer(
  supabase: NonNullable<ReturnType<typeof getAdmin>>,
  customerId: string | null,
) {
  if (!customerId) return null
  const { data } = await supabase
    .from('clients')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()
  return data?.id ?? null
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  if (!rawBody || rawBody.length > 1_000_000) {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 })
  }

  const event = verifyStripeSignature(
    rawBody,
    request.headers.get('stripe-signature'),
  ) as StripeEvent | null

  if (!event) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 })
  }

  const supabase = getAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Billing is not configured.' }, { status: 503 })
  }

  // Idempotency: Stripe retries deliveries, so each event is processed once.
  if (event.id) {
    const { error } = await supabase
      .from('billing_events')
      .insert({ event_id: event.id, event_type: event.type ?? 'unknown' })

    if (error) {
      if (error.code === '23505') return NextResponse.json({ received: true, duplicate: true })
      console.warn('Could not record billing event:', error.message)
    }
  }

  const object = event.data?.object ?? {}
  const type = event.type ?? ''

  try {
    if (type === 'checkout.session.completed' || type === 'customer.subscription.updated') {
      const metadata = (object.metadata ?? {}) as Record<string, unknown>
      const clientId =
        asString(object.client_reference_id) ??
        asString(metadata.client_id) ??
        (await clientIdForCustomer(supabase, asString(object.customer)))

      if (clientId) {
        const plan = normalizePlanKey(asString(metadata.plan) ?? asString(object.plan_tier))
        const fee = PLAN_MAP[plan].monthly
        await supabase
          .from('clients')
          .update({
            status: 'active',
            plan_tier: plan,
            monthly_fee: fee,
            payment_status: 'paid',
            stripe_customer_id: asString(object.customer),
            stripe_subscription_id: asString(object.subscription) ?? asString(object.id),
          })
          .eq('id', clientId)
      }
    }

    if (type === 'invoice.paid') {
      const clientId = await clientIdForCustomer(supabase, asString(object.customer))
      if (clientId) {
        const amount = asNumber(object.amount_paid) ?? 0
        const periodStart = typeof object.period_start === 'number'
          ? new Date(object.period_start * 1000)
          : new Date()
        const periodEnd = typeof object.period_end === 'number'
          ? new Date(object.period_end * 1000)
          : new Date(Date.now() + 30 * 86400000)

        await supabase.from('client_payments').insert({
          client_id: clientId,
          amount,
          status: 'paid',
          due_date: periodStart.toISOString().slice(0, 10),
          paid_at: new Date().toISOString(),
          payment_method: 'stripe',
          notes: `Stripe invoice ${asString(object.number) ?? asString(object.id) ?? ''}`.trim(),
          period_start: periodStart.toISOString().slice(0, 10),
          period_end: periodEnd.toISOString().slice(0, 10),
        })

        await supabase.from('clients').update({ payment_status: 'paid' }).eq('id', clientId)
      }
    }

    if (type === 'invoice.payment_failed') {
      const clientId = await clientIdForCustomer(supabase, asString(object.customer))
      if (clientId) {
        await supabase.from('clients').update({ payment_status: 'overdue' }).eq('id', clientId)
      }
    }

    if (type === 'customer.subscription.deleted') {
      const clientId = await clientIdForCustomer(supabase, asString(object.customer))
      if (clientId) {
        await supabase
          .from('clients')
          .update({ payment_status: 'unpaid', stripe_subscription_id: null })
          .eq('id', clientId)
      }
    }
  } catch (error) {
    console.error('Stripe webhook handling failed:', error)
    // Returning 500 asks Stripe to retry.
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

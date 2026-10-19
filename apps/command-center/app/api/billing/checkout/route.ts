import { NextRequest, NextResponse } from 'next/server'
import { enforceRateLimit, jsonError, noStore } from '@/lib/api'
import { PLAN_KEYS, type PlanKey } from '@/lib/plans'
import { createCheckoutSession, priceIdFor } from '@/lib/stripe'
import { getClientRecord, getSessionUser } from '@/lib/session'
import { oneOf } from '@/lib/validation'

/**
 * Creates a Stripe Checkout session for the signed-in client.
 * The client never supplies a price — only a plan key from our catalogue.
 */
export async function POST(request: NextRequest) {
  const user = await getSessionUser()
  if (!user) return jsonError('Please sign in to manage billing.', 401)

  const limited = enforceRateLimit(`checkout:${user.id}`, 10, 60 * 60 * 1000)
  if (limited) return limited

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return jsonError('Invalid request body.')
  }

  const plan = oneOf<PlanKey>(body.plan, PLAN_KEYS)
  const interval = oneOf(body.interval, ['month', 'year'] as const) ?? 'month'
  if (!plan) return jsonError('Choose a valid plan.')

  if (!process.env.STRIPE_SECRET_KEY || !priceIdFor(plan, interval)) {
    return jsonError(
      'Online billing is not enabled yet. Email support@coaibakersfield.com and we will set up your plan.',
      503,
    )
  }

  const client = await getClientRecord(user.id)
  if (!client) return jsonError('No business account is linked to this login.', 403)
  if (client.status === 'suspended') {
    return jsonError('This account is suspended. Contact support to restore access.', 403)
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin

  try {
    const session = await createCheckoutSession({
      plan,
      interval,
      clientId: user.id,
      email: client.email || user.email || '',
      customerId: client.stripe_customer_id ?? null,
      successUrl: `${origin}/crm/billing?checkout=success`,
      cancelUrl: `${origin}/crm/billing?checkout=cancelled`,
    })
    return noStore(NextResponse.json({ url: session.url }))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout failed.'
    if (message === 'price_not_configured') {
      return jsonError('That plan is not available for online checkout yet.', 503)
    }
    console.error('Stripe checkout failed:', message)
    return jsonError('We could not start checkout. Please try again.', 502)
  }
}

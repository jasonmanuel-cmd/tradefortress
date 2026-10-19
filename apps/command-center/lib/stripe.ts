import { createHmac, timingSafeEqual } from 'node:crypto'
import type { PlanKey } from './plans'

const STRIPE_API = 'https://api.stripe.com/v1'

export const STRIPE_PRICE_ENV: Record<PlanKey, Record<'month' | 'year', string>> = {
  starter: { month: 'STRIPE_PRICE_STARTER', year: 'STRIPE_PRICE_STARTER_ANNUAL' },
  operator: { month: 'STRIPE_PRICE_OPERATOR', year: 'STRIPE_PRICE_OPERATOR_ANNUAL' },
  team: { month: 'STRIPE_PRICE_TEAM', year: 'STRIPE_PRICE_TEAM_ANNUAL' },
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET)
}

export function priceIdFor(plan: PlanKey, interval: 'month' | 'year'): string | null {
  return process.env[STRIPE_PRICE_ENV[plan][interval]]?.trim() || null
}

async function stripeRequest(path: string, params: URLSearchParams) {
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  if (!key) throw new Error('Stripe is not configured')

  const response = await fetch(`${STRIPE_API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
    cache: 'no-store',
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const message = payload?.error?.message ?? `Stripe request failed (${response.status})`
    throw new Error(message)
  }
  return payload
}

export type CheckoutArgs = {
  plan: PlanKey
  interval: 'month' | 'year'
  clientId: string
  email: string
  successUrl: string
  cancelUrl: string
  customerId?: string | null
}

export async function createCheckoutSession(args: CheckoutArgs) {
  const priceId = priceIdFor(args.plan, args.interval)
  if (!priceId) throw new Error('price_not_configured')

  const params = new URLSearchParams({
    mode: 'subscription',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
    client_reference_id: args.clientId,
    'metadata[client_id]': args.clientId,
    'metadata[plan]': args.plan,
    'metadata[interval]': args.interval,
    'subscription_data[metadata][client_id]': args.clientId,
    'subscription_data[metadata][plan]': args.plan,
    allow_promotion_codes: 'true',
    'automatic_tax[enabled]': 'true',
    'billing_address_collection': 'auto',
  })

  if (args.customerId) params.set('customer', args.customerId)
  else params.set('customer_email', args.email)

  return stripeRequest('/checkout/sessions', params) as Promise<{ id: string; url: string }>
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  return stripeRequest(
    '/billing_portal/sessions',
    new URLSearchParams({ customer: customerId, return_url: returnUrl }),
  ) as Promise<{ url: string }>
}

/**
 * Verifies the `Stripe-Signature` header without pulling in the Stripe SDK.
 * Returns the parsed event, or null when the signature does not match.
 */
export function verifyStripeSignature(rawBody: string, header: string | null): unknown | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (!secret || !header) return null

  const parts = header.split(',').reduce<Record<string, string[]>>((acc, part) => {
    const [key, value] = part.split('=')
    if (!key || !value) return acc
    acc[key] = [...(acc[key] ?? []), value]
    return acc
  }, {})

  const timestamp = parts.t?.[0]
  const signatures = parts.v1 ?? []
  if (!timestamp || signatures.length === 0) return null

  // Reject events older than five minutes to prevent replay.
  const sentAt = Number(timestamp)
  if (!Number.isFinite(sentAt) || Math.abs(Date.now() / 1000 - sentAt) > 300) return null

  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest()
  const matches = signatures.some((signature) => {
    try {
      const provided = Buffer.from(signature, 'hex')
      return provided.length === expected.length && timingSafeEqual(provided, expected)
    } catch {
      return false
    }
  })
  if (!matches) return null

  try {
    return JSON.parse(rawBody)
  } catch {
    return null
  }
}

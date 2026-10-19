import { NextRequest, NextResponse } from 'next/server'
import { jsonError, noStore } from '@/lib/api'
import { createPortalSession } from '@/lib/stripe'
import { getClientRecord, getSessionUser } from '@/lib/session'

export async function POST(request: NextRequest) {
  const user = await getSessionUser()
  if (!user) return jsonError('Please sign in to manage billing.', 401)

  const client = await getClientRecord(user.id)
  if (!client?.stripe_customer_id) {
    return jsonError('No billing profile exists yet. Choose a plan to start.', 400)
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin

  try {
    const session = await createPortalSession(client.stripe_customer_id, `${origin}/crm/billing`)
    return noStore(NextResponse.json({ url: session.url }))
  } catch (error) {
    console.error('Stripe portal failed:', error instanceof Error ? error.message : error)
    return jsonError('The billing portal is unavailable right now.', 502)
  }
}

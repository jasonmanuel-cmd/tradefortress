import { NextResponse } from 'next/server'
import { rateLimit } from './rate-limit'

export function jsonError(message: string, status = 400, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error: message, ...extra }, { status })
}

export function tooManyRequests(retryAfterSeconds: number, message = 'Too many attempts. Please wait and try again.') {
  return NextResponse.json(
    { error: message },
    { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
  )
}

/** Applies a limiter and returns a 429 response when the caller is over budget. */
export function enforceRateLimit(key: string, limit: number, windowMs: number) {
  const result = rateLimit(key, limit, windowMs)
  if (result.ok) return null
  return tooManyRequests(result.retryAfterSeconds)
}

export function noStore(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store, max-age=0')
  return response
}

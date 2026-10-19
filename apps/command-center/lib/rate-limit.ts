/**
 * Small in-process sliding-window rate limiter.
 *
 * This is intentionally dependency-free and is enough to blunt accidental and
 * low-effort abuse on a single server instance. On serverless infrastructure
 * each instance keeps its own window; for hard guarantees (billing, SMS
 * spend, login lockouts) move the counter to Postgres/Redis. See
 * MARKET-READINESS.md for the follow-up.
 */

type Bucket = number[]

const buckets = new Map<string, Bucket>()
let lastSweep = Date.now()
const SWEEP_INTERVAL_MS = 60_000

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return
  lastSweep = now
  for (const [key, times] of buckets) {
    const newest = times[times.length - 1] ?? 0
    if (now - newest > 60 * 60 * 1000) buckets.delete(key)
  }
}

export type RateLimitResult = {
  ok: boolean
  remaining: number
  retryAfterSeconds: number
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  sweep(now)

  const recent = (buckets.get(key) ?? []).filter((time) => now - time < windowMs)

  if (recent.length >= limit) {
    const oldest = recent[0] ?? now
    buckets.set(key, recent)
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
    }
  }

  recent.push(now)
  buckets.set(key, recent)
  return {
    ok: true,
    remaining: Math.max(0, limit - recent.length),
    retryAfterSeconds: 0,
  }
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

export function resetRateLimits() {
  buckets.clear()
}

const baseUrl = (process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '')

async function check(name, path, options, expectedStatus) {
  const expected = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus]
  const response = await fetch(`${baseUrl}${path}`, { redirect: 'manual', ...options })

  if (!expected.includes(response.status)) {
    const body = await response.text()
    throw new Error(
      `${name}: expected ${expected.join(' or ')}, received ${response.status}: ${body.slice(0, 300)}`,
    )
  }
  console.log(`PASS ${name} (${response.status})`)
}

// Public marketing and legal surface
for (const path of ['/', '/pricing', '/start-trial', '/privacy', '/terms', '/sms-policy', '/signon']) {
  await check(`page ${path}`, path, undefined, 200)
}
await check('robots.txt', '/robots.txt', undefined, 200)
await check('sitemap.xml', '/sitemap.xml', undefined, 200)
await check('manifest', '/manifest.webmanifest', undefined, 200)
await check('unknown route returns 404', '/this-page-does-not-exist', undefined, 404)

// Protected areas redirect anonymous visitors instead of rendering
await check('crm requires a session', '/crm', undefined, [307, 308])
await check('admin requires a session', '/admin', undefined, [307, 308])

// Health endpoint is either healthy or explicitly degraded, never a crash
await check('health endpoint responds', '/api/health', undefined, [200, 503])

// Abusive or malformed API calls are rejected
await check(
  'unsigned Telnyx webhook is rejected',
  '/api/webhook/missed-call',
  { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"data":{}}' },
  401,
)
await check(
  'unsigned Stripe webhook is rejected',
  '/api/webhooks/stripe',
  { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"id":"evt_test"}' },
  401,
)
await check(
  'demo requires explicit consent',
  '/api/demo',
  { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"phone":"6615550134"}' },
  [400, 503],
)
await check(
  'signup rejects an invalid email',
  '/api/signup',
  {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ business_name: 'Smoke Test', email: 'not-an-email', password: 'short' }),
  },
  [400, 429, 503],
)
await check(
  'login rejects empty credentials',
  '/api/auth/login',
  { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' },
  [400, 429],
)

console.log(`Smoke checks passed against ${baseUrl}`)

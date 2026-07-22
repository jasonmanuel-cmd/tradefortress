const baseUrl = (process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '')

async function check(name, path, options, expectedStatus) {
  const response = await fetch(`${baseUrl}${path}`, options)
  if (response.status !== expectedStatus) {
    const body = await response.text()
    throw new Error(`${name}: expected ${expectedStatus}, received ${response.status}: ${body.slice(0, 300)}`)
  }
  console.log(`PASS ${name} (${response.status})`)
}

await check('landing page', '/', undefined, 200)
await check(
  'unsigned Telnyx webhook is rejected',
  '/api/webhook/missed-call',
  { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"data":{}}' },
  401,
)

console.log(`Smoke checks passed against ${baseUrl}`)

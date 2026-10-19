type SendEmailArgs = {
  to: string
  subject: string
  html: string
  replyTo?: string
}

/**
 * Sends transactional email through Resend's REST API.
 * Returns false (and logs) when email is not configured or delivery fails so
 * that a signup is never rolled back because of a notification problem.
 */
export async function sendEmail({ to, subject, html, replyTo }: SendEmailArgs): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.RESEND_FROM_EMAIL?.trim()
  if (!apiKey || !from) return false

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, html, reply_to: replyTo }),
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('Resend delivery failed:', response.status, await response.text())
      return false
    }
    return true
  } catch (error) {
    console.error('Resend request error:', error)
    return false
  }
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

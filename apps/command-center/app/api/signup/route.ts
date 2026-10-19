import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { enforceRateLimit, jsonError } from '@/lib/api'
import { sendEmail, escapeHtml } from '@/lib/email'
import { PLAN_MAP, PLAN_KEYS, TRIAL_DAYS, type PlanKey } from '@/lib/plans'
import { clientIp } from '@/lib/rate-limit'
import { getAdmin } from '@/lib/supabase-admin'
import { TRADE_CATEGORIES } from '@/lib/trades'
import {
  cleanText,
  isEmail,
  isStrongEnoughPassword,
  oneOf,
  normalizeUsPhone,
} from '@/lib/validation'

export const runtime = 'nodejs'

type SignupBody = {
  business_name?: unknown
  owner_name?: unknown
  email?: unknown
  password?: unknown
  phone?: unknown
  trade?: unknown
  plan?: unknown
  company_website?: unknown // honeypot
}

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(`signup:ip:${clientIp(request)}`, 5, 60 * 60 * 1000)
  if (limited) return limited

  let body: SignupBody
  try {
    body = (await request.json()) as SignupBody
  } catch {
    return jsonError('Invalid request body.')
  }

  // Bots that fill hidden fields are silently accepted but never provisioned.
  if (typeof body.company_website === 'string' && body.company_website.trim() !== '') {
    return NextResponse.json({ ok: true, redirect: '/signon' })
  }

  const businessName = cleanText(body.business_name, 120)
  const ownerName = cleanText(body.owner_name, 120)
  const email = isEmail(body.email) ? body.email.trim().toLowerCase() : ''
  const password = body.password

  if (businessName.length < 2) return jsonError('Enter your business name.')
  if (!email) return jsonError('Enter a valid email address.')
  if (!isStrongEnoughPassword(password)) {
    return jsonError('Choose a password with at least 10 characters.')
  }
  if (body.phone !== undefined && body.phone !== '' && !normalizeUsPhone(body.phone)) {
    return jsonError('Enter a 10-digit US phone number, or leave it blank.')
  }
  if (body.trade !== undefined && body.trade !== '' && !oneOf(body.trade, TRADE_CATEGORIES)) {
    return jsonError('Choose a trade from the list.')
  }

  const emailLimit = enforceRateLimit(`signup:email:${email}`, 3, 24 * 60 * 60 * 1000)
  if (emailLimit) return emailLimit

  const planKey: PlanKey = oneOf(body.plan, PLAN_KEYS) ?? 'operator'
  const plan = PLAN_MAP[planKey]
  const trade = oneOf(body.trade, TRADE_CATEGORIES)
  const phone = normalizeUsPhone(body.phone)

  const admin = getAdmin()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!admin || !url || !anonKey) {
    return jsonError(
      'Self-serve signup is not enabled on this deployment yet. Email support@coaibakersfield.com to get started.',
      503,
    )
  }

  const { data: existing } = await admin
    .from('clients')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    return jsonError('An account already exists for that email. Sign in instead.', 409)
  }

  const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 86400000).toISOString()

  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { business_name: businessName, owner_name: ownerName || null },
  })

  if (authError || !created.user) {
    const message = authError?.message ?? 'Could not create the account.'
    const duplicate = /already|registered|exists/i.test(message)
    return jsonError(duplicate ? 'An account already exists for that email.' : message, duplicate ? 409 : 400)
  }

  const userId = created.user.id

  const fullRecord = {
    id: userId,
    business_name: businessName,
    owner_name: ownerName || null,
    email,
    status: 'trialing',
    plan_tier: planKey,
    monthly_fee: plan.monthly,
    payment_status: 'unpaid',
    phone,
    trade,
    source: 'self_serve_trial',
    trial_ends_at: trialEndsAt,
  }

  let insertError = (await admin.from('clients').insert(fullRecord).select('id').single()).error

  // Older databases without the trial migration still get a working account.
  if (insertError && (insertError.code === 'PGRST204' || insertError.code === '42703')) {
    const { trial_ends_at: _trial, phone: _phone, trade: _trade, source: _source, ...core } = fullRecord
    insertError = (await admin.from('clients').insert(core).select('id').single()).error
  }

  if (insertError) {
    await admin.auth.admin.deleteUser(userId)
    console.error('Trial signup failed:', insertError.message)
    return jsonError('We could not create your account. Please try again or email support.', 500)
  }

  // Best-effort notifications — never blocks account creation.
  const notifyTo = process.env.SIGNUP_NOTIFY_EMAIL || process.env.SALES_NOTIFY_EMAIL
  if (notifyTo) {
    await sendEmail({
      to: notifyTo,
      subject: `New Trade Fortress trial: ${businessName}`,
      replyTo: email,
      html: `
        <h2>New self-serve trial</h2>
        <p><strong>Business:</strong> ${escapeHtml(businessName)}</p>
        <p><strong>Owner:</strong> ${escapeHtml(ownerName || 'Not provided')}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}</p>
        <p><strong>Trade:</strong> ${escapeHtml(trade || 'Not provided')}</p>
        <p><strong>Plan interest:</strong> ${escapeHtml(plan.name)} ($${plan.monthly}/mo)</p>
        <p><strong>Trial ends:</strong> ${trialEndsAt.slice(0, 10)}</p>
        <p>Sign in to the admin panel to provision a tracking number and send the onboarding checklist.</p>
      `,
    })
  }

  await sendEmail({
    to: email,
    subject: 'Your Trade Fortress trial is ready',
    html: `
      <h2>Welcome to Trade Fortress, ${escapeHtml(ownerName || businessName)}</h2>
      <p>Your 14-day trial is active. You can sign in now at
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://leadshield.live'}/signon">your command center</a>.</p>
      <p><strong>What happens next</strong></p>
      <ol>
        <li>We confirm your business details and provision your tracking number.</li>
        <li>We load your missed-call text template and first pipeline.</li>
        <li>We walk your team through a 20-minute setup call.</li>
      </ol>
      <p>Questions? Reply to this email or reach support@coaibakersfield.com.</p>
      <p>— Trade Fortress by Chaotically Organized AI</p>
    `,
  })

  // Sign the new owner in so the trial starts with one click.
  try {
    const store = await cookies()
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (items) => items.forEach(({ name, value, options }) => store.set(name, value, options)),
      },
    })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return NextResponse.json({ ok: true, redirect: '/signon?created=1' })
    }
  } catch {
    return NextResponse.json({ ok: true, redirect: '/signon?created=1' })
  }

  return NextResponse.json({ ok: true, redirect: '/crm?welcome=1' })
}

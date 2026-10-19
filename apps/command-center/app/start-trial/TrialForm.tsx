'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { PLANS, TRIAL_DAYS, normalizePlanKey, type PlanKey } from '@/lib/plans'
import { TRADE_CATEGORIES } from '@/lib/trades'

const INPUT: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: '#F7F9FB',
  border: '1px solid rgba(23,63,107,0.2)',
  borderRadius: '12px',
  padding: '12px 14px',
  color: '#102A43',
  fontSize: '15px',
  outline: 'none',
  fontFamily: 'inherit',
}

const LABEL: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 700,
  color: '#243B53',
  marginBottom: '6px',
}

export default function TrialForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialPlan = normalizePlanKey(searchParams.get('plan'))

  const [form, setForm] = useState({
    business_name: '',
    owner_name: '',
    email: '',
    phone: '',
    trade: '',
    plan: initialPlan as PlanKey,
    password: '',
    confirm: '',
    company_website: '',
    consent: false,
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (key: keyof typeof form, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }))

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')

    if (form.password.length < 10) {
      setError('Choose a password with at least 10 characters.')
      return
    }
    if (form.password !== form.confirm) {
      setError('The two passwords do not match.')
      return
    }
    if (!form.consent) {
      setError('Please accept the terms and messaging policy to continue.')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: form.business_name,
          owner_name: form.owner_name,
          email: form.email,
          phone: form.phone,
          trade: form.trade,
          plan: form.plan,
          password: form.password,
          company_website: form.company_website,
        }),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setError(data?.error || 'We could not create your account. Please try again.')
        setSubmitting(false)
        return
      }

      router.push(data?.redirect || '/crm')
    } catch {
      setError('Network error. Please check your connection and try again.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
      <div>
        <h2 className="font-display text-2xl font-black" style={{ color: '#102A43' }}>
          Create your command center
        </h2>
        <p className="mt-1 text-sm" style={{ color: '#52667A' }}>
          Already have an account?{' '}
          <Link href="/signon" className="font-bold underline" style={{ color: '#173F6B' }}>
            Sign in
          </Link>
        </p>
      </div>

      <div>
        <label style={LABEL} htmlFor="business_name">Business name</label>
        <input
          id="business_name"
          name="business_name"
          autoComplete="organization"
          required
          maxLength={120}
          value={form.business_name}
          onChange={(event) => update('business_name', event.target.value)}
          style={INPUT}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label style={LABEL} htmlFor="owner_name">Your name</label>
          <input
            id="owner_name"
            name="owner_name"
            autoComplete="name"
            maxLength={120}
            value={form.owner_name}
            onChange={(event) => update('owner_name', event.target.value)}
            style={INPUT}
          />
        </div>
        <div>
          <label style={LABEL} htmlFor="phone">Mobile phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(661) 555-0134"
            value={form.phone}
            onChange={(event) => update('phone', event.target.value)}
            style={INPUT}
          />
        </div>
      </div>

      <div>
        <label style={LABEL} htmlFor="email">Work email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(event) => update('email', event.target.value)}
          style={INPUT}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label style={LABEL} htmlFor="trade">Trade</label>
          <select
            id="trade"
            name="trade"
            value={form.trade}
            onChange={(event) => update('trade', event.target.value)}
            style={INPUT}
          >
            <option value="">Choose your trade</option>
            {TRADE_CATEGORIES.map((trade) => (
              <option key={trade} value={trade}>{trade}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={LABEL} htmlFor="plan">Plan to trial</label>
          <select
            id="plan"
            name="plan"
            value={form.plan}
            onChange={(event) => update('plan', event.target.value as PlanKey)}
            style={INPUT}
          >
            {PLANS.map((plan) => (
              <option key={plan.key} value={plan.key}>
                {plan.name} — ${plan.monthly}/mo
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label style={LABEL} htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            value={form.password}
            onChange={(event) => update('password', event.target.value)}
            style={INPUT}
          />
        </div>
        <div>
          <label style={LABEL} htmlFor="confirm">Confirm password</label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            value={form.confirm}
            onChange={(event) => update('confirm', event.target.value)}
            style={INPUT}
          />
        </div>
      </div>
      <p className="text-xs" style={{ color: '#596B7D' }}>
        At least 10 characters. Use a password you do not reuse elsewhere.
      </p>

      {/* Honeypot — hidden from people, filled by bots */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }}>
        <label htmlFor="company_website">Company website</label>
        <input
          id="company_website"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          value={form.company_website}
          onChange={(event) => update('company_website', event.target.value)}
        />
      </div>

      <label className="flex items-start gap-3 text-xs leading-relaxed" style={{ color: '#52667A' }}>
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(event) => update('consent', event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0"
          required
        />
        <span>
          I agree to the{' '}
          <Link href="/terms" className="font-bold underline" style={{ color: '#173F6B' }}>Terms of Service</Link>,{' '}
          <Link href="/privacy" className="font-bold underline" style={{ color: '#173F6B' }}>Privacy Policy</Link>, and{' '}
          <Link href="/sms-policy" className="font-bold underline" style={{ color: '#173F6B' }}>SMS &amp; Consent Policy</Link>,
          and I am authorized to accept them for this business.
        </span>
      </label>

      {error && (
        <p
          role="alert"
          className="rounded-xl px-4 py-3 text-sm font-semibold"
          style={{ background: 'rgba(181,71,58,0.08)', border: '1px solid rgba(181,71,58,0.3)', color: '#9B2C2C' }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl px-6 py-4 text-base font-black disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg,#286B96,#173F6B)', color: '#F7F3E8' }}
      >
        {submitting ? 'Creating your account…' : `Start my ${TRIAL_DAYS}-day trial`}
      </button>

      <p className="text-center text-xs" style={{ color: '#596B7D' }}>
        No credit card. No setup fee. Cancel any time.
      </p>
    </form>
  )
}

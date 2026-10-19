'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase'
import { PLANS, getPlan, TRIAL_DAYS } from '@/lib/plans'

const C = {
  bg: '#050814', cyan: '#00E5FF', gold: '#FFD700',
  green: '#00FF88', red: '#FF6B6B', text: '#E2E8F0', muted: '#94A3B8',
  panel: 'rgba(255,255,255,0.035)', border: 'rgba(255,255,255,0.08)',
}

const PANEL: React.CSSProperties = {
  background: C.panel, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px',
}

type ClientInfo = {
  business_name?: string
  plan_tier?: string
  monthly_fee?: number | null
  status?: string
  payment_status?: string
  trial_ends_at?: string | null
  stripe_customer_id?: string | null
}

export default function BillingPage() {
  const router = useRouter()
  const [client, setClient] = useState<ClientInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [interval, setInterval] = useState<'month' | 'year'>('month')

  const load = useCallback(async () => {
    const { data: { session } } = await createClient().auth.getSession()
    if (!session) { router.push('/signon?next=/crm/billing'); return }

    const response = await fetch('/api/client/template')
    if (response.status === 401) { router.push('/signon?next=/crm/billing'); return }

    const data = await response.json().catch(() => null)
    if (!response.ok) {
      setError(data?.error || 'Could not load billing information.')
    } else {
      setClient(data?.client ?? null)
    }
    setLoading(false)

    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout') === 'success') {
      setNotice('Checkout received. Your plan updates within a minute of Stripe confirming payment.')
    } else if (params.get('checkout') === 'cancelled') {
      setNotice('Checkout was cancelled. Your current plan is unchanged.')
    }
  }, [router])

  useEffect(() => { load() }, [load])

  async function startCheckout(plan: string) {
    setBusy(plan); setError('')
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, interval }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok || !data?.url) {
        setError(data?.error || 'Could not start checkout.')
        setBusy(null)
        return
      }
      window.location.href = data.url
    } catch {
      setError('Network error. Please try again.')
      setBusy(null)
    }
  }

  async function openPortal() {
    setBusy('portal'); setError('')
    try {
      const response = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await response.json().catch(() => null)
      if (!response.ok || !data?.url) {
        setError(data?.error || 'Could not open the billing portal.')
        setBusy(null)
        return
      }
      window.location.href = data.url
    } catch {
      setError('Network error. Please try again.')
      setBusy(null)
    }
  }

  const currentPlan = getPlan(client?.plan_tier)
  const trialDaysLeft = client?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(client.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: C.cyan, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="relative px-4 pt-22 pb-24 max-w-5xl mx-auto">
        <a href="/crm/settings" style={{ color: C.muted, fontSize: '13px', textDecoration: 'none' }}>
          ← Settings
        </a>
        <h1 className="font-display text-3xl font-bold mt-2" style={{ color: C.text }}>Plan &amp; billing</h1>
        <p style={{ color: C.muted, fontSize: '13px', marginTop: '6px' }}>
          Manage your subscription, payment method, and invoices.
        </p>

        {notice && (
          <div role="status" style={{ ...PANEL, marginTop: '18px', borderColor: 'rgba(0,255,136,0.3)', color: C.green, fontSize: '14px' }}>
            {notice}
          </div>
        )}
        {error && (
          <div role="alert" style={{ ...PANEL, marginTop: '18px', borderColor: 'rgba(255,107,107,0.35)', color: C.red, fontSize: '14px' }}>
            {error}
          </div>
        )}

        <section style={{ ...PANEL, marginTop: '20px' }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p style={{ margin: 0, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted }}>
                Current plan
              </p>
              <h2 className="font-display" style={{ margin: '6px 0 2px', fontSize: '24px', color: C.text }}>
                {currentPlan.name}
              </h2>
              <p style={{ margin: 0, color: C.muted, fontSize: '13px' }}>
                ${Number(client?.monthly_fee ?? currentPlan.monthly).toFixed(0)}/month ·{' '}
                {client?.status === 'trialing'
                  ? `Trial${trialDaysLeft !== null ? ` · ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left` : ` · ${TRIAL_DAYS} days`}`
                  : client?.status ?? 'active'}
                {' · '}
                <span style={{ color: client?.payment_status === 'paid' ? C.green : C.gold }}>
                  {client?.payment_status ?? 'unpaid'}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              {client?.stripe_customer_id && (
                <button
                  onClick={openPortal}
                  disabled={busy !== null}
                  style={{
                    borderRadius: '12px', padding: '10px 16px', fontSize: '13px', fontWeight: 700,
                    background: 'rgba(255,255,255,0.06)', color: C.text, border: `1px solid ${C.border}`, cursor: 'pointer',
                  }}
                >
                  {busy === 'portal' ? 'Opening…' : 'Manage payment method'}
                </button>
              )}
              <a
                href="mailto:support@coaibakersfield.com?subject=Billing%20question"
                style={{
                  borderRadius: '12px', padding: '10px 16px', fontSize: '13px', fontWeight: 700,
                  background: 'rgba(0,229,255,0.1)', color: C.cyan, border: '1px solid rgba(0,229,255,0.3)', textDecoration: 'none',
                }}
              >
                Billing help
              </a>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-2" style={{ marginTop: '24px' }}>
          {(['month', 'year'] as const).map((value) => (
            <button
              key={value}
              onClick={() => setInterval(value)}
              style={{
                borderRadius: '10px', padding: '8px 14px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                background: interval === value ? 'rgba(0,229,255,0.14)' : 'transparent',
                color: interval === value ? C.cyan : C.muted,
                border: `1px solid ${interval === value ? 'rgba(0,229,255,0.4)' : C.border}`,
              }}
            >
              {value === 'month' ? 'Monthly' : 'Annual — 2 months free'}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3" style={{ marginTop: '14px' }}>
          {PLANS.map((plan) => {
            const isCurrent = plan.key === currentPlan.key
            const price = interval === 'month' ? plan.monthly : plan.annual
            return (
              <article
                key={plan.key}
                style={{
                  ...PANEL,
                  borderColor: plan.popular ? 'rgba(0,229,255,0.4)' : C.border,
                  display: 'flex', flexDirection: 'column', gap: '10px',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display" style={{ margin: 0, fontSize: '20px', color: C.text }}>{plan.name}</h3>
                  {isCurrent && (
                    <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: C.green, border: '1px solid rgba(0,255,136,0.35)', borderRadius: '999px', padding: '3px 8px' }}>
                      CURRENT
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, color: C.muted, fontSize: '13px' }}>{plan.tagline}</p>
                <p style={{ margin: 0, color: C.text, fontSize: '26px', fontWeight: 700 }}>
                  ${price.toLocaleString()}<span style={{ fontSize: '13px', color: C.muted, fontWeight: 500 }}>/{interval}</span>
                </p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '7px', flex: 1 }}>
                  {plan.features.slice(0, 4).map((feature) => (
                    <li key={feature} style={{ color: '#C3CCD9', fontSize: '12.5px', lineHeight: 1.5 }}>✓ {feature}</li>
                  ))}
                </ul>
                <button
                  onClick={() => startCheckout(plan.key)}
                  disabled={busy !== null || isCurrent}
                  style={{
                    borderRadius: '12px', padding: '11px 14px', fontSize: '13px', fontWeight: 800, cursor: isCurrent ? 'default' : 'pointer',
                    background: isCurrent ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#00E5FF,#00B8D4)',
                    color: isCurrent ? C.muted : '#050814',
                    border: isCurrent ? `1px solid ${C.border}` : 'none',
                    opacity: busy !== null && busy !== plan.key ? 0.6 : 1,
                  }}
                >
                  {isCurrent ? 'Active plan' : busy === plan.key ? 'Starting…' : `Switch to ${plan.name}`}
                </button>
              </article>
            )
          })}
        </div>

        <p style={{ marginTop: '20px', color: C.muted, fontSize: '12px', lineHeight: 1.6 }}>
          Payments are processed by Stripe. Trade Fortress never stores card numbers. Cancelling stops
          the next renewal; access continues through the end of the paid period. Questions?{' '}
          <a href="mailto:support@coaibakersfield.com" style={{ color: C.cyan }}>support@coaibakersfield.com</a>.
        </p>
      </main>
    </div>
  )
}

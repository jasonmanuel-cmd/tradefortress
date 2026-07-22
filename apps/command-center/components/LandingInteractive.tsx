'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

const C = {
  bg: '#F7F3E8', ink: '#102A43', text: '#243B53', muted: '#52667A', quiet: '#596B7D',
  cyan: '#286B96', blue: '#173F6B', green: '#286E5E', gold: '#946200', panel: '#FFFFFF',
  border: 'rgba(23,63,107,0.16)',
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export function DemoForm() {
  const [phone, setPhone] = useState('')
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setStatus('idle')
    setMessage('')
    try {
      const response = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, consent }),
      })
      const data = await response.json().catch(() => null)
      setMessage(response.ok ? data?.message || 'SMS sent. Check your phone.' : data?.error || 'The text demo is temporarily unavailable. Please try again.')
      setStatus(response.ok ? 'success' : 'error')
    } catch {
      setMessage('The text demo is temporarily unavailable. Please try again.')
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <label htmlFor="demo-phone" className="sr-only">Mobile phone number</label>
      <input id="demo-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="Enter your phone number" required value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full rounded-xl px-5 py-4 text-base" style={{ background: '#F7F9FB', border: `1px solid ${C.border}`, color: C.ink }} />
      <label className="flex items-start gap-3 text-left text-xs leading-relaxed" style={{ color: C.muted }}>
        <input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-cyan-700" />
        I agree to receive one automated Trade Fortress demo text at this number. Consent is not a condition of purchase. Message and data rates may apply. Reply STOP to opt out.
      </label>
      <button type="submit" disabled={loading || status === 'success' || !consent} className="rounded-xl px-5 py-4 text-base font-black disabled:opacity-60" style={{ background: status === 'success' ? C.green : `linear-gradient(135deg,${C.cyan},${C.blue})`, color: C.bg }}>
        {loading ? 'Sending test message...' : status === 'success' ? 'Demo ready' : 'Send me the missed-call text'}
      </button>
      <div aria-live="polite" aria-atomic="true">
        {status === 'success' && <p className="text-sm font-semibold" style={{ color: C.green }}>{message}</p>}
        {status === 'error' && <p className="text-sm font-semibold" style={{ color: '#9B2C2C' }} role="alert">{message}</p>}
      </div>
    </form>
  )
}

export function RevenueCalculator() {
  const [missedCalls, setMissedCalls] = useState(8)
  const [jobValue, setJobValue] = useState(450)
  const [closeRate, setCloseRate] = useState(35)
  const leak = useMemo(() => {
    const weekly = missedCalls * jobValue * (closeRate / 100)
    return { weekly, monthly: weekly * 4.33, yearly: weekly * 52 }
  }, [missedCalls, jobValue, closeRate])

  return (
    <section id="calculator" className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] md:px-16">
      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.22em]" style={{ color: C.gold }}>Lost Revenue Calculator</p>
        <h2 className="font-display text-4xl font-bold leading-tight md:text-5xl" style={{ color: C.ink }}>See what slow callbacks may be costing you.</h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed" style={{ color: C.muted }}>Estimate the value of paid leads that already had buying intent but cooled off before anyone replied.</p>
      </div>
      <div className="rounded-[28px] p-6" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
        <div className="grid gap-5">
          <Slider label="Missed calls per week" value={missedCalls} min={1} max={40} onChange={setMissedCalls} suffix=" calls" />
          <Slider label="Average job value" value={jobValue} min={100} max={2500} step={50} onChange={setJobValue} prefix="$" />
          <Slider label="Realistic close rate" value={closeRate} min={10} max={80} onChange={setCloseRate} suffix="%" />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <CalcCard label="Weekly leak" value={money.format(leak.weekly)} />
          <CalcCard label="Monthly leak" value={money.format(leak.monthly)} featured />
          <CalcCard label="Yearly leak" value={money.format(leak.yearly)} />
        </div>
        <Link href="#demo" className="mt-5 inline-flex w-full justify-center rounded-xl px-5 py-4 text-sm font-black" style={{ background: C.blue, color: '#FFFFFF' }}>Protect those leads</Link>
      </div>
    </section>
  )
}

function Slider({ label, value, min, max, step = 1, prefix = '', suffix = '', onChange }: { label: string; value: number; min: number; max: number; step?: number; prefix?: string; suffix?: string; onChange: (value: number) => void }) {
  return <label className="grid gap-2"><span className="flex items-center justify-between gap-4 text-sm font-bold" style={{ color: C.text }}>{label}<b style={{ color: C.cyan }}>{prefix}{value}{suffix}</b></span><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-cyan-700" /></label>
}

function CalcCard({ label, value, featured }: { label: string; value: string; featured?: boolean }) {
  return <div className="rounded-2xl p-4" style={{ background: featured ? '#FFF3CC' : '#F4F7FA', border: `1px solid ${featured ? 'rgba(148,98,0,0.35)' : C.border}` }}><p className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: C.quiet }}>{label}</p><strong className="mt-2 block font-display text-2xl" style={{ color: featured ? C.gold : C.ink }}>{value}</strong></div>
}

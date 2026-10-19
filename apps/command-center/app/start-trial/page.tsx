import type { Metadata } from 'next'
import { Suspense } from 'react'
import PublicFooter from '@/components/PublicFooter'
import PublicNav from '@/components/PublicNav'
import TrialForm from './TrialForm'
import { PLANS, TRIAL_DAYS } from '@/lib/plans'

export const metadata: Metadata = {
  title: 'Start your free trial',
  description: `Start a ${TRIAL_DAYS}-day Trade Fortress trial. No credit card required. Missed-call text-back, lead pipeline, jobs, and commercial paperwork in one command center.`,
  alternates: { canonical: '/start-trial' },
}

const CHECKLIST = [
  'Your missed-call text-back template, written with you',
  'Your first lead pipeline and statuses',
  'Tracking number provisioning and call forwarding',
  'A 20-minute walkthrough for the office and the crew',
]

export default function StartTrialPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F3E8', color: '#243B53' }}>
      <PublicNav />
      <main id="main-content" className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:px-16 lg:grid-cols-[0.9fr_1.1fr]">
        <section>
          <p
            className="mb-4 inline-flex rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em]"
            style={{ background: '#FFF5D6', color: '#8A5C00', border: '1px solid rgba(215,154,22,0.3)' }}
          >
            {TRIAL_DAYS}-day trial · No credit card
          </p>
          <h1 className="font-display text-4xl font-black leading-tight md:text-5xl" style={{ color: '#102A43' }}>
            Start protecting leads this week.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed" style={{ color: '#52667A' }}>
            Create your account, pick the plan you want to trial, and we will handle the phone
            number, text template, and pipeline setup with you.
          </p>

          <div className="mt-8 rounded-[26px] bg-white p-6 shadow-sm" style={{ border: '1px solid rgba(23,63,107,0.16)' }}>
            <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: '#286E5E' }}>
              Included in every trial
            </p>
            <ul className="mt-4 grid gap-3">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex gap-3 text-sm font-semibold" style={{ color: '#243B53' }}>
                  <span aria-hidden="true" style={{ color: '#286E5E' }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.key}
                className="rounded-2xl bg-white p-4 text-sm shadow-sm"
                style={{ border: '1px solid rgba(23,63,107,0.16)' }}
              >
                <b className="font-display block text-lg" style={{ color: '#102A43' }}>{plan.name}</b>
                <span style={{ color: '#52667A' }}>${plan.monthly}/mo after trial</span>
              </div>
            ))}
          </div>

          <p className="mt-6 max-w-xl text-sm leading-relaxed" style={{ color: '#596B7D' }}>
            Cancel any time before the trial ends and you will not be charged. Messaging consent
            and opt-out rules are covered in our{' '}
            <a href="/sms-policy" className="font-bold underline" style={{ color: '#173F6B' }}>SMS policy</a>.
          </p>
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-xl md:p-9" style={{ border: '1px solid rgba(23,63,107,0.16)' }}>
          <Suspense fallback={<p className="text-sm" style={{ color: '#52667A' }}>Loading signup…</p>}>
            <TrialForm />
          </Suspense>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}

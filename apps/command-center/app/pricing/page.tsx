import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import PublicNav from '@/components/PublicNav'
import { PLANS, TRIAL_DAYS } from '@/lib/plans'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple Trade Fortress pricing for trade-service businesses: missed-call text-back, lead pipeline, field operations, and commercial credential packets. Start a free trial.',
  alternates: { canonical: '/pricing' },
}

const PRICING_FAQ = [
  {
    q: 'Is there a setup fee?',
    a: 'No. Setup, your first SMS template, and the pipeline are included. We charge for the subscription only.',
  },
  {
    q: 'What happens after the free trial?',
    a: `Your plan starts at the price shown on this page unless you cancel before day ${TRIAL_DAYS}. We email you before the trial ends — no surprise charges.`,
  },
  {
    q: 'Do I need a new phone number?',
    a: 'We provision a dedicated tracking number and forward calls to your existing business or mobile line. Your customers keep calling the number you advertise.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Yes. Upgrades take effect immediately and downgrades at the end of the billing period. You can manage everything from the billing screen in your command center.',
  },
  {
    q: 'What does messaging cost?',
    a: 'Carrier messaging fees for the tracking number are included in the plan up to normal small-business volume. We flag unusual volume before it becomes a problem.',
  },
]

const COMPARISON = [
  { feature: 'Missed-call text-back', starter: true, operator: true, team: true },
  { feature: 'Lead pipeline & callbacks', starter: true, operator: true, team: true },
  { feature: 'Customer and job records', starter: true, operator: true, team: true },
  { feature: 'Field operations & permits', starter: false, operator: true, team: true },
  { feature: 'Commercial credential packets', starter: false, operator: true, team: true },
  { feature: 'Proposal export', starter: false, operator: true, team: true },
  { feature: 'Admin orchestrator & health checks', starter: false, operator: false, team: true },
  { feature: 'Multi-location tracking numbers', starter: false, operator: false, team: true },
  { feature: 'Onboarding session', starter: 'Guided', operator: '30 minutes', team: 'Priority' },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F3E8', color: '#243B53' }}>
      <PublicNav />

      <main id="main-content">
        <header className="mx-auto max-w-4xl px-6 pb-10 pt-16 text-center md:px-16">
          <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: '#946200' }}>
            Pricing built around booked jobs
          </p>
          <h1 className="font-display mt-4 text-4xl font-black leading-tight md:text-6xl" style={{ color: '#102A43' }}>
            One system. One predictable monthly price.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed" style={{ color: '#52667A' }}>
            Start with the workflow that is costing you the most money. Every plan includes setup,
            your tracking number, and a real person to talk to.
          </p>
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 text-sm font-bold" style={{ color: '#286E5E' }}>
            <span>✓ {TRIAL_DAYS}-day free trial</span>
            <span>✓ No setup fee</span>
            <span>✓ Cancel any time</span>
          </div>
        </header>

        <section className="mx-auto grid max-w-6xl gap-5 px-6 pb-16 md:px-16 lg:grid-cols-3" aria-label="Plans">
          {PLANS.map((plan) => (
            <article
              key={plan.key}
              className="relative flex flex-col rounded-[28px] bg-white p-7 shadow-sm"
              style={{
                border: plan.popular ? '2px solid #173F6B' : '1px solid rgba(23,63,107,0.16)',
              }}
            >
              {plan.popular && (
                <span
                  className="absolute -top-3 left-7 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em]"
                  style={{ background: '#173F6B', color: '#FFFFFF' }}
                >
                  Most popular
                </span>
              )}
              <h2 className="font-display text-2xl font-black" style={{ color: '#102A43' }}>{plan.name}</h2>
              <p className="mt-1 text-sm font-semibold" style={{ color: '#52667A' }}>{plan.tagline}</p>

              <div className="mt-5 flex items-end gap-1">
                <span className="font-display text-5xl font-black" style={{ color: '#102A43' }}>${plan.monthly}</span>
                <span className="pb-1 text-sm font-bold" style={{ color: '#596B7D' }}>/month</span>
              </div>
              <p className="mt-1 text-xs" style={{ color: '#596B7D' }}>
                or ${plan.annual.toLocaleString()}/year — two months free
              </p>

              <div className="mt-5 grid gap-1.5 text-sm font-semibold" style={{ color: '#243B53' }}>
                <span>{plan.seats}</span>
                <span>{plan.trackingNumbers}</span>
              </div>

              <ul className="mt-5 grid flex-1 gap-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm leading-relaxed" style={{ color: '#374E63' }}>
                    <span aria-hidden="true" style={{ color: '#286E5E' }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <p className="mt-5 text-xs italic" style={{ color: '#596B7D' }}>{plan.limits}</p>

              <Link
                href={`/start-trial?plan=${plan.key}`}
                className="mt-5 block rounded-xl px-5 py-3.5 text-center text-sm font-black"
                style={{
                  background: plan.popular ? '#173F6B' : '#EEF5FA',
                  color: plan.popular ? '#FFFFFF' : '#173F6B',
                  border: plan.popular ? 'none' : '1px solid rgba(23,63,107,0.2)',
                }}
              >
                Start free trial
              </Link>
            </article>
          ))}
        </section>

        <section className="px-6 pb-16 md:px-16" aria-labelledby="comparison-title">
          <div className="mx-auto max-w-6xl overflow-x-auto rounded-[28px] bg-white p-4 shadow-sm md:p-8" style={{ border: '1px solid rgba(23,63,107,0.16)' }}>
            <h2 id="comparison-title" className="font-display px-2 text-2xl font-black" style={{ color: '#102A43' }}>
              Compare plans
            </h2>
            <table className="mt-4 w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr style={{ color: '#596B7D' }}>
                  <th className="px-2 py-3 text-left font-black uppercase tracking-[0.12em]">Feature</th>
                  {PLANS.map((plan) => (
                    <th key={plan.key} className="px-3 py-3 text-center font-black">{plan.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.feature} style={{ borderTop: '1px solid rgba(23,63,107,0.12)' }}>
                    <th scope="row" className="px-2 py-3 text-left font-semibold" style={{ color: '#243B53' }}>
                      {row.feature}
                    </th>
                    {[row.starter, row.operator, row.team].map((value, index) => (
                      <td key={index} className="px-3 py-3 text-center font-bold" style={{ color: '#286E5E' }}>
                        {value === true ? '✓' : value === false ? '—' : value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-4xl px-6 pb-20 md:px-16">
          <h2 className="font-display mb-6 text-center text-3xl font-black" style={{ color: '#102A43' }}>
            Pricing questions
          </h2>
          <div className="grid gap-3">
            {PRICING_FAQ.map((faq) => (
              <details key={faq.q} className="rounded-2xl bg-white p-5" style={{ border: '1px solid rgba(23,63,107,0.16)' }}>
                <summary className="cursor-pointer list-none font-bold" style={{ color: '#243B53' }}>{faq.q}</summary>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: '#52667A' }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="px-6 pb-20 md:px-16">
          <div className="mx-auto grid max-w-5xl gap-6 rounded-[32px] p-8 text-center md:p-12" style={{ background: '#173F6B', color: '#FFFFFF' }}>
            <h2 className="font-display text-3xl font-black md:text-4xl">
              Not sure which plan fits your crew?
            </h2>
            <p className="mx-auto max-w-2xl" style={{ color: '#D7E5EF' }}>
              Tell us how many crews, phone lines, and commercial accounts you run. We will tell you
              which plan makes sense — even if it is the cheaper one.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/start-trial" className="rounded-xl px-7 py-4 font-black" style={{ background: '#F2C45E', color: '#102A43' }}>
                Start free trial
              </Link>
              <a href="mailto:support@coaibakersfield.com?subject=Trade%20Fortress%20plan%20question" className="rounded-xl px-7 py-4 font-black" style={{ border: '1px solid rgba(255,255,255,0.4)', color: '#FFFFFF' }}>
                Ask a question
              </a>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

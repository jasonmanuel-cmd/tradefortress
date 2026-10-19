export type PlanKey = 'starter' | 'operator' | 'team'

export type Plan = {
  key: PlanKey
  name: string
  tagline: string
  monthly: number
  annual: number
  seats: string
  trackingNumbers: string
  popular?: boolean
  features: string[]
  limits: string
}

/**
 * Single source of truth for commercial packaging.
 * Keep Stripe price IDs in environment variables and reference them by plan key.
 */
export const PLANS: Plan[] = [
  {
    key: 'starter',
    name: 'Starter',
    tagline: 'Stop losing missed calls.',
    monthly: 97,
    annual: 970,
    seats: '1 owner login',
    trackingNumbers: '1 tracking number',
    features: [
      'Missed-call text-back within seconds',
      'Lead pipeline: New → Called Back → Quoted → Booked → Lost',
      'Customer and job records',
      'Browser dashboard — no app install',
      'Guided setup and SMS template copy',
      'Email support',
    ],
    limits: 'Best for solo owners and two-person crews.',
  },
  {
    key: 'operator',
    name: 'Operator',
    tagline: 'Run the whole office from one screen.',
    monthly: 197,
    annual: 1970,
    seats: '3 team logins',
    trackingNumbers: '2 tracking numbers',
    popular: true,
    features: [
      'Everything in Starter',
      'Field operations: jobs, permits, paperwork, proposals, materials',
      'Commercial credential packets (W-9, COI, license, bond, safety)',
      'Proposal export and job status tracking',
      'Custom SMS templates and callback reminders',
      '30-minute onboarding session',
    ],
    limits: 'Best for established crews with office staff.',
  },
  {
    key: 'team',
    name: 'Team',
    tagline: 'Every crew, every location, one system.',
    monthly: 397,
    annual: 3970,
    seats: 'Unlimited logins',
    trackingNumbers: 'Up to 5 tracking numbers',
    features: [
      'Everything in Operator',
      'Multi-location and multi-crew setup',
      'Admin orchestrator: account, phone, module, and service health',
      'Payment and account status visibility',
      'Priority support with same-business-day response',
      'Quarterly workflow review',
    ],
    limits: 'Best for multi-crew and commercial-focused companies.',
  },
]

export const PLAN_MAP: Record<PlanKey, Plan> = PLANS.reduce(
  (acc, plan) => ({ ...acc, [plan.key]: plan }),
  {} as Record<PlanKey, Plan>,
)

export const TRIAL_DAYS = Number(process.env.NEXT_PUBLIC_TRIAL_DAYS ?? process.env.TRIAL_DAYS ?? 14)

const LEGACY_PLAN_ALIASES: Record<string, PlanKey> = {
  single: 'starter',
  pro: 'operator',
  agency: 'team',
  starter: 'starter',
  operator: 'operator',
  team: 'team',
}

export function normalizePlanKey(value: string | null | undefined): PlanKey {
  if (!value) return 'operator'
  return LEGACY_PLAN_ALIASES[value.toLowerCase()] ?? 'operator'
}

export function getPlan(value: string | null | undefined): Plan {
  return PLAN_MAP[normalizePlanKey(value)]
}

export function planPriceLabel(plan: Plan, interval: 'month' | 'year' = 'month'): string {
  return interval === 'year' ? `$${plan.annual.toLocaleString()}/yr` : `$${plan.monthly}/mo`
}

export const PLAN_KEYS = PLANS.map((plan) => plan.key)

export const systems = [
  {
    name: 'Lead Engine',
    description: 'Find and qualify local business opportunities, then move accepted leads into the CRM.',
    href: process.env.NEXT_PUBLIC_LEAD_ENGINE_URL,
    env: 'NEXT_PUBLIC_LEAD_ENGINE_URL',
    color: '#00FF88',
  },
  {
    name: 'Grant Command',
    description: 'Optional add-on for equipment, workforce, energy-efficiency, and small-business grant research.',
    href: process.env.NEXT_PUBLIC_GRANT_COMMAND_URL,
    env: 'NEXT_PUBLIC_GRANT_COMMAND_URL',
    color: '#A855F7',
  },
  {
    name: 'Construction Collections',
    description: 'Prepare demand letters, evidence checklists, and filing packets for eligible unpaid construction invoices.',
    href: process.env.NEXT_PUBLIC_SMALLCLAIMS_URL,
    env: 'NEXT_PUBLIC_SMALLCLAIMS_URL',
    color: '#FFD700',
  },
] as const

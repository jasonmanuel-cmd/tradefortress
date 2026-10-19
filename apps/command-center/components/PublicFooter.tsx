import Link from 'next/link'
import { SiteLogo } from './PublicNav'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '/pricing', label: 'Pricing' },
      { href: '/#system', label: 'The system' },
      { href: '/#workflow', label: 'How it works' },
      { href: '/missed-call-text-back', label: 'Missed-call text-back' },
      { href: '/demo', label: 'Demo' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/signon', label: 'Client sign in' },
      { href: '/start-trial', label: 'Start a trial' },
      { href: 'mailto:support@coaibakersfield.com', label: 'Contact support' },
      { href: '/#faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy policy' },
      { href: '/terms', label: 'Terms of service' },
      { href: '/sms-policy', label: 'SMS & consent policy' },
    ],
  },
]

export default function PublicFooter() {
  return (
    <footer
      className="bg-white px-6 py-12 md:px-16"
      style={{ borderTop: '1px solid rgba(23,63,107,0.16)' }}
    >
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <SiteLogo size={38} />
            <div>
              <b className="font-display text-lg" style={{ color: '#102A43' }}>
                Trade Fortress
              </b>
              <p className="text-xs" style={{ color: '#596B7D' }}>
                Built by Chaotically Organized AI
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed" style={{ color: '#52667A' }}>
            One command center for trade-service businesses: missed-call response, leads, jobs,
            paperwork, and commercial readiness.
          </p>
          <p className="mt-4 text-xs leading-relaxed" style={{ color: '#596B7D' }}>
            SMS messaging is consented and opt-out ready. Reply STOP to any message to unsubscribe.
            Message and data rates may apply.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: '#173F6B' }}>
              {column.title}
            </p>
            <ul className="mt-4 grid gap-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link className="text-sm" style={{ color: '#52667A' }} href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: 'rgba(23,63,107,0.16)', color: '#596B7D' }}
      >
        <p>© {new Date().getFullYear()} Chaotically Organized AI. All rights reserved.</p>
        <p>Bakersfield, California · Serving trade businesses nationwide</p>
      </div>
    </footer>
  )
}

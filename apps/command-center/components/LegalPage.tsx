import Link from 'next/link'
import PublicFooter from './PublicFooter'
import PublicNav from './PublicNav'

export default function LegalPage({
  title,
  updated,
  summary,
  children,
}: {
  title: string
  updated: string
  summary?: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F3E8', color: '#243B53' }}>
      <PublicNav />
      <main id="main-content" className="mx-auto max-w-3xl px-6 py-14 md:px-16">
        <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: '#946200' }}>
          Legal
        </p>
        <h1 className="font-display mt-3 text-4xl font-black leading-tight md:text-5xl" style={{ color: '#102A43' }}>
          {title}
        </h1>
        <p className="mt-3 text-sm" style={{ color: '#596B7D' }}>Last updated: {updated}</p>
        {summary && (
          <p
            className="mt-6 rounded-2xl bg-white p-5 text-sm leading-relaxed"
            style={{ border: '1px solid rgba(23,63,107,0.16)', color: '#374E63' }}
          >
            {summary}
          </p>
        )}

        <div className="legal-prose mt-8 grid gap-5 text-sm leading-relaxed" style={{ color: '#374E63' }}>
          {children}
        </div>

        <div className="mt-10 rounded-2xl bg-white p-5 text-sm" style={{ border: '1px solid rgba(23,63,107,0.16)' }}>
          <p style={{ color: '#243B53' }}>
            Questions about this policy? Email{' '}
            <a href="mailto:privacy@coaibakersfield.com" className="font-bold underline" style={{ color: '#173F6B' }}>
              privacy@coaibakersfield.com
            </a>{' '}
            or write to Chaotically Organized AI, Bakersfield, CA.
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs font-bold" style={{ color: '#173F6B' }}>
            <Link href="/privacy" className="underline">Privacy Policy</Link>
            <Link href="/terms" className="underline">Terms of Service</Link>
            <Link href="/sms-policy" className="underline">SMS &amp; Consent Policy</Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}

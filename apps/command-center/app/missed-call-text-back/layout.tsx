import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Missed-Call Text Back for Contractors',
  description: 'Respond to missed callers in seconds, capture the lead, and keep contractor follow-up in one organized pipeline.',
  alternates: { canonical: '/missed-call-text-back' },
  openGraph: { url: '/missed-call-text-back' },
}

export default function MissedCallLayout({ children }: { children: React.ReactNode }) {
  return children
}

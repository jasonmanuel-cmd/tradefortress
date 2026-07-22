import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Trade Fortress and LeadShield handle personal information, messaging data, and service records.',
  alternates: { canonical: '/privacy' },
  openGraph: { url: '/privacy' },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}

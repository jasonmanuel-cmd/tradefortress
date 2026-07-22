import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: {
    default: 'Trade Fortress | Command Center for Trade Businesses',
    template: '%s | Trade Fortress',
  },
  description: 'Protect leads, manage jobs and paperwork, and prepare for commercial work from one command center built for trade-service businesses.',
  metadataBase: new URL('https://leadshield.live'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/trade-fortress-logo.jpg',
  },
  openGraph: {
    title: 'Trade Fortress | Command Center for Trade Businesses',
    description: 'Protect leads, manage jobs and paperwork, and prepare for commercial work from one trade-business command center.',
    url: 'https://leadshield.live',
    siteName: 'Trade Fortress',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Trade Fortress command center for trade businesses' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trade Fortress | Command Center for Trade Businesses',
    description: 'Protect leads, manage jobs and paperwork, and prepare for commercial work in one command center.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: ['trade business software', 'contractor CRM', 'missed call text back', 'contractor lead management', 'job pipeline', 'commercial credential packets'],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F7F3E8',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: '#F7F3E8', minHeight: '100vh' }}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

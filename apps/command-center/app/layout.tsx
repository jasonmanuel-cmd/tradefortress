import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { SITE_NAME, SITE_URL, SUPPORT_EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: {
    default: 'Trade Fortress | Command Center for Trade Businesses',
    template: '%s | Trade Fortress',
  },
  description:
    'Protect leads, manage jobs and paperwork, and prepare for commercial work from one command center built for trade-service businesses.',
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  authors: [{ name: 'Chaotically Organized AI' }],
  creator: 'Chaotically Organized AI',
  publisher: 'Chaotically Organized AI',
  icons: {
    icon: [{ url: '/trade-fortress-logo.jpg', type: 'image/jpeg' }],
    apple: [{ url: '/trade-fortress-logo.jpg' }],
  },
  openGraph: {
    title: 'Trade Fortress | Command Center for Trade Businesses',
    description:
      'Protect leads, manage jobs and paperwork, and prepare for commercial work from one trade-business command center.',
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Trade Fortress command center for trade businesses',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trade Fortress | Command Center for Trade Businesses',
    description:
      'Protect leads, manage jobs and paperwork, and prepare for commercial work in one command center.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  keywords: [
    'trade business software',
    'contractor CRM',
    'missed call text back',
    'contractor lead management',
    'job pipeline',
    'commercial credential packets',
    'field service software',
  ],
  other: {
    'support-email': SUPPORT_EMAIL,
  },
}

export const viewport: Viewport = {
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

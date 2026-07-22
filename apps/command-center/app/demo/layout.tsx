import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Product Demo',
  description: 'Explore a sample Trade Fortress command center for a trade-service business.',
  alternates: { canonical: '/demo' },
  robots: { index: false, follow: false },
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children
}

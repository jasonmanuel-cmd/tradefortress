import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'COAI Grant Command | Sovereign Grant Intelligence',
  description: 'Grant discovery, pipeline tracking, and AI proposal writing for Chaotically Organized AI, LLC',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-void-900 text-white min-h-screen font-sans">
        <Nav />
        <main className="ml-0 md:ml-60 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}

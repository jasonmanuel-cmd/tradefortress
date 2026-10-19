'use client'

import { useEffect } from 'react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error)
  }, [error])

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ background: '#F7F3E8', color: '#102A43' }}
    >
      <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: '#B5473A' }}>
        Something went wrong
      </p>
      <h1 className="font-display mt-4 text-3xl font-black md:text-4xl">
        We hit a snag loading this screen.
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed" style={{ color: '#52667A' }}>
        Nothing was lost. Try the screen again — if it keeps happening, send us the reference below
        and we will look into it.
      </p>
      {error.digest && (
        <p className="mt-3 text-xs" style={{ color: '#596B7D' }}>
          Reference: <code>{error.digest}</code>
        </p>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="rounded-xl px-6 py-3.5 text-sm font-black"
          style={{ background: '#173F6B', color: '#FFFFFF', border: 'none', cursor: 'pointer' }}
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-xl px-6 py-3.5 text-sm font-black"
          style={{ border: '1px solid rgba(23,63,107,0.25)', color: '#173F6B', textDecoration: 'none' }}
        >
          Back to home
        </a>
        <a
          href="mailto:support@coaibakersfield.com"
          className="rounded-xl px-6 py-3.5 text-sm font-black"
          style={{ border: '1px solid rgba(23,63,107,0.25)', color: '#173F6B', textDecoration: 'none' }}
        >
          Contact support
        </a>
      </div>
    </main>
  )
}

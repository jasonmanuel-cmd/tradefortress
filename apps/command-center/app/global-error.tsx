'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#F7F3E8', color: '#102A43', fontFamily: 'system-ui, sans-serif' }}>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B5473A' }}>
            Service error
          </p>
          <h1 style={{ fontSize: '32px', margin: '16px 0 0' }}>Trade Fortress is temporarily unavailable.</h1>
          <p style={{ maxWidth: '440px', lineHeight: 1.6, color: '#52667A' }}>
            We are aware of the problem. Reload in a moment, or email support@coaibakersfield.com if
            you need to reach a person right away.
          </p>
          {error.digest && <p style={{ fontSize: '12px', color: '#596B7D' }}>Reference: {error.digest}</p>}
          <button
            onClick={reset}
            style={{
              marginTop: '24px',
              padding: '14px 24px',
              borderRadius: '12px',
              border: 'none',
              background: '#173F6B',
              color: '#FFFFFF',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Reload the app
          </button>
        </main>
      </body>
    </html>
  )
}

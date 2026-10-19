import Link from 'next/link'

export default function NotFound() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ background: '#F7F3E8', color: '#102A43' }}
    >
      <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: '#946200' }}>
        404 — page not found
      </p>
      <h1 className="font-display mt-4 text-4xl font-black md:text-5xl">
        That page moved to another jobsite.
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed" style={{ color: '#52667A' }}>
        The link may be old or mistyped. Head back to the homepage, check pricing, or sign in to your
        command center.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-xl px-6 py-3.5 text-sm font-black"
          style={{ background: '#173F6B', color: '#FFFFFF' }}
        >
          Back to home
        </Link>
        <Link
          href="/pricing"
          className="rounded-xl px-6 py-3.5 text-sm font-black"
          style={{ border: '1px solid rgba(23,63,107,0.25)', color: '#173F6B' }}
        >
          View pricing
        </Link>
        <Link
          href="/signon"
          className="rounded-xl px-6 py-3.5 text-sm font-black"
          style={{ border: '1px solid rgba(23,63,107,0.25)', color: '#173F6B' }}
        >
          Sign in
        </Link>
      </div>
    </main>
  )
}

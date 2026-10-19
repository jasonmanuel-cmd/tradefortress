import Image from 'next/image'
import Link from 'next/link'

const NAV_LINKS = [
  { href: '/#trades', label: 'Who it serves' },
  { href: '/#system', label: 'System' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/#demo', label: 'Demo' },
]

export function SiteLogo({ size = 44 }: { size?: number }) {
  return (
    <span className="brand-logo-crop" style={{ width: size, height: size }} aria-hidden="true">
      <Image
        src="/trade-fortress-logo.jpg"
        alt=""
        width={size}
        height={Math.round(size * 1.8)}
        priority
      />
    </span>
  )
}

export default function PublicNav() {
  return (
    <nav
      aria-label="Primary navigation"
      className="sticky top-0 z-50 flex items-center justify-between gap-4 px-5 py-4 md:px-16"
      style={{
        background: 'rgba(247,243,232,0.94)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(23,63,107,0.16)',
      }}
    >
      <Link href="/" className="flex items-center gap-3">
        <span className="rounded-2xl bg-white p-1 shadow-sm">
          <SiteLogo size={46} />
        </span>
        <span>
          <b className="font-display block text-xl font-black leading-none" style={{ color: '#102A43' }}>
            Trade Fortress
          </b>
          <span
            className="text-[10px] font-black uppercase tracking-[0.16em]"
            style={{ color: '#946200' }}
          >
            Built for the trades
          </span>
        </span>
      </Link>

      <div className="hidden items-center gap-6 text-sm font-bold lg:flex" style={{ color: '#52667A' }}>
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="hover:opacity-70">
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/signon"
          className="hidden rounded-xl px-4 py-3 text-sm font-black sm:block"
          style={{ color: '#173F6B' }}
        >
          Sign in
        </Link>
        <Link
          href="/start-trial"
          className="rounded-xl px-4 py-3 text-sm font-black"
          style={{ background: '#173F6B', color: '#FFFFFF' }}
        >
          Start free trial
        </Link>
      </div>
    </nav>
  )
}

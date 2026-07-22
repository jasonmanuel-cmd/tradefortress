import Image from 'next/image'
import Link from 'next/link'
import { DemoForm, RevenueCalculator } from '@/components/LandingInteractive'

const C = {
  bg: '#F7F3E8',
  ink: '#102A43',
  text: '#243B53',
  muted: '#52667A',
  quiet: '#596B7D',
  cyan: '#286B96',
  blue: '#173F6B',
  green: '#286E5E',
  gold: '#946200',
  red: '#B5473A',
  panel: '#FFFFFF',
  border: 'rgba(23,63,107,0.16)',
}

const FEATURES = [
  {
    title: 'Instant Missed-Call Save',
    desc: 'A hot buyer gets a text before they start dialing the next contractor.',
    stat: '< 10 sec',
    accent: C.cyan,
  },
  {
    title: 'Lead Command Center',
    desc: 'Every caller moves through New, Called Back, Quoted, Booked, or Lost.',
    stat: '5 stages',
    accent: C.green,
  },
  {
    title: 'Commercial Packet Builder',
    desc: 'Track W-9s, COIs, licenses, bonds, and safety docs for larger buyer accounts.',
    stat: 'Pro',
    accent: C.gold,
  },
]

const PROOF = [
  'Built for contractors, cleaners, junk removal, landscapers, and local service teams.',
  'No app install. Your team works from any browser.',
  'Setup handled for you, including your first template and pipeline.',
  'Designed around paid leads, missed calls, follow-up, and commercial onboarding.',
]

const TRADES = ['Electricians', 'Plumbers', 'Roofers', 'HVAC teams', 'General contractors', 'Landscapers', 'Cleaners', 'Junk removal']

const WORKFLOW = [
  ['01', 'Capture the opportunity', 'Missed calls and new inquiries enter one lead board instead of disappearing into voicemail or a notebook.'],
  ['02', 'Move the work forward', 'Your team can see the callback, quote, job status, notes, and next action without asking around.'],
  ['03', 'Keep the office ready', 'Credentials, field records, payment documents, and optional growth tools stay connected to the operation.'],
]

const MODULES = [
  ['LeadShield', 'Missed-call response, lead capture, callback tracking, and a clean sales pipeline.'],
  ['Field Operations', 'Customers, jobs, proposals, materials, equipment, and daily work records.'],
  ['Credential Packets', 'W-9s, insurance certificates, licenses, bonds, safety documents, and renewal dates.'],
  ['Construction Collections', 'Organize construction payment records, notices, and document workflows without presenting legal advice.'],
  ['Grant Command', 'An optional add-on for organizing business grant research and application work.'],
  ['Client Orchestrator', 'A management view for account, payment, phone, messaging, module, and service health.'],
]

const FAQS = [
  {
    q: 'Why does missed-call speed matter so much?',
    a: 'A missed call is usually an active buyer. If they do not hear back quickly, many will call the next contractor on the list. The LeadShield module answers instantly and keeps the lead organized in Trade Fortress.',
  },
  {
    q: 'Is this just another CRM?',
    a: 'No. Trade Fortress is built around contractor revenue moments: missed calls, follow-up, job status, field operations, and commercial vendor paperwork.',
  },
  {
    q: 'Do customers need to install anything?',
    a: 'No. The dashboard is web-based. Your missed-call response and lead tracking are set up for you.',
  },
  {
    q: 'What is the credential packet builder?',
    a: 'It helps service businesses track insurance, W-9, license, bond, and safety documents needed to win commercial accounts.',
  },
]

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://leadshield.live/#software',
      name: 'Trade Fortress',
      url: 'https://leadshield.live/',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'A command center for trade-service businesses to protect leads, manage jobs and paperwork, and prepare for commercial work.',
      audience: {
        '@type': 'BusinessAudience',
        audienceType: 'Electricians, plumbers, roofers, contractors, cleaners, landscapers, and other trade-service businesses',
      },
      creator: {
        '@type': 'Organization',
        name: 'Chaotically Organized AI',
        url: 'https://leadshield.live/',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://leadshield.live/#faq',
      mainEntity: FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      })),
    },
  ],
}

function ProductPreview() {
  const rows = [
    ['Maria G.', 'Missed call', 'Auto-text sent', C.green],
    ['Ridge HOA', 'Quoted', 'Credential packet open', C.gold],
    ['Bakersfield Plaza', 'Booked', 'Commercial cleanout', C.cyan],
  ]

  return (
    <div className="relative rounded-[30px] p-5 shadow-2xl" style={{ background: '#173F6B', border: '1px solid rgba(255,255,255,0.22)' }}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: '#B9D7EA' }}>Sample Lead Board</p>
          <h2 className="font-display text-2xl font-bold" style={{ color: '#FFFFFF' }}>$8,450 sample pipeline value</h2>
        </div>
        <span className="rounded-full px-3 py-1 text-xs font-black" style={{ background: '#FFF3CC', color: '#7A5100', border: '1px solid rgba(255,255,255,0.3)' }}>
          Demo data
        </span>
      </div>
      <div className="grid gap-3">
        {rows.map(([name, stage, note, color]) => (
          <div key={name} className="grid grid-cols-[1fr_auto] gap-3 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)' }}>
            <div>
              <strong style={{ color: '#FFFFFF' }}>{name}</strong>
              <p className="mt-1 text-sm" style={{ color: '#D7E5EF' }}>{note}</p>
            </div>
            <span className="h-fit rounded-full px-3 py-1 text-xs font-black" style={{ color: '#FFFFFF', background: 'rgba(255,255,255,0.12)', border: `1px solid ${color}88` }}>
              {stage}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          ['New', '11'],
          ['Quoted', '7'],
          ['Booked', '5'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <b className="block font-display text-2xl" style={{ color: '#FFFFFF' }}>{value}</b>
            <span className="text-xs" style={{ color: '#C5D9E7' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function LogoMark({ size = 42 }: { size?: number }) {
  return (
    <span className="brand-logo-crop" style={{ width: size, height: size }}>
      <Image src="/trade-fortress-logo.jpg" alt="Trade Fortress Command Center logo" width={size} height={Math.round(size * 1.8)} priority />
    </span>
  )
}

export default function HomePage() {
  return (
    <div className="trade-home min-h-screen overflow-x-hidden" style={{ backgroundColor: C.bg, color: C.text }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }} />
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <nav aria-label="Primary navigation" className="sticky top-0 z-50 flex items-center justify-between px-5 py-4 md:px-16"
        style={{ background: 'rgba(247,243,232,0.94)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${C.border}` }}>
        <Link href="/" className="flex items-center gap-3">
          <span className="rounded-2xl bg-white p-1 shadow-sm"><LogoMark size={52} /></span>
          <span>
            <b className="font-display block text-2xl font-black leading-none" style={{ color: C.ink }}>Trade Fortress</b>
            <span className="text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: C.gold }}>Built for the trades</span>
          </span>
        </Link>
        <div className="hidden items-center gap-6 text-sm font-bold md:flex" style={{ color: C.muted }}>
          <a href="#trades">Who it serves</a>
          <a href="#system">System</a>
          <a href="#workflow">How it works</a>
          <a href="#demo">Demo</a>
        </div>
        <Link href="/signon" className="rounded-xl px-4 py-3 text-sm font-black" style={{ background: C.blue, color: '#FFFFFF' }}>Client Sign In</Link>
      </nav>

      <main id="main-content" tabIndex={-1}>
      <header className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pb-16 pt-16 md:px-16 lg:grid-cols-[1fr_0.86fr] lg:items-center">
        <div className="absolute inset-0 -z-10 opacity-90" style={{ background: 'radial-gradient(circle at 15% 10%, rgba(77,155,209,0.18), transparent 30%), radial-gradient(circle at 82% 10%, rgba(215,154,22,0.16), transparent 28%)' }} />
        <section>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em]"
            style={{ background: '#FFF5D6', color: '#8A5C00', border: '1px solid rgba(215,154,22,0.3)' }}>
            The office side of the trades—finally organized
          </div>
          <h1 className="font-display text-5xl font-black leading-[0.98] tracking-tight md:text-7xl">
            Run your trade business from one clean command center.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed md:text-xl" style={{ color: C.muted }}>
            Keep missed calls, leads, jobs, field notes, estimates, credentials, and follow-up connected—without forcing your crew to learn a complicated corporate CRM.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="#calculator" className="rounded-xl px-8 py-4 text-center text-base font-black" style={{ background: `linear-gradient(135deg,${C.cyan},${C.blue})`, color: C.bg }}>
              See what missed calls cost
            </Link>
            <Link href="#demo" className="rounded-xl px-8 py-4 text-center text-base font-black" style={{ border: `1px solid ${C.border}`, color: C.ink }}>
              Send test auto-reply
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              ['Fast', 'instant response'],
              ['Simple', 'browser dashboard'],
              ['Revenue', 'built around jobs'],
            ].map(([top, bottom]) => (
              <div key={top} className="rounded-2xl p-4 shadow-sm" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
                <b className="block font-display text-xl" style={{ color: C.gold }}>{top}</b>
                <span className="text-xs" style={{ color: C.quiet }}>{bottom}</span>
              </div>
            ))}
          </div>
        </section>
        <div className="relative">
          <div className="time-saved-card mb-4 ml-auto flex w-fit items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lg" aria-label="Designed to save administrative time">
            <span className="time-dial" aria-hidden="true" />
            <span>
              <b className="block font-display text-lg leading-none" style={{ color: C.ink }}>Time back in your day</b>
              <span className="text-xs font-bold" style={{ color: C.muted }}>Fewer handoffs to chase</span>
            </span>
          </div>
          <ProductPreview />
        </div>
      </header>

      <section id="trades" className="border-y px-6 py-10 md:px-16" style={{ background: '#FFFFFF', borderColor: C.border }}>
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-xs font-black uppercase tracking-[0.2em]" style={{ color: C.blue }}>Built around real service work</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {TRADES.map((trade) => <span key={trade} className="rounded-full px-4 py-2 text-sm font-bold" style={{ background: '#EEF5FA', color: C.blue, border: `1px solid ${C.border}` }}>{trade}</span>)}
          </div>
        </div>
      </section>

      <RevenueCalculator />

      <section id="system" className="mx-auto max-w-7xl px-6 py-20 md:px-16">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em]" style={{ color: C.green }}>The Revenue System</p>
          <h2 className="font-display text-4xl font-bold md:text-5xl" style={{ color: C.ink }}>
            Three tools that protect the whole customer path.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="rounded-[28px] p-7" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
              <span className="mb-8 inline-flex rounded-full px-3 py-1 text-xs font-black" style={{ color: feature.accent, background: `${feature.accent}14`, border: `1px solid ${feature.accent}33` }}>
                {feature.stat}
              </span>
              <h3 className="font-display text-2xl font-bold" style={{ color: C.ink }}>{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: C.muted }}>{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-16">
        <div className="grid grid-cols-1 gap-6 rounded-[32px] p-7 md:grid-cols-[0.8fr_1.2fr] md:p-10"
          style={{ background: 'linear-gradient(135deg, #FFF6DA, #EDF6FB)', border: `1px solid ${C.border}` }}>
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.22em]" style={{ color: C.gold }}>What owners get</p>
            <h2 className="font-display text-3xl font-bold" style={{ color: C.ink }}>A practical system your office can actually use.</h2>
          </div>
          <div className="grid gap-3">
            {PROOF.map((item) => (
              <div key={item} className="rounded-2xl bg-white p-4 text-sm font-semibold shadow-sm" style={{ border: `1px solid ${C.border}`, color: C.text }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="px-6 py-20 md:px-16" style={{ background: '#EAF2F7' }}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.22em]" style={{ color: C.gold }}>How it works</p>
            <h2 className="font-display text-4xl font-bold md:text-5xl" style={{ color: C.ink }}>From the first call to the finished paperwork.</h2>
            <p className="mt-4 text-lg leading-relaxed" style={{ color: C.muted }}>Trade Fortress follows the way work already moves through your business. It gives the office and the field the same clear next step.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {WORKFLOW.map(([number, title, body]) => (
              <article key={number} className="rounded-[28px] bg-white p-7 shadow-sm" style={{ border: `1px solid ${C.border}` }}>
                <span className="font-display text-4xl font-black" style={{ color: C.gold }}>{number}</span>
                <h3 className="mt-6 font-display text-2xl font-black" style={{ color: C.ink }}>{title}</h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: C.muted }}>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-16">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.22em]" style={{ color: C.green }}>One connected system</p>
            <h2 className="font-display text-4xl font-bold md:text-5xl" style={{ color: C.ink }}>Use what your company needs. Keep it under one roof.</h2>
            <p className="mt-5 text-base leading-relaxed" style={{ color: C.muted }}>Start with the daily workflow that hurts most. Add the other modules when the business is ready—without building another disconnected stack.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {MODULES.map(([title, body]) => (
              <article key={title} className="rounded-2xl bg-white p-6 shadow-sm" style={{ borderLeft: `5px solid ${C.gold}`, borderTop: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
                <h3 className="font-display text-xl font-black" style={{ color: C.ink }}>{title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: C.muted }}>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 md:px-16">
        <div className="grid gap-8 rounded-[32px] p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12" style={{ background: C.blue, color: '#FFFFFF' }}>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: '#F5C451' }}>Setup without the software headache</p>
            <h2 className="mt-3 font-display text-3xl font-black md:text-4xl">We map the workflow, connect the tools, and train the team.</h2>
            <p className="mt-4 max-w-3xl leading-relaxed" style={{ color: '#D7E5EF' }}>Your setup starts with how calls, estimates, jobs, documents, and follow-up work today. The system is configured around that real process, then tested with sample records before customer information goes live.</p>
          </div>
          <Link href="#demo" className="rounded-xl px-7 py-4 text-center font-black" style={{ background: '#F2C45E', color: C.ink }}>See the working demo</Link>
        </div>
      </section>

      <section id="demo" className="mx-auto max-w-5xl px-6 py-20 text-center md:px-16">
        <div className="rounded-[34px] bg-white p-8 shadow-lg md:p-14" style={{ border: `1px solid ${C.border}` }}>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em]" style={{ color: C.green }}>Instant Demo</p>
          <h2 className="font-display text-4xl font-bold md:text-5xl" style={{ color: C.ink }}>
            Feel what your customer feels when the LeadShield module answers.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed" style={{ color: C.muted }}>
            Enter your phone number and get the same kind of missed-call response a buyer would receive while you are on a job.
          </p>
          <div className="mx-auto mt-8 max-w-md">
            <DemoForm />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 text-center md:px-16">
        <h2 className="font-display text-4xl font-black leading-tight md:text-5xl" style={{ color: C.ink }}>
          A missed call is not a voicemail. It is a buyer deciding who gets paid.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl" style={{ color: C.muted }}>
          Trade Fortress keeps the lead warm, keeps your pipeline clean, and helps you move from one-off jobs to commercial accounts.
        </p>
        <Link href="#calculator" className="mt-8 inline-flex rounded-xl px-8 py-4 text-base font-black" style={{ background: C.ink, color: C.bg }}>
          Check my lost revenue
        </Link>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 md:px-16" aria-labelledby="one-clean-screen-title">
        <div className="grid items-center gap-8 rounded-[34px] p-6 md:grid-cols-[.8fr_1.2fr] md:p-10" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.22em]" style={{ color: C.gold }}>Trade Fortress soundtrack</p>
            <h2 id="one-clean-screen-title" className="font-display text-3xl font-bold" style={{ color: C.ink }}>One Clean Screen</h2>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: C.muted }}>An original song about replacing scattered tools and missed details with one clean operating view.</p>
          </div>
          <video className="aspect-square w-full rounded-2xl" controls playsInline preload="metadata" aria-label="Play One Clean Screen by Jason Manuel">
            <source src="/media/one-clean-screen.mp4" type="video/mp4" />
            Your browser does not support HTML video.
          </video>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-4xl px-6 py-16 md:px-16">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em]" style={{ color: C.gold }}>FAQ</p>
          <h2 className="font-display text-3xl font-bold" style={{ color: C.ink }}>Common buyer questions</h2>
        </div>
        <div className="grid gap-3">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group rounded-2xl p-5" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
              <summary className="cursor-pointer list-none font-bold" style={{ color: C.text }}>{faq.q}</summary>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: C.muted }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
      </main>

      <footer className="bg-white px-6 py-10 md:px-16" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <LogoMark size={38} />
            <div>
              <b className="font-display text-lg" style={{ color: C.ink }}>Trade Fortress</b>
              <p className="text-xs" style={{ color: C.quiet }}>Built by Chaotically Organized AI</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-5 text-sm" style={{ color: C.muted }}>
            <Link href="/privacy">Privacy</Link>
            <Link href="/signon">Sign In</Link>
            <Link href="/crm">CRM</Link>
            <Link href="/crm/credentials">Credentials</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

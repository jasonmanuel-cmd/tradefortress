import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'SMS & Consent Policy',
  description:
    'How Trade Fortress handles text messaging consent, opt-outs, message frequency, and carrier requirements for its missed-call text-back program.',
  alternates: { canonical: '/sms-policy' },
}

const EFFECTIVE = 'October 19, 2026'

export default function SmsPolicyPage() {
  return (
    <LegalPage
      title="SMS & Consent Policy"
      updated={EFFECTIVE}
      summary="Trade Fortress sends automated replies to people who call a partner business and do not reach a person. This page explains the program, how consent works, and how to stop messages."
    >
      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>Program details</h2>
        <dl className="mt-3 grid gap-2">
          <div><dt className="font-bold" style={{ color: '#243B53' }}>Program name</dt><dd>Trade Fortress Missed-Call Text-Back</dd></div>
          <div><dt className="font-bold" style={{ color: '#243B53' }}>Operator</dt><dd>Chaotically Organized AI, Bakersfield, California</dd></div>
          <div><dt className="font-bold" style={{ color: '#243B53' }}>Message types</dt><dd>One automatic reply after a missed call, optional follow-up about the appointment or estimate, and account notifications for the business owner.</dd></div>
          <div><dt className="font-bold" style={{ color: '#243B53' }}>Message frequency</dt><dd>Replies are triggered by your call. Typically one message per missed call, with a maximum of four messages in a 30-day period for the same conversation.</dd></div>
          <div><dt className="font-bold" style={{ color: '#243B53' }}>Cost</dt><dd>Trade Fortress does not charge the recipient. Message and data rates from your mobile carrier may apply.</dd></div>
          <div><dt className="font-bold" style={{ color: '#243B53' }}>Opt out</dt><dd>Reply <strong>STOP</strong> to any message. Reply <strong>HELP</strong> for help.</dd></div>
          <div><dt className="font-bold" style={{ color: '#243B53' }}>Support</dt><dd>support@coaibakersfield.com</dd></div>
        </dl>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>How consent works</h2>
        <p className="mt-2">
          A message is only sent after the recipient places a call to a business phone number
          connected to Trade Fortress and the call is not answered. Placing a call to that number and
          not reaching a person is treated as an inquiry, and the automated reply is a direct response
          to that inquiry. We do not buy, rent, or import phone lists, and we do not send marketing
          broadcasts through this program.
        </p>
        <p className="mt-2">
          When a business uses the public demo on our website, the visitor enters their own mobile
          number and checks an explicit consent box before a single demonstration message is sent. The
          consent box is never pre-checked, consent is not a condition of purchase, and the demo is
          rate limited per number and per network address.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>Opt-out and help</h2>
        <p className="mt-2">
          Reply <strong>STOP</strong> to any message to stop future messages from that business. You
          will receive one confirmation message and no further messages. Reply <strong>START</strong>{' '}
          to resume. Reply <strong>HELP</strong> to receive support information. Opt-outs are honored
          immediately and are not overridden by the business.
        </p>
        <p className="mt-2">
          If you believe you received a message in error, reply STOP and contact
          support@coaibakersfield.com with the number that messaged you.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>Example messages</h2>
        <div className="mt-3 grid gap-3">
          {[
            'Hi, this is Northgate Electric. Sorry we missed your call — what can we help you with today? Reply STOP to opt out.',
            'Trade Fortress demo: This is a one-time example of the missed-call reply. No subscription was created. Reply STOP to opt out.',
            'Thanks! We have your request and will call you back shortly. Reply STOP to opt out.',
          ].map((message) => (
            <p key={message} className="rounded-2xl bg-white p-4 text-sm" style={{ border: '1px solid rgba(23,63,107,0.16)' }}>
              {message}
            </p>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>What we never do</h2>
        <ul className="mt-2 grid gap-1.5 pl-5" style={{ listStyleType: 'disc' }}>
          <li>Sell, rent, or share mobile numbers or messaging consent with third parties for their marketing.</li>
          <li>Send messages from purchased lists, lead scrapers, or affiliate traffic.</li>
          <li>Send messages without an opt-out path.</li>
          <li>Send messages containing unlawful, deceptive, or high-risk content.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>Carrier disclaimer</h2>
        <p className="mt-2">
          Mobile carriers are not liable for delayed or undelivered messages. Delivery depends on
          carrier availability and the recipient&apos;s device and plan. Message frequency varies with
          call volume.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>Business responsibilities</h2>
        <p className="mt-2">
          Businesses using Trade Fortress must keep their SMS templates accurate and must not use the
          service for marketing without documented consent. Businesses must honor opt-outs, maintain
          their own do-not-call records, and comply with the TCPA and applicable state messaging laws.
        </p>
      </section>
    </LegalPage>
  )
}

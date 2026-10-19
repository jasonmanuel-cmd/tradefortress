import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Trade Fortress collects, uses, stores, and protects business and lead data, including the choices available to account holders and their customers.',
  alternates: { canonical: '/privacy' },
}

const EFFECTIVE = 'October 19, 2026'

const RETENTION = [
  ['Lead records (calls, contact info, pipeline status)', 'Supabase (US)', 'Until the account is closed, then purged within 90 days'],
  ['Account settings and SMS templates', 'Supabase (US)', 'Until changed or the account is closed'],
  ['SMS delivery logs', 'Supabase (US)', 'Stored with the related lead record'],
  ['Billing records', 'Stripe + Supabase', 'Seven years where required for tax and accounting'],
  ['Web and performance logs', 'Vercel', 'Per Vercel retention settings'],
  ['Call and message routing metadata', 'Telnyx', 'Per Telnyx retention policy'],
]

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated={EFFECTIVE}
      summary="We do not sell personal information, we do not share it for advertising, and each business account is isolated from every other account. This page explains exactly what we collect and why."
    >
      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>1. Who we are</h2>
        <p className="mt-2">
          Trade Fortress is a product of Chaotically Organized AI, a California business based in
          Bakersfield. We provide a web-based command center for trade-service businesses, including
          missed-call text-back, lead tracking, job records, and document organization. This policy
          covers our website, the command center, and the messaging program.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>2. Information we collect</h2>
        <ul className="mt-2 grid gap-2 pl-5" style={{ listStyleType: 'disc' }}>
          <li>
            <strong>Account information:</strong> business name, owner name, email address, password
            (hashed by our auth provider), phone numbers, trade category, and plan.
          </li>
          <li>
            <strong>Lead and call data:</strong> the caller&apos;s phone number, the tracking number
            they called, call time, whether the call was missed, call status, notes your team adds,
            and pipeline status.
          </li>
          <li>
            <strong>Message content:</strong> the SMS templates you configure and the delivery status
            of messages sent to callers. We do not record call audio.
          </li>
          <li>
            <strong>Job and document records:</strong> customers, jobs, permits, proposals, material
            lists, and credential details you enter.
          </li>
          <li>
            <strong>Billing data:</strong> plan, subscription status, and payment history. Card details
            are handled by Stripe and never touch our servers.
          </li>
          <li>
            <strong>Technical data:</strong> IP address used for rate limiting and security, browser
            type, and aggregated, anonymized page analytics.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>3. How we use information</h2>
        <ul className="mt-2 grid gap-2 pl-5" style={{ listStyleType: 'disc' }}>
          <li>Detect a missed call, log the lead, and send the text reply your business configured.</li>
          <li>Display leads, jobs, and documents in your command center and isolate your account.</li>
          <li>Authenticate users, prevent abuse, and enforce rate limits.</li>
          <li>Process subscription payments and provide support.</li>
          <li>Send service notices such as trial reminders, billing receipts, and security alerts.</li>
          <li>Improve reliability and understand aggregate product usage.</li>
        </ul>
        <p className="mt-2">
          We do not use lead data to advertise to your customers, and we do not send marketing emails
          to people who contacted your business.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>4. Legal bases and consent</h2>
        <p className="mt-2">
          Where required, we process data to perform our contract with your business, to comply with
          law, to protect legitimate interests in operating a secure service, and with consent where
          consent is the appropriate basis. Text message consent is described in the{' '}
          <a href="/sms-policy" className="font-bold underline" style={{ color: '#173F6B' }}>SMS &amp; Consent Policy</a>.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>5. Sharing and service providers</h2>
        <p className="mt-2">
          We share data only with providers that help us operate the service, and only as needed:
        </p>
        <ul className="mt-2 grid gap-2 pl-5" style={{ listStyleType: 'disc' }}>
          <li><strong>Supabase</strong> — encrypted Postgres database and authentication (hosted in the United States).</li>
          <li><strong>Telnyx</strong> — call routing and SMS delivery.</li>
          <li><strong>Vercel</strong> — application hosting and anonymous performance analytics.</li>
          <li><strong>Stripe</strong> — subscription billing and payment processing.</li>
          <li><strong>Resend</strong> — transactional email delivery.</li>
          <li><strong>Legal requirements</strong> — we may disclose information when required by law, subpoena, or a valid governmental request.</li>
        </ul>
        <p className="mt-2">
          We do not sell personal information, we do not share it for cross-context behavioral
          advertising, and we do not share mobile numbers or messaging consent with third parties or
          affiliates for their own marketing.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>6. Security</h2>
        <p className="mt-2">
          Data is encrypted in transit with TLS. Database access is protected by row-level security,
          and server routes use a service key that never reaches the browser. Passwords are hashed by
          our auth provider. Access to production systems is limited to authorized operators. No
          system is perfectly secure, so we also rely on short-lived sessions, rate limits, and
          monitoring.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>7. Retention and deletion</h2>
        <p className="mt-2">We keep data only as long as it is needed for the purposes above.</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr style={{ color: '#596B7D' }}>
                <th className="py-2 pr-3 text-left font-bold">Data type</th>
                <th className="py-2 pr-3 text-left font-bold">Stored with</th>
                <th className="py-2 text-left font-bold">Retention</th>
              </tr>
            </thead>
            <tbody>
              {RETENTION.map(([type, where, period]) => (
                <tr key={type} style={{ borderTop: '1px solid rgba(23,63,107,0.12)' }}>
                  <td className="py-2 pr-3">{type}</td>
                  <td className="py-2 pr-3">{where}</td>
                  <td className="py-2">{period}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          Account holders can request export or deletion at any time by emailing
          privacy@coaibakersfield.com. We respond within 30 days.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>8. Your choices and rights</h2>
        <ul className="mt-2 grid gap-2 pl-5" style={{ listStyleType: 'disc' }}>
          <li>Access a copy of the account data we hold.</li>
          <li>Correct inaccurate business or contact information.</li>
          <li>Delete the account and its lead records.</li>
          <li>Export leads and job records in a portable format.</li>
          <li>Opt out of non-essential email; billing and security notices continue while the account is active.</li>
          <li>Opt out of text messages at any time by replying STOP.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>9. California privacy rights</h2>
        <p className="mt-2">
          California residents may request to know, delete, correct, or obtain a portable copy of
          personal information, and may designate an authorized agent. We do not sell or share personal
          information as those terms are defined by the CCPA/CPRA, and we will not discriminate against
          anyone for exercising a privacy right. Email privacy@coaibakersfield.com with “CCPA Request”
          in the subject line.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>10. Cookies and analytics</h2>
        <p className="mt-2">
          We use strictly necessary cookies for authentication and session security. Analytics are
          aggregated and anonymized; we do not run advertising pixels or sell audience data. You can
          block cookies in your browser, but the command center requires them to sign you in.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>11. Children</h2>
        <p className="mt-2">
          The service is intended for businesses and is not directed to anyone under 18. We do not
          knowingly collect information from children.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>12. Changes and contact</h2>
        <p className="mt-2">
          If we make material changes, we will update the effective date and notify account owners by
          email. Questions can be sent to privacy@coaibakersfield.com or by mail to Chaotically
          Organized AI, Bakersfield, CA. We respond to privacy inquiries within five business days.
        </p>
      </section>
    </LegalPage>
  )
}

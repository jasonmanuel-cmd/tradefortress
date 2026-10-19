import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern use of the Trade Fortress command center by trade-service businesses.',
  alternates: { canonical: '/terms' },
}

const EFFECTIVE = 'October 19, 2026'

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated={EFFECTIVE}
      summary="These terms form the agreement between your business and Chaotically Organized AI for use of Trade Fortress. By creating an account or using the service, you accept them."
    >
      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>1. Who these terms cover</h2>
        <p className="mt-2">
          “Trade Fortress,” “we,” “us,” and “our” refer to Chaotically Organized AI, a California
          business. “Customer,” “you,” and “your” refer to the business that creates an account.
          You confirm that you are at least 18 years old and authorized to bind that business.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>2. The service</h2>
        <p className="mt-2">
          Trade Fortress is a web-based command center for trade-service businesses. Depending on
          your plan it can include missed-call text-back, lead and pipeline tracking, customer and
          job records, field paperwork, commercial credential tracking, and account health views.
        </p>
        <p className="mt-2">
          Some features depend on third-party providers (for example telephony, messaging, hosting,
          and payment processing). We are not responsible for outages or policy decisions of those
          providers, but we will make reasonable efforts to route around them.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>3. Accounts and access</h2>
        <p className="mt-2">
          You are responsible for keeping login credentials confidential, for the activity of users
          you invite, and for keeping your business and contact information accurate. Notify us
          promptly at support@coaibakersfield.com if you believe an account has been compromised.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>4. Free trials</h2>
        <p className="mt-2">
          New accounts may receive a 14-day free trial. No payment method is required to begin a
          trial. If you do not choose a paid plan before the trial ends, access to paid features
          pauses; your data is retained so you can resume later. We may limit trial eligibility to
          prevent abuse.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>5. Plans, billing, and refunds</h2>
        <p className="mt-2">
          Subscription fees are stated on the pricing page and are billed in advance, monthly or
          annually, through our payment processor. Taxes may apply. Fees are non-refundable except
          where required by law or where we cancel a service you have paid for and cannot provide.
        </p>
        <p className="mt-2">
          Plans renew automatically until cancelled. You can cancel from the billing screen or by
          emailing support. Cancellation stops the next renewal; it does not retroactively refund the
          current period.
        </p>
        <p className="mt-2">
          If a payment fails, we may mark the account past due, retry the charge, and suspend paid
          features after reasonable notice. We may change prices with at least 30 days&apos; notice
          before your next renewal.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>6. Messaging and consent</h2>
        <p className="mt-2">
          Automated text messages are sent only to callers who contact your business number, and
          messaging is governed by our SMS &amp; Consent Policy. You agree to use the service in
          compliance with the TCPA, CTIA guidelines, carrier requirements, and applicable state law.
          You may not use Trade Fortress to send marketing messages to people who have not consented,
          to send unlawful content, or to evade opt-out requests.
        </p>
        <p className="mt-2">
          Message and data rates may apply to recipients. Recipients can reply STOP to opt out and
          HELP for help. You are responsible for the content of templates you configure.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>7. Acceptable use</h2>
        <p className="mt-2">You agree not to:</p>
        <ul className="mt-2 grid gap-1.5 pl-5" style={{ listStyleType: 'disc' }}>
          <li>Use the service to break the law, infringe rights, or harass any person.</li>
          <li>Send unsolicited bulk messages or scrape or import contact lists without consent.</li>
          <li>Attempt to access another customer&apos;s data, probe the service, or bypass rate limits.</li>
          <li>Resell, sublicense, or white-label the service without a written agreement.</li>
          <li>Upload malware or content that would damage the service or other customers.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>8. Customer data</h2>
        <p className="mt-2">
          You own the business records you put into Trade Fortress, including lead and customer
          information. You grant us a limited license to host, process, and transmit that data to
          operate the service. Our handling of personal information is described in the Privacy
          Policy.
        </p>
        <p className="mt-2">
          You are responsible for having a lawful basis to contact the leads in your account and for
          responding to data-subject requests from your own customers.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>9. Not legal, financial, or tax advice</h2>
        <p className="mt-2">
          Trade Fortress includes tools that help organize documents such as W-9s, certificates of
          insurance, licenses, bonds, proposals, and payment records. These tools do not provide legal,
          insurance, accounting, or tax advice, and using them does not create an attorney-client
          relationship. You are responsible for the accuracy and legal sufficiency of documents you
          send to your customers.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>10. Availability and support</h2>
        <p className="mt-2">
          We work to keep the service available and to respond to support requests during normal
          business hours. Unless a separate written agreement says otherwise, the service is provided
          without a guaranteed uptime commitment. Scheduled maintenance is announced when practical.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>11. Disclaimers</h2>
        <p className="mt-2">
          The service is provided “as is” and “as available.” To the maximum extent permitted by law,
          we disclaim implied warranties of merchantability, fitness for a particular purpose, and
          non-infringement. We do not guarantee any specific number of leads, booked jobs, or revenue.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>12. Limitation of liability</h2>
        <p className="mt-2">
          To the maximum extent permitted by law, neither party is liable for indirect, incidental,
          special, consequential, or punitive damages, or lost profits. Our total liability for claims
          related to the service is limited to the amount you paid us in the twelve months before the
          event giving rise to the claim.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>13. Termination</h2>
        <p className="mt-2">
          You may cancel at any time. We may suspend or terminate access if fees remain unpaid, if
          you materially breach these terms, or if required by law or a provider. On termination we
          retain data for up to 90 days so an account can be restored, then delete it unless a longer
          retention period is required.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-black" style={{ color: '#102A43' }}>14. Changes and governing law</h2>
        <p className="mt-2">
          We may update these terms; material changes will be posted on this page with a new effective
          date and, where appropriate, emailed to the account owner. These terms are governed by the
          laws of the State of California, with venue in Kern County, California.
        </p>
      </section>
    </LegalPage>
  )
}

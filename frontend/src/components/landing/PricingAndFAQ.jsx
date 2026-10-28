import { Link } from 'react-router-dom'
import { Check, Clock3 } from 'lucide-react'

const FAQS = [
  {
    question: 'Does the valuation use market comparables?',
    answer: 'No. The current engine uses your submitted figures and documented, illustrative assumptions. It does not retrieve or validate comparable-company or transaction data.',
  },
  {
    question: 'Do I need an AI API key?',
    answer: 'No. The valuation is calculated by the deterministic backend engine. AI is not required for the core calculation.',
  },
  {
    question: 'Is this a formal business appraisal?',
    answer: 'No. Results are model-based estimates for discussion and planning. They are not certified valuations, investment advice, or a guarantee of future value.',
  },
  {
    question: 'How are submitted valuations stored?',
    answer: 'A valuation is saved to the configured database and associated with the signed-in account. Private result, history, and PDF endpoints verify ownership. Older records created before accounts existed remain unassigned and are not shown in report history.',
  },
  {
    question: 'Are forecasts, scenario comparisons, and paid plans live?',
    answer: 'The financial planner and runway calculator offer editable 1–36 month estimates, but their inputs remain in the browser session. Saved-scenario comparison, roadmap persistence, collaboration, billing, and paid plans are not available. Signed-in users can view their saved valuation report history and download PDFs.',
  },
]

const PRICING_PLANS = [
  {
    name: 'Free',
    target: 'Founders exploring a model-based estimate',
    features: [
      'Valuation form and method breakdown',
      'Financial planner and runway calculator',
      'Private valuation report history and PDF downloads',
      'Single-round fundraising and cap-table model',
      'Deterministic roadmap builder with session-only drafts',
      'Browser-saved readiness checklist',
    ],
    limits: 'No usage limit is configured in this build.',
    status: 'Available now · no checkout',
    available: true,
  },
  {
    name: 'Pro',
    target: 'Founders who need saved scenarios and exports',
    features: ['Multi-scenario analysis', 'Server-saved plans', 'Advanced planning tools'],
    limits: 'Not configured.',
    status: 'Planned · not available',
    available: false,
  },
  {
    name: 'Advisor',
    target: 'Advisors working with multiple client companies',
    features: ['Client workspaces', 'Shared reports', 'Advisor collaboration'],
    limits: 'Not configured.',
    status: 'Planned · not available',
    available: false,
  },
  {
    name: 'Business',
    target: 'Teams coordinating company planning',
    features: ['Team access and roles', 'Shared planning', 'Workspace controls'],
    limits: 'Not configured.',
    status: 'Planned · not available',
    available: false,
  },
]

export function PricingSection() {
  return (
      <section id="pricing" className="sv-pricing sv-section">
        <div className="sv-container sv-pricing__layout">
          <div className="sv-section-heading sv-pricing__intro">
            <p className="sv-eyebrow"><span /> Access & pricing</p>
            <h2>Clear access. No fictional checkout.</h2>
            <p>Only the current free-preview tools are available. No payment processing, prices, or paid entitlements are configured.</p>
          </div>
          <div className="sv-plan-grid">
            {PRICING_PLANS.map((plan) => (
              <article className={`sv-plan-card${plan.available ? ' sv-plan-card--available' : ''}`} key={plan.name}>
                <header>
                  <div><h3>{plan.name}</h3><span className={plan.available ? 'sv-plan__state sv-plan__state--live' : 'sv-plan__state'}>{plan.status}</span></div>
                  {!plan.available && <Clock3 size={18} aria-hidden="true" />}
                </header>
                <p className="sv-plan-card__target">{plan.target}</p>
                <ul>
                  {plan.features.map((feature) => <li key={feature}><Check size={14} aria-hidden="true" />{feature}</li>)}
                </ul>
                <p className="sv-plan-card__limits"><strong>Usage:</strong> {plan.limits}</p>
                {plan.available
                  ? <Link className="sv-plan-card__action" to="/valuation">Open valuation</Link>
                  : <button className="sv-plan-card__action" type="button" disabled aria-disabled="true">Coming soon</button>}
              </article>
            ))}
          </div>
        </div>
      </section>
  )
}

export function FAQSection() {
  return (
      <section id="faq" className="sv-faq sv-section">
        <div className="sv-container sv-faq__layout">
          <div className="sv-section-heading">
            <p className="sv-eyebrow"><span /> Good to know</p>
            <h2>Clear answers, including the limits.</h2>
            <p>Understand how estimates work and what to consider before sharing company information.</p>
          </div>
          <div className="sv-faq__items">
            {FAQS.map(({ question, answer }) => (
              <details key={question}>
                <summary>{question}<span aria-hidden="true">+</span></summary>
                <p>{answer}</p>
              </details>
            ))}
            <div className="sv-faq__security" id="security">
              <span>Privacy & security</span>
              <p>
                Authentication uses revocable database-backed sessions and owner-scoped valuation and report endpoints.
                Production HTTPS, database access, backups, retention, recovery, and deployment monitoring still depend
                on operator configuration. Review the deployment checklist before using sensitive financial records.
              </p>
            </div>
          </div>
        </div>
      </section>
  )
}

export default function PricingAndFAQ() {
  return <><PricingSection /><FAQSection /></>
}

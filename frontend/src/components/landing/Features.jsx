import { Activity, Calculator, CircleAlert, Gauge, LockKeyhole, Scale } from 'lucide-react'

const AVAILABLE = [
  {
    icon: Calculator,
    title: 'Transparent valuation',
    description: 'Revenue multiple, growth-adjusted, pre-revenue, and market-ceiling methods—with each applicable method shown.',
    number: '01',
  },
  {
    icon: Activity,
    title: 'Financial health',
    description: 'A score built from the submitted margin, burn efficiency, runway, revenue, and funding inputs.',
    number: '02',
  },
  {
    icon: Gauge,
    title: 'Growth & readiness',
    description: 'Separate growth and investor-readiness indicators, with the inputs that contribute to each.',
    number: '03',
  },
  {
    icon: CircleAlert,
    title: 'Risks in context',
    description: 'Rule-based flags surface runway pressure, unit-economics concerns, churn, and other supported signals.',
    number: '04',
  },
]

export default function Features() {
  return (
    <section id="product" className="sv-product sv-section">
      <div className="sv-container">
        <div className="sv-section-heading">
          <p className="sv-eyebrow"><span /> The product</p>
          <h2>Financial clarity, grounded in your inputs.</h2>
          <p>One focused tool for understanding the signals behind an early-stage business estimate.</p>
        </div>
        <div className="sv-product__grid">
          {AVAILABLE.map(({ icon: Icon, title, description, number }) => (
            <article className="sv-product-item" key={title}>
              <div className="sv-product-item__top">
                <span>{number}</span>
                <Icon size={20} strokeWidth={1.6} />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
        <div className="sv-workspace-tools">
          <div className="sv-workspace-tools__heading">
            <p className="sv-eyebrow"><span /> Founder workspace preview</p>
            <h3>Practical planning tools, with their limits made clear.</h3>
            <p>These browser-side calculators do not create an account or save financial plans to the server.</p>
          </div>
          <div className="sv-workspace-tools__grid">
            <article><span>01 / FORECAST</span><h4>Financial planning & runway</h4><p>Project 1–36 months of revenue, costs, and cash from editable assumptions; see when projected cash turns negative.</p></article>
            <article><span>02 / OWNERSHIP</span><h4>Fundraising & cap table</h4><p>Model one priced equity round, founder dilution, and a 100% use-of-funds allocation. SAFEs, notes, and option-pool changes are excluded.</p></article>
            <article><span>03 / PREPARATION</span><h4>Investor readiness & reports</h4><p>Track a browser-saved checklist and access account-scoped valuation report history with on-demand PDF downloads.</p></article>
          </div>
        </div>
        <div className="sv-product__roadmap">
          <Scale size={19} />
          <p><strong>Current boundaries:</strong> financial plans and roadmap drafts are not saved to the server; collaboration, account recovery, organization controls, and billing are not available. Valuations and reports require sign-in and are owner-scoped.</p>
          <LockKeyhole size={17} />
        </div>
      </div>
    </section>
  )
}

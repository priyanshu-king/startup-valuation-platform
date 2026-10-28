const METHODS = [
  {
    number: '01',
    title: 'Revenue multiple',
    description: 'Annual revenue (or MRR × 12 when annual revenue is absent) multiplied by an illustrative stage multiple.',
    note: 'Revenue startups',
  },
  {
    number: '02',
    title: 'Growth-adjusted multiple',
    description: 'Uses the same revenue base and adds a growth premium above the model’s 30% baseline.',
    note: 'Revenue startups',
  },
  {
    number: '03',
    title: 'Pre-revenue estimate',
    description: 'A capped, Berkus-inspired score using stage, submitted market size, and early customer signals.',
    note: 'Pre-revenue startups',
  },
  {
    number: '04',
    title: 'Market penetration ceiling',
    description: 'A sanity check that caps the composite base at 25% of submitted SOM when SOM is provided.',
    note: 'Ceiling check',
  },
]

export default function ValuationMethods() {
  return (
    <section id="valuation-methods" className="sv-methods sv-section">
      <div className="sv-container">
        <div className="sv-section-heading">
          <p className="sv-eyebrow"><span /> How the estimate works</p>
          <h2>Show the method. Name the assumptions.</h2>
          <p>These are the methods currently implemented in the calculation engine—not a promise of market-comparable data.</p>
        </div>
        <div className="sv-methods__list">
          {METHODS.map(({ number, title, description, note }) => (
            <article className="sv-method" key={title}>
              <span className="sv-method__number">{number}</span>
              <div className="sv-method__body">
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <span className="sv-method__tag">{note}</span>
            </article>
          ))}
        </div>
        <p className="sv-methods__disclaimer">
          The base estimate is the simple average of applicable valuation methods. If a positive SOM is submitted, the base is capped at 25% of SOM; the displayed low and high values are 75% and 135% of that base. Multiples are configurable illustrative assumptions, not verified market transactions. This is not a certified appraisal or investment advice.
        </p>
      </div>
    </section>
  )
}

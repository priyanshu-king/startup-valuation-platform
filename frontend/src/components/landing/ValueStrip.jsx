import { useState } from 'react'
import { ArrowRight, Check, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const SCENARIOS = {
  'Early traction': {
    name: 'Northstar Works',
    description: 'Fictional B2B software company · Seed stage',
    range: '₹8.4–12.2 Cr',
    metrics: [
      ['Annual recurring revenue', '₹1.8 Cr'],
      ['Revenue growth', '64%'],
      ['Cash runway', '14 months'],
    ],
  },
  'Scaling up': {
    name: 'Northstar Works',
    description: 'Fictional B2B software company · Series A',
    range: '₹19.6–28.1 Cr',
    metrics: [
      ['Annual recurring revenue', '₹4.2 Cr'],
      ['Revenue growth', '92%'],
      ['Cash runway', '21 months'],
    ],
  },
  'Lean growth': {
    name: 'Northstar Works',
    description: 'Fictional B2B software company · Seed stage',
    range: '₹6.1–8.9 Cr',
    metrics: [
      ['Annual recurring revenue', '₹1.4 Cr'],
      ['Revenue growth', '38%'],
      ['Cash runway', '26 months'],
    ],
  },
}

export default function ValueStrip() {
  const [activeScenario, setActiveScenario] = useState('Early traction')
  const scenario = SCENARIOS[activeScenario]

  return (
    <section id="sample-report" className="sv-sample sv-section">
      <div className="sv-container sv-sample__layout">
        <div className="sv-sample__intro">
          <p className="sv-eyebrow"><span /> Illustrative preview</p>
          <h2>See the thinking behind the number.</h2>
          <p>
            Explore a fictional company's sample report. The figures below are illustrative—not
            real company data, a benchmark, or an API calculation.
          </p>
          <Link className="sv-text-link" to="/valuation">Run your own valuation <ArrowRight size={16} /></Link>
        </div>

        <div className="sv-report">
          <div className="sv-report__header">
            <div>
              <span className="sv-report__overline">Fictional profile</span>
              <h3>{scenario.name}</h3>
              <p>{scenario.description}</p>
            </div>
            <span className="sv-report__badge"><Check size={14} /> Sample only</span>
          </div>
          <div className="sv-report__scenario">
            <span>Illustrative scenarios</span>
            <div role="group" aria-label="Choose a fictional sample scenario">
              {Object.keys(SCENARIOS).map((name) => (
                <button
                  type="button"
                  key={name}
                  aria-pressed={activeScenario === name}
                  className={activeScenario === name ? 'is-active' : ''}
                  onClick={() => setActiveScenario(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
          <div className="sv-report__value">
            <div>
              <span>Illustrative estimated range</span>
              <strong>{scenario.range}</strong>
            </div>
            <span className="sv-report__unit">INR · crore</span>
          </div>
          <div className="sv-report__metrics">
            {scenario.metrics.map(([label, value]) => (
              <div key={label}><span>{label}</span><strong>{value}</strong></div>
            ))}
          </div>
          <div className="sv-report__note">
            <ChevronRight size={15} />
            Sample figures are fictional and do not represent a company or market average.
          </div>
        </div>
      </div>
    </section>
  )
}

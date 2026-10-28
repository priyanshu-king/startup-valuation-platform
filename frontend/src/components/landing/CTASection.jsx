import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CTASection() {
  return (
    <section className="sv-close sv-section">
      <div className="sv-container sv-close__inner">
        <div>
          <p className="sv-eyebrow"><span /> Start with what you know</p>
          <h2>Make the numbers easier to discuss.</h2>
          <p>Build a transparent, model-based estimate from your company’s own inputs.</p>
        </div>
        <Link className="sv-button sv-button--light" to="/valuation">
          Calculate Valuation <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  )
}

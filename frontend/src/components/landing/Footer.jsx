import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

const LINKS = [
  { label: 'Features', href: '/features' },
  { label: 'Methodology', href: '/methodology' },
  { label: 'Sample report', href: '/sample-report' },
  { label: 'Startup roadmap builder', href: '/roadmap' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Workspace preview', href: '/app' },
]

export default function Footer() {
  return (
    <footer className="sv-footer">
      <div className="sv-container">
        <div className="sv-footer__main">
          <div>
            <Link to="/" className="sv-brand" aria-label="Startup Valuation home">
              <span className="sv-brand__symbol" aria-hidden="true"><i /><i /><i /></span>
              <span>Startup <b>Valuation</b></span>
            </Link>
            <p>A considered view of startup value, built from your own inputs.</p>
          </div>
          <nav aria-label="Footer navigation">
            {LINKS.map(({ label, href }) => <Link to={href} key={label}>{label}<ArrowUpRight size={13} /></Link>)}
            <Link to="/valuation">Calculate Valuation<ArrowUpRight size={13} /></Link>
          </nav>
        </div>
        <div className="sv-footer__bottom">
          <span>© {new Date().getFullYear()} Startup Valuation</span>
          <span>Model-based estimates only · Not a formal appraisal or investment advice</span>
        </div>
      </div>
    </footer>
  )
}

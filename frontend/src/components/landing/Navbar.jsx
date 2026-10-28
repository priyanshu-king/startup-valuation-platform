import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Features', href: '/features' },
  { label: 'Methodology', href: '/methodology' },
  { label: 'Roadmap', href: '/roadmap' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Workspace', href: '/app' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => setMobileOpen(false)

  return (
    <header className={`sv-nav${scrolled ? ' sv-nav--scrolled' : ''}`}>
      <nav className="sv-container sv-nav__inner" aria-label="Main navigation">
        <Link to="/" className="sv-brand" aria-label="Startup Valuation home" onClick={closeMenu}>
          <span className="sv-brand__symbol" aria-hidden="true"><i /><i /><i /></span>
          <span>Startup <b>Valuation</b></span>
        </Link>
        <div id="primary-navigation" className={`sv-nav__links${mobileOpen ? ' sv-nav__links--open' : ''}`}>
          {NAV_LINKS.map(({ label, href }) => (
            <Link to={href} key={label} onClick={closeMenu}>{label}</Link>
          ))}
          <Link className="sv-nav__mobile-cta" to="/valuation" onClick={closeMenu}>
            Calculate Valuation
          </Link>
        </div>
        <Link className="sv-nav__cta" to="/valuation">Calculate Valuation</Link>
        <button
          className="sv-nav__toggle"
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-controls="primary-navigation"
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
    </header>
  )
}

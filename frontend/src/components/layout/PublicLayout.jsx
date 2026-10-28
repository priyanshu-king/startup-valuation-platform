import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'

export default function PublicLayout() {
  const { pathname } = useLocation()
  const title = {
    '/features': 'Features',
    '/methodology': 'Valuation methodology',
    '/sample-report': 'Illustrative sample report',
    '/pricing': 'Pricing',
    '/faq': 'Frequently asked questions',
    '/roadmap': 'Startup roadmap builder',
    '/roadmap/new': 'Create a startup roadmap',
  }[pathname]

  return (
    <div className="landing-shell">
      <Navbar />
      <main className="sv-public-route">
        {title && <h1 className="sv-route-title">{title}</h1>}
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

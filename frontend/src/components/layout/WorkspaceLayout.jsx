import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Building2,
  Calculator,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  FileText,
  LayoutDashboard,
  LineChart,
  Milestone,
  Menu,
  PieChart,
  Settings,
  X,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const NAV_ITEMS = [
  { label: 'Overview', path: '/app/overview', icon: LayoutDashboard },
  { label: 'Startups', path: '/app/startups', icon: Building2 },
  { label: 'Valuation', path: '/app/valuation', icon: Calculator },
  { label: 'Financial planner', path: '/app/financial-planner', icon: LineChart },
  { label: 'Runway', path: '/app/runway', icon: Clock3 },
  { label: 'Fundraising', path: '/app/fundraising', icon: CircleDollarSign },
  { label: 'Cap table', path: '/app/cap-table', icon: PieChart },
  { label: 'Investor readiness', path: '/app/readiness', icon: ClipboardCheck },
  { label: 'Reports', path: '/app/reports', icon: FileText },
  { label: 'Roadmaps', path: '/app/roadmaps', icon: Milestone },
  { label: 'Settings', path: '/app/settings', icon: Settings },
]

export default function WorkspaceLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const current = NAV_ITEMS.find((item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)) ?? NAV_ITEMS[0]

  async function handleLogout() {
    setLogoutError('')
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      setLogoutError(error.message || 'Could not sign out. Please retry.')
    }
  }

  return (
    <div className="app-workspace">
      <aside className={`workspace-sidebar${menuOpen ? ' workspace-sidebar--open' : ''}`}>
        <Link to="/app/overview" className="workspace-brand" onClick={() => setMenuOpen(false)}>
          <span className="workspace-brand__mark" aria-hidden="true">V</span>
          <span>Startup <strong>Valuation</strong></span>
        </Link>
        <p className="workspace-nav-label">WORKSPACE</p>
        <nav className="workspace-nav" aria-label="Workspace navigation">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `workspace-nav__link${isActive ? ' is-active' : ''}`}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="workspace-sidebar__notice">
          <strong>Private workspace</strong>
          <span>Saved valuations and reports are scoped to your account. Financial-planner inputs remain in this browser session.</span>
        </div>
      </aside>

      {menuOpen && <button className="workspace-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}

      <div className="workspace-main">
        <header className="workspace-topbar">
          <button
            type="button"
            className="workspace-menu-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close workspace navigation' : 'Open workspace navigation'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="workspace-breadcrumb"><span>Workspace</span><b>/</b><strong>{current.label}</strong></div>
          <div className="workspace-account">
            <span className="workspace-guest">{user?.email}</span>
            <button type="button" onClick={handleLogout}>Sign out</button>
          </div>
        </header>
        {logoutError && <p className="workspace-logout-error" role="alert">{logoutError}</p>}
        <main className="workspace-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

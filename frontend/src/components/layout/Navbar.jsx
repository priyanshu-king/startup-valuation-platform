/**
 * Navbar Component
 * ================
 * Top navigation bar with:
 * - Brand logo
 * - Navigation links
 * - Live backend health indicator
 * - CTA button
 */

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bars3Icon, XMarkIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { useHealthCheck } from '@/hooks/useHealthCheck'
import clsx from 'clsx'

const navLinks = [
  { label: 'Dashboard',  href: '/dashboard' },
  // Phase 2 links — uncomment as features are built:
  // { label: 'New Valuation', href: '/valuation/profile' },
  // { label: 'Reports',       href: '/reports' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { status } = useHealthCheck(30_000)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/8 backdrop-blur-xl bg-surface-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow duration-300">
              <ChartBarIcon className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-white text-sm hidden sm:block">
              Startup Valuation
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                to={href}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  location.pathname === href
                    ? 'bg-brand-500/15 text-brand-400'
                    : 'text-white/60 hover:text-white hover:bg-white/6',
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Backend Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-700 border border-white/8 text-xs">
              <span
                className={clsx(
                  'w-1.5 h-1.5 rounded-full transition-colors duration-500',
                  status === 'ok'      && 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]',
                  status === 'error'   && 'bg-red-400',
                  status === 'unknown' && 'bg-white/30 animate-pulse',
                )}
              />
              <span className="text-white/50">
                {status === 'ok' ? 'API Connected' : status === 'error' ? 'API Offline' : 'Connecting…'}
              </span>
            </div>

            {/* CTA */}
            <Link to="/dashboard" className="btn-primary btn-sm hidden sm:inline-flex">
              Open Dashboard
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen
                ? <XMarkIcon className="w-5 h-5" />
                : <Bars3Icon className="w-5 h-5" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/8 bg-surface-800/95 backdrop-blur-xl animate-slide-down">
          <nav className="px-4 py-3 space-y-1">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                to={href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'block px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                  location.pathname === href
                    ? 'bg-brand-500/15 text-brand-400'
                    : 'text-white/60 hover:text-white hover:bg-white/6',
                )}
              >
                {label}
              </Link>
            ))}
            <div className="pt-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="btn-primary w-full"
              >
                Open Dashboard
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

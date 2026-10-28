/**
 * Footer Component
 */

import { Link } from 'react-router-dom'
import { ChartBarIcon } from '@heroicons/react/24/outline'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/8 bg-surface-900/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-brand flex items-center justify-center">
              <ChartBarIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white/40 text-sm">
              AI Startup Valuation Platform
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-white/30">
            <span>v0.1.0</span>
            <span>·</span>
            <span>© {year}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

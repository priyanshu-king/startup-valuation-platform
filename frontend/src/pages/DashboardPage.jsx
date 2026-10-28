/**
 * Dashboard Page  —  /dashboard
 * ==============================
 * Shows live backend health + a phase checklist.
 * Will expand into a full valuation history dashboard in Phase 4.
 */
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  RefreshCw,
  Wifi,
  WifiOff,
  BarChart3,
} from 'lucide-react'
import { useHealthCheck } from '@/hooks/useHealthCheck'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import clsx from 'clsx'

const PHASES = [
  { label: 'Valuation form and calculation API', done: true },
  { label: 'Valuation results and persistence', done: true },
  { label: 'Public pages and workspace shell', done: true },
  { label: 'User accounts and private data access', done: false },
  { label: 'Financial planning and runway tools', done: false },
  { label: 'Report history and downloads', done: false },
  { label: 'Payments and subscriptions', done: false },
]

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/+$/, '')

function StatusIndicator({ status, data, error, isLoading, refetch }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-white">Backend Status</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={refetch}
          disabled={isLoading}
          aria-label="Refresh health check"
        >
          <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      <div className="flex items-start gap-4">
        <div className={clsx(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
          status === 'ok'      && 'bg-emerald-500/12 border border-emerald-500/25',
          status === 'error'   && 'bg-red-500/12 border border-red-500/25',
          status === 'unknown' && 'bg-white/8 border border-white/12',
        )}>
          {status === 'ok'      && <Wifi className="w-5 h-5 text-emerald-400" />}
          {status === 'error'   && <WifiOff className="w-5 h-5 text-red-400" />}
          {status === 'unknown' && <div className="w-4 h-4 border-2 border-white/20 border-t-brand-400 rounded-full animate-spin" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className={clsx(
            'font-semibold text-base mb-1',
            status === 'ok'      && 'text-emerald-400',
            status === 'error'   && 'text-red-400',
            status === 'unknown' && 'text-white/40',
          )}>
            {status === 'ok'      && 'FastAPI Connected'}
            {status === 'error'   && 'Backend Offline'}
            {status === 'unknown' && 'Checking connection…'}
          </p>
          {data && (
            <p className="text-xs text-white/40 mb-4">
              {data.service} · Uptime {data.uptime_seconds}s · {data.timestamp?.slice(0, 19).replace('T', ' ')} UTC
            </p>
          )}
          {error && (
            <p className="text-xs text-red-400/70 mb-4">
              {error} — Start FastAPI: <code className="text-red-300/70">uvicorn main:app --reload --port 8000</code>
            </p>
          )}

          {/* Raw JSON preview */}
          {data && (
            <div className="p-3 rounded-xl bg-surface-900 border border-white/6 font-mono text-xs text-white/40 overflow-x-auto">
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default function DashboardPage() {
  const health = useHealthCheck(30_000)

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-white/8 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-white text-sm">Startup Valuation</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-white/45">Live API health and an accurate snapshot of available product capabilities.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Health card — spans 2 cols */}
          <div className="lg:col-span-2">
            <StatusIndicator {...health} />
          </div>

          {/* Phase progress */}
          <Card className="p-6">
            <h3 className="font-semibold text-white mb-5">Current capabilities</h3>
            <ol className="space-y-3.5" aria-label="Available product capabilities">
              {PHASES.map(({ label, done }) => (
                <li key={label} className="flex items-center gap-3">
                  {done ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-white/15 flex-shrink-0" />
                  )}
                  <span className={clsx(
                    'text-sm leading-snug',
                    done ? 'text-white' : 'text-white/30',
                  )}>
                    {label}
                  </span>
                  {done && (
                    <span className="ml-auto flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/12 text-emerald-400 border border-emerald-500/20">
                      Done
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* Quick links */}
        <div className="mt-8">
          <Card className="p-5">
            <p className="text-xs text-white/30 uppercase tracking-widest font-semibold mb-4">API Links</p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Health Endpoint',  href: `${API_BASE_URL}/health` },
                { label: 'Swagger Docs',     href: `${API_BASE_URL}/docs` },
                { label: 'ReDoc',            href: `${API_BASE_URL}/redoc` },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white hover:border-white/20 transition-all"
                >
                  {label} ↗
                </a>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

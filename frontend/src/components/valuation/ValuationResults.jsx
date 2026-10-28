/**
 * ValuationResults — Full results dashboard
 * ==========================================
 * Displays the complete output from POST /api/valuation/calculate
 * Uses Recharts (already installed) for the score radials.
 */
import { useState } from 'react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip,
} from 'recharts'
import {
  TrendingUp, Shield, Target, AlertTriangle,
  CheckCircle2, Info, ChevronDown, ChevronUp,
  BarChart2, Zap, Award,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { CardGlass, Card } from '@/components/ui/Card'

// ── Helpers ──────────────────────────────────────────────────────────────────

function crore(v) {
  if (v == null) return '—'
  return `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`
}

function scoreColor(s) {
  if (s >= 75) return 'text-emerald-400'
  if (s >= 50) return 'text-amber-400'
  return 'text-red-400'
}

function scoreRing(s) {
  if (s >= 75) return 'from-emerald-500 to-emerald-400'
  if (s >= 50) return 'from-amber-500 to-amber-400'
  return 'from-red-500 to-red-400'
}

function scoreLabel(s) {
  if (s >= 80) return 'Excellent'
  if (s >= 65) return 'Good'
  if (s >= 50) return 'Fair'
  if (s >= 35) return 'Developing'
  return 'Early Stage'
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreRing({ score, label, icon: Icon, color }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  return (
    <CardGlass className="p-5 flex flex-col items-center gap-3 text-center">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke="url(#grad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3d5af1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xl font-bold ${scoreColor(score)}`}>{score}</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className={`text-xs mt-0.5 ${scoreColor(score)}`}>{scoreLabel(score)}</p>
      </div>
    </CardGlass>
  )
}

function MethodCard({ method }) {
  const [open, setOpen] = useState(false)
  if (!method.applicable) return null

  return (
    <div className="border border-white/8 rounded-xl p-4 bg-surface-800/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{method.method_name}</p>
          {method.value_crore != null && (
            <p className="text-lg font-bold text-brand-400 mt-1">{crore(method.value_crore)}</p>
          )}
        </div>
        {method.note && (
          <button
            onClick={() => setOpen((o) => !o)}
            className="text-white/30 hover:text-white/60 transition-colors mt-0.5"
          >
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>
      {open && method.note && (
        <p className="text-xs text-white/40 mt-3 pt-3 border-t border-white/8 leading-relaxed">
          {method.note}
        </p>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ValuationResults({ result, onReset }) {
  const {
    valuation_low, valuation_base, valuation_high,
    financial_health_score, growth_score, investor_readiness_score,
    cash_runway_months, ltv_cac_ratio,
    method_breakdown, strengths, risks,
    ai_analysis, is_pre_revenue, disclaimer, assumptions,
  } = result

  const radarData = [
    { subject: 'Financial Health', A: financial_health_score },
    { subject: 'Growth',           A: growth_score },
    { subject: 'Investor Ready',   A: investor_readiness_score },
  ]

  return (
    <div className="animate-fade-in space-y-8">

      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-5">
          <CheckCircle2 className="w-4 h-4" />
          Valuation Complete
        </div>
        {is_pre_revenue && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-5 ml-2">
            <Info className="w-4 h-4" />
            Pre-Revenue — Berkus Method Applied
          </div>
        )}
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Estimated Valuation
        </h2>
        <p className="text-white/50 text-sm">Model-based estimate · Not a certified appraisal</p>
      </div>

      {/* Valuation Range */}
      <CardGlass className="p-6 sm:p-8 text-center">
        <p className="text-xs text-white/35 uppercase tracking-widest font-semibold mb-6">
          Estimated Range (INR Crore)
        </p>
        <div className="flex items-end justify-center gap-4 sm:gap-8 flex-wrap">
          <div>
            <p className="text-xs text-white/40 mb-1">Low</p>
            <p className="text-2xl font-bold text-white/70">{crore(valuation_low)}</p>
          </div>
          <div className="pb-1">
            <p className="text-xs text-brand-400 mb-1 font-semibold">Base (Most Likely)</p>
            <p className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
              {crore(valuation_base)}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">High</p>
            <p className="text-2xl font-bold text-white/70">{crore(valuation_high)}</p>
          </div>
        </div>

        {/* Quick stats */}
        {(cash_runway_months != null || ltv_cac_ratio != null) && (
          <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-white/8 flex-wrap">
            {cash_runway_months != null && (
              <div className="text-center">
                <p className="text-xs text-white/40">Cash Runway</p>
                <p className="text-lg font-bold text-white mt-0.5">{cash_runway_months.toFixed(0)} months</p>
              </div>
            )}
            {ltv_cac_ratio != null && (
              <div className="text-center">
                <p className="text-xs text-white/40">LTV / CAC</p>
                <p className={`text-lg font-bold mt-0.5 ${ltv_cac_ratio >= 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {ltv_cac_ratio.toFixed(2)}x
                </p>
              </div>
            )}
          </div>
        )}
      </CardGlass>

      {/* Scores */}
      <div>
        <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4">Scores</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ScoreRing score={financial_health_score} label="Financial Health" />
          <ScoreRing score={growth_score}           label="Growth Score" />
          <ScoreRing score={investor_readiness_score} label="Investor Readiness" />
        </div>
      </div>

      {/* Radar Chart */}
      <CardGlass className="p-6">
        <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
          <BarChart2 className="w-4 h-4" /> Performance Overview
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              />
              <Radar
                name="Score"
                dataKey="A"
                stroke="#3d5af1"
                fill="#3d5af1"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  background: '#1e2535',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: '#fff',
                  fontSize: 12,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardGlass>

      {/* Valuation Method Breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Target className="w-4 h-4" /> Valuation Method Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {method_breakdown.map((m) => (
            <MethodCard key={m.method_name} method={m} />
          ))}
        </div>
      </div>

      {/* Strengths & Risks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CardGlass className="p-5">
          <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Key Strengths
          </h3>
          <ul className="space-y-2">
            {strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </CardGlass>

        <CardGlass className="p-5">
          <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Key Risks
          </h3>
          <ul className="space-y-2">
            {risks.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                {r}
              </li>
            ))}
          </ul>
        </CardGlass>
      </div>

      {/* Rule-based analysis */}
      {ai_analysis?.summary && (
        <CardGlass className="p-6">
          <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Rule-based Summary
            {ai_analysis.provider === 'rules' && (
              <span className="ml-2 text-[10px] text-white/30 normal-case tracking-normal font-normal">
                (No external data or LLM used)
              </span>
            )}
          </h3>
          <p className="text-sm text-white/70 leading-relaxed mb-4">{ai_analysis.summary}</p>
          {ai_analysis.opportunities?.length > 0 && (
            <>
              <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-2">Opportunities</p>
              <ul className="space-y-1">
                {ai_analysis.opportunities.map((o, i) => (
                  <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                    <span className="text-brand-400 mt-0.5">→</span> {o}
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardGlass>
      )}

      {/* Assumptions */}
      {assumptions && Object.keys(assumptions).length > 0 && (
        <CardGlass className="p-5">
          <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Info className="w-4 h-4" /> Calculation & Model Assumptions
          </h3>
          {assumptions.valuation_formula && (
            <p className="text-sm text-white/60 mb-4">{assumptions.valuation_formula}</p>
          )}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {assumptions.stage_revenue_multiple != null && (
              <div>
                <dt className="text-xs text-white/30">Stage Multiple</dt>
                <dd className="text-sm text-white/70">{assumptions.stage_revenue_multiple}x (illustrative)</dd>
              </div>
            )}
            {assumptions.growth_premium_per_10pct != null && (
              <div>
                <dt className="text-xs text-white/30">Growth Premium</dt>
                <dd className="text-sm text-white/70">{assumptions.growth_premium_per_10pct}x per 10% growth above baseline</dd>
              </div>
            )}
            {assumptions.pre_revenue_base_crore != null && is_pre_revenue && (
              <div>
                <dt className="text-xs text-white/30">Pre-Revenue Base Assumption</dt>
                <dd className="text-sm text-white/70">₹{assumptions.pre_revenue_base_crore} Cr</dd>
              </div>
            )}
            {assumptions.arr_used_crore != null && (
              <div>
                <dt className="text-xs text-white/30">ARR Used</dt>
                <dd className="text-sm text-white/70">₹{assumptions.arr_used_crore} Cr</dd>
              </div>
            )}
            {assumptions.currency && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-white/30">Currency</dt>
                <dd className="text-sm text-white/70">{assumptions.currency}</dd>
              </div>
            )}
          </dl>
          {assumptions.note && (
            <p className="text-xs text-white/30 mt-3 pt-3 border-t border-white/8 leading-relaxed">
              {assumptions.note}
            </p>
          )}
        </CardGlass>
      )}

      {/* Disclaimer */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <p className="text-xs text-amber-400/80 leading-relaxed flex items-start gap-2">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          {disclaimer}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Button onClick={onReset} variant="secondary" size="lg">
          Calculate Another
        </Button>
        <Link to="/">
          <Button variant="ghost" size="lg">← Back to Home</Button>
        </Link>
      </div>
    </div>
  )
}

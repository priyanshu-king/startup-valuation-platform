/**
 * StepReview — Final review before submission
 */
import { CardGlass } from '@/components/ui/Card'

const STAGE_LABELS = {
  idea: 'Idea', pre_seed: 'Pre-Seed', seed: 'Seed',
  series_a: 'Series A', series_b: 'Series B', series_c_plus: 'Series C+',
}
const MODEL_LABELS = {
  saas: 'SaaS', marketplace: 'Marketplace', ecommerce: 'E-Commerce',
  fintech: 'FinTech', edtech: 'EdTech', healthtech: 'HealthTech', other: 'Other',
}

function fmt(value, prefix = '₹') {
  if (value === 0 || value === '' || value == null) return '—'
  if (typeof value === 'number' && value >= 1_00_00_000)
    return `${prefix}${(value / 1_00_00_000).toFixed(2)} Cr`
  if (typeof value === 'number' && value >= 1_00_000)
    return `${prefix}${(value / 1_00_000).toFixed(1)} L`
  return `${prefix}${Number(value).toLocaleString('en-IN')}`
}

function pct(v) { return v ? `${v}%` : '—' }

function Section({ title, rows }) {
  return (
    <CardGlass className="p-5">
      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">{title}</h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-white/40 mb-0.5">{label}</dt>
            <dd className="text-sm text-white font-medium truncate">{value || '—'}</dd>
          </div>
        ))}
      </dl>
    </CardGlass>
  )
}

export default function StepReview({ profile, financials, business, market }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-white/50 text-center mb-6">
        Review your inputs before calculating the valuation. Go back to any step to make changes.
      </p>

      <Section title="Startup Profile" rows={[
        ['Name',           profile.name],
        ['Industry',       profile.industry],
        ['Country',        profile.country],
        ['Founded Year',   profile.founded_year],
        ['Business Model', MODEL_LABELS[profile.business_model] || profile.business_model],
        ['Stage',          STAGE_LABELS[profile.stage] || profile.stage],
      ]} />

      <Section title="Financial Metrics" rows={[
        ['Annual Revenue',      fmt(financials.annual_revenue)],
        ['MRR',                 fmt(financials.mrr)],
        ['YoY Growth',          pct(financials.revenue_growth_yoy)],
        ['Gross Margin',        pct(financials.gross_margin)],
        ['Monthly OpEx',        fmt(financials.monthly_opex)],
        ['Monthly Burn',        fmt(financials.monthly_burn)],
        ['Cash Available',      fmt(financials.cash_available)],
        ['Total Funding',       fmt(financials.total_funding_raised)],
      ]} />

      <Section title="Business Metrics" rows={[
        ['Total Customers',  business.total_customers || '—'],
        ['Monthly Active Users', business.monthly_active_users || '—'],
        ['CAC',              fmt(business.cac)],
        ['LTV',              fmt(business.ltv)],
        ['Monthly Churn',    pct(business.churn_rate)],
        ['ARPU',             fmt(business.arpu)],
      ]} />

      <Section title="Market & Competition" rows={[
        ['TAM',              market.tam ? `₹${market.tam} Cr` : '—'],
        ['SAM',              market.sam ? `₹${market.sam} Cr` : '—'],
        ['SOM',              market.som ? `₹${market.som} Cr` : '—'],
        ['Market Growth',    pct(market.market_growth)],
        ['Competitors',      market.num_competitors || '—'],
        ['Competitive Advantage', market.competitive_advantage || '—'],
      ]} />
    </div>
  )
}

/**
 * Step 2 — Financial Metrics
 */
import { NumberField } from '@/components/ui/FormField'

export default function StepFinancials({ data, errors, onChange }) {
  const set = (field) => (e) =>
    onChange({ ...data, [field]: e.target.value === '' ? '' : Number(e.target.value) })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <NumberField
        label="Annual Revenue"
        hint="Leave 0 if pre-revenue"
        prefix="₹"
        placeholder="e.g. 50000000"
        value={data.annual_revenue}
        onChange={set('annual_revenue')}
        error={errors.annual_revenue}
      />

      <NumberField
        label="Monthly Recurring Revenue (MRR)"
        hint="Leave 0 if no recurring revenue"
        prefix="₹"
        placeholder="e.g. 4200000"
        value={data.mrr}
        onChange={set('mrr')}
        error={errors.mrr}
      />

      <NumberField
        label="YoY Revenue Growth"
        hint="Year-over-year growth percentage"
        prefix="%"
        min="-100"
        max="10000"
        placeholder="e.g. 120"
        value={data.revenue_growth_yoy}
        onChange={set('revenue_growth_yoy')}
        error={errors.revenue_growth_yoy}
      />

      <NumberField
        label="Gross Margin"
        hint="As a percentage (0–100)"
        prefix="%"
        min="-100"
        max="100"
        placeholder="e.g. 72"
        value={data.gross_margin}
        onChange={set('gross_margin')}
        error={errors.gross_margin}
      />

      <NumberField
        label="Monthly Operating Expenses"
        prefix="₹"
        placeholder="e.g. 3000000"
        value={data.monthly_opex}
        onChange={set('monthly_opex')}
        error={errors.monthly_opex}
      />

      <NumberField
        label="Monthly Burn Rate"
        hint="Total cash spent per month"
        prefix="₹"
        placeholder="e.g. 3500000"
        value={data.monthly_burn}
        onChange={set('monthly_burn')}
        error={errors.monthly_burn}
      />

      <NumberField
        label="Available Cash"
        hint="Cash in bank today"
        prefix="₹"
        placeholder="e.g. 25000000"
        value={data.cash_available}
        onChange={set('cash_available')}
        error={errors.cash_available}
      />

      <NumberField
        label="Total Funding Raised"
        hint="Cumulative all rounds"
        prefix="₹"
        placeholder="e.g. 30000000"
        value={data.total_funding_raised}
        onChange={set('total_funding_raised')}
        error={errors.total_funding_raised}
      />
    </div>
  )
}

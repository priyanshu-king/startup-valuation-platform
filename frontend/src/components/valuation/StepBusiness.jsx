/**
 * Step 3 — Business Metrics
 */
import { NumberField } from '@/components/ui/FormField'

export default function StepBusiness({ data, errors, onChange }) {
  const setNum = (field) => (e) =>
    onChange({ ...data, [field]: e.target.value === '' ? '' : Number(e.target.value) })
  const setInt = (field) => (e) =>
    onChange({ ...data, [field]: e.target.value === '' ? '' : parseInt(e.target.value, 10) })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <NumberField
        label="Total Customers"
        hint="Paying customers today"
        placeholder="e.g. 150"
        value={data.total_customers}
        onChange={setInt('total_customers')}
        error={errors.total_customers}
      />

      <NumberField
        label="Monthly Active Users (MAU)"
        hint="Unique active users in past 30 days"
        placeholder="e.g. 1200"
        value={data.monthly_active_users}
        onChange={setInt('monthly_active_users')}
        error={errors.monthly_active_users}
      />

      <NumberField
        label="Customer Acquisition Cost (CAC)"
        hint="Average cost to acquire one customer"
        prefix="₹"
        placeholder="e.g. 50000"
        value={data.cac}
        onChange={setNum('cac')}
        error={errors.cac}
      />

      <NumberField
        label="Customer Lifetime Value (LTV)"
        hint="Expected revenue from one customer"
        prefix="₹"
        placeholder="e.g. 250000"
        value={data.ltv}
        onChange={setNum('ltv')}
        error={errors.ltv}
      />

      <NumberField
        label="Monthly Churn Rate"
        hint="% of customers lost per month (0–100)"
        prefix="%"
        placeholder="e.g. 2.5"
        value={data.churn_rate}
        onChange={setNum('churn_rate')}
        error={errors.churn_rate}
      />

      <NumberField
        label="Avg. Revenue Per Customer"
        hint="Monthly or annual average"
        prefix="₹"
        placeholder="e.g. 28000"
        value={data.arpu}
        onChange={setNum('arpu')}
        error={errors.arpu}
      />
    </div>
  )
}

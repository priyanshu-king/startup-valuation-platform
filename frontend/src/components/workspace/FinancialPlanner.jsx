import { useState } from 'react'
import {
  calculateFinancialProjection,
  calculateFinancialSummary,
} from '@/services/financialCalculations'
import { loadSettings } from '@/services/userSettings'
import {
  formatCurrency,
  ToolAction,
  ToolCard,
  ToolError,
  ToolField,
  ToolMetrics,
  ToolNotice,
  ToolPage,
} from './ToolUi'

const INITIAL_INPUTS = {
  monthlyRevenue: '',
  operatingExpenses: '',
  payroll: '',
  marketingCosts: '',
  otherCosts: '',
  openingCash: '',
  revenueGrowthPercent: '0',
  expenseGrowthPercent: '0',
  forecastMonths: '12',
}

const INPUT_FIELDS = [
  ['monthlyRevenue', 'Current monthly revenue'],
  ['operatingExpenses', 'Monthly operating expenses'],
  ['payroll', 'Monthly payroll'],
  ['marketingCosts', 'Monthly marketing expenses'],
  ['otherCosts', 'Other monthly costs'],
  ['openingCash', 'Opening cash balance'],
]

export default function FinancialPlanner() {
  const [preferences] = useState(() => loadSettings().settings.preferences)
  const currency = preferences.currency
  const [inputs, setInputs] = useState(() => ({
    ...INITIAL_INPUTS,
    forecastMonths: String(preferences.forecastMonths),
  }))
  const [projection, setProjection] = useState(null)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  const update = (key, value) => {
    setInputs((previous) => ({ ...previous, [key]: value }))
    setProjection(null)
    setSummary(null)
    setError('')
  }

  const calculate = () => {
    if (INPUT_FIELDS.some(([key]) => inputs[key] === '')) {
      setError('Enter every current monthly amount and the opening cash balance.')
      setProjection(null)
      setSummary(null)
      return
    }

    try {
      const forecast = calculateFinancialProjection(inputs, Number(inputs.forecastMonths))
      setProjection(forecast)
      setSummary(calculateFinancialSummary(forecast))
      setError('')
    } catch (calculationError) {
      setError(calculationError.message)
      setProjection(null)
      setSummary(null)
    }
  }

  return (
    <ToolPage
      title="Financial planner"
      description="Build a month-by-month cash projection from your current monthly figures and editable growth assumptions."
    >
      <ToolCard title="Current monthly inputs" description="Enter your latest run-rate figures. These are user-entered starting assumptions, not independently verified actuals.">
        <div className="workspace-tool-grid">
          {INPUT_FIELDS.map(([key, label]) => (
            <ToolField key={key} label={`${label} (${currency})`} value={inputs[key]} onChange={(value) => update(key, value)} />
          ))}
        </div>
      </ToolCard>

      <ToolCard title="Forecast assumptions" description="Applied monthly, compounded from the current run-rate. Zero means no month-over-month change.">
        <div className="workspace-tool-grid workspace-tool-grid--two">
          <ToolField label="Monthly revenue growth" value={inputs.revenueGrowthPercent} onChange={(value) => update('revenueGrowthPercent', value)} min={-100} max={1000} suffix="%" hint="Allowed range: -100% to 1,000%." />
          <ToolField label="Monthly expense growth" value={inputs.expenseGrowthPercent} onChange={(value) => update('expenseGrowthPercent', value)} min={-100} max={1000} suffix="%" hint="Applied to operating expenses, payroll, marketing, and other costs." />
          <ToolField label="Forecast period" value={inputs.forecastMonths} onChange={(value) => update('forecastMonths', value)} min={1} max={36} step={1} suffix="months" hint="Choose 1 to 36 months." />
        </div>
        <ToolError>{error}</ToolError>
        <ToolAction onClick={calculate}>Update forecast</ToolAction>
        <ToolNotice>Your planner inputs and projections are held in this browser session only and are not saved to the backend.</ToolNotice>
      </ToolCard>

      {projection && summary && (
        <ToolCard title={`${projection.length}-month forecast`} description="Every row is a forecast, including Month 1, which uses your entered current run-rate. Later months compound the growth assumptions.">
          <ToolMetrics items={[
            { label: 'Total forecast revenue', value: formatCurrency(summary.totalRevenue, currency) },
            { label: 'Total forecast expenses', value: formatCurrency(summary.totalExpenses, currency) },
            { label: 'Net cash flow', value: formatCurrency(summary.totalNetCashFlow, currency) },
            { label: 'Ending cash balance', value: formatCurrency(summary.endingCash, currency) },
          ]} />
          {projection.some((month) => month.closingCash < 0) && (
            <ToolNotice tone="warning">
              Projected cash falls below zero in month {projection.find((month) => month.closingCash < 0).month}. This is a model warning, not a financing recommendation.
            </ToolNotice>
          )}
          <div className="workspace-table-scroll">
            <table className="workspace-table">
              <thead><tr><th>Period</th><th>Revenue</th><th>Expenses</th><th>Net cash flow</th><th>Closing cash</th></tr></thead>
              <tbody>
                {projection.map((month) => (
                  <tr key={month.month}>
                    <th scope="row">Month {month.month} <span>Forecast</span></th>
                    <td>{formatCurrency(month.revenue, currency)}</td>
                    <td>{formatCurrency(month.expenses, currency)}</td>
                    <td className={month.netCashFlow < 0 ? 'is-negative' : 'is-positive'}>{formatCurrency(month.netCashFlow, currency)}</td>
                    <td className={month.closingCash < 0 ? 'is-negative' : ''}>{formatCurrency(month.closingCash, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ToolNotice>Formula: total expenses = operating expenses + payroll + marketing + other costs; net cash flow = revenue − total expenses; closing cash = prior cash + net cash flow. Monthly growth is compounded from the entered run-rate. No tax, financing, working-capital, or seasonality effects are modeled.</ToolNotice>
        </ToolCard>
      )}
    </ToolPage>
  )
}

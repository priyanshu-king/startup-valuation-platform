import { useState } from 'react'
import { calculateRunway } from '@/services/financialCalculations'
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
  cashAvailable: '',
  monthlyRevenue: '',
  monthlyExpenses: '',
  monthlyPayroll: '',
  monthlyMarketingCosts: '',
  monthlyOtherCosts: '',
  revenueGrowthPercent: '0',
  expenseGrowthPercent: '0',
  forecastMonths: '12',
}

const REQUIRED_FIELDS = [
  ['cashAvailable', 'Current available cash'],
  ['monthlyRevenue', 'Current monthly revenue'],
  ['monthlyExpenses', 'Monthly operating expenses'],
  ['monthlyPayroll', 'Monthly payroll'],
  ['monthlyMarketingCosts', 'Monthly marketing expenses'],
  ['monthlyOtherCosts', 'Other monthly costs'],
]

export default function RunwayCalculator() {
  const [preferences] = useState(() => loadSettings().settings.preferences)
  const currency = preferences.currency
  const [inputs, setInputs] = useState(() => ({
    ...INITIAL_INPUTS,
    forecastMonths: String(preferences.forecastMonths),
  }))
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const update = (key, value) => {
    setInputs((previous) => ({ ...previous, [key]: value }))
    setResult(null)
    setError('')
  }

  const calculate = () => {
    if (REQUIRED_FIELDS.some(([key]) => inputs[key] === '')) {
      setError('Enter available cash, monthly revenue, and each monthly cost.')
      setResult(null)
      return
    }

    try {
      setResult(calculateRunway(inputs, Number(inputs.forecastMonths)))
      setError('')
    } catch (calculationError) {
      setError(calculationError.message)
      setResult(null)
    }
  }

  const runwayText = !result
    ? ''
    : result.isCashFlowPositive
      ? 'No depletion at this run-rate'
      : `${result.runwayMonths.toFixed(1)} months`
  return (
    <ToolPage
      title="Runway calculator"
      description="Estimate runway from available cash and current net burn, alongside an editable monthly cash projection."
    >
      <ToolCard title="Current monthly run-rate">
        <div className="workspace-tool-grid">
          {REQUIRED_FIELDS.map(([key, label]) => (
            <ToolField key={key} label={`${label} (${currency})`} value={inputs[key]} onChange={(value) => update(key, value)} />
          ))}
        </div>
      </ToolCard>
      <ToolCard title="Projection assumptions" description="Editable assumptions are applied monthly to the selected forecast period.">
        <div className="workspace-tool-grid workspace-tool-grid--two">
          <ToolField label="Monthly revenue growth" value={inputs.revenueGrowthPercent} onChange={(value) => update('revenueGrowthPercent', value)} min={-100} max={1000} suffix="%" hint="Allowed range: -100% to 1,000%." />
          <ToolField label="Monthly expense growth" value={inputs.expenseGrowthPercent} onChange={(value) => update('expenseGrowthPercent', value)} min={-100} max={1000} suffix="%" hint="Applied to operating expenses, payroll, marketing, and other costs." />
          <ToolField label="Forecast period" value={inputs.forecastMonths} onChange={(value) => update('forecastMonths', value)} min={1} max={36} step={1} suffix="months" hint="Choose 1 to 36 months." />
        </div>
        <ToolError>{error}</ToolError>
        <ToolAction onClick={calculate}>Calculate runway</ToolAction>
        <ToolNotice>Your runway inputs and projection are held in this browser session only and are not saved to the backend.</ToolNotice>
      </ToolCard>

      {result && (
        <ToolCard title={`${result.projection.length}-month runway estimate`}>
          <ToolMetrics items={[
            { label: 'Estimated runway', value: runwayText, note: result.isCashFlowPositive ? 'Current cash flow is break-even or positive.' : 'Calculated from current net burn.' },
            { label: 'Monthly total expenses', value: formatCurrency(result.monthlyTotalExpenses, currency) },
            { label: 'Monthly net cash flow', value: formatCurrency(result.monthlyNetCashFlow, currency) },
            { label: 'Average monthly net burn', value: formatCurrency(result.monthlyNetBurn, currency), note: 'Estimated from the current monthly run-rate you entered.' },
            { label: 'Available cash', value: formatCurrency(result.cashAvailable, currency) },
          ]} />
          {!result.isCashFlowPositive && result.firstCashShortfallMonth !== null && (
            <ToolNotice tone="warning">
              Based on these assumptions, projected cash reaches or falls below zero in month {result.firstCashShortfallMonth}. This is an estimate, not a guarantee.
            </ToolNotice>
          )}
          <div className="workspace-table-scroll">
            <table className="workspace-table">
              <thead><tr><th>Period</th><th>Revenue</th><th>Monthly expenses</th><th>Net cash flow</th><th>Closing cash</th></tr></thead>
              <tbody>
                {result.projection.map((month) => (
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
          <ToolNotice>Runway = available cash ÷ current monthly net burn only when net burn is positive. If monthly cash flow is zero or positive, depletion-based runway is not applicable; the cash projection is still shown. Every projection row is an estimate, including Month 1 based on your entered run-rate. The model excludes taxes, financing, working capital, and seasonality.</ToolNotice>
        </ToolCard>
      )}
    </ToolPage>
  )
}

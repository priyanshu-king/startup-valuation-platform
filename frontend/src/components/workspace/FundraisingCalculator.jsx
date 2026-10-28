import { useState } from 'react'
import { calculateFundraising } from '@/services/financialCalculations'
import {
  formatInr,
  formatPercent,
  ToolAction,
  ToolCard,
  ToolError,
  ToolField,
  ToolMetrics,
  ToolNotice,
  ToolPage,
} from './ToolUi'

const CATEGORIES = ['Product & engineering', 'Go-to-market', 'Hiring', 'Operations', 'Cash reserve']
const INITIAL_ALLOCATIONS = CATEGORIES.map((category) => ({ category, percent: '' }))

export default function FundraisingCalculator() {
  const [fundingAmount, setFundingAmount] = useState('')
  const [preMoneyValuation, setPreMoneyValuation] = useState('')
  const [founderOwnershipPercent, setFounderOwnershipPercent] = useState('')
  const [allocations, setAllocations] = useState(INITIAL_ALLOCATIONS)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const updateInput = (setter) => (value) => {
    setter(value)
    setResult(null)
    setError('')
  }

  const updateAllocation = (index, value) => {
    setAllocations((previous) => previous.map((entry, entryIndex) => (
      entryIndex === index ? { ...entry, percent: value } : entry
    )))
    setResult(null)
    setError('')
  }

  const calculate = () => {
    try {
      if (!fundingAmount || !preMoneyValuation || founderOwnershipPercent === ''
        || allocations.some((allocation) => allocation.percent === '')) {
        throw new RangeError('Enter a funding amount, pre-money valuation, founder ownership, and every use-of-funds percentage.')
      }
      setResult(calculateFundraising({
        fundingAmount,
        preMoneyValuation,
        founderOwnershipPercent,
        allocations,
      }))
      setError('')
    } catch (calculationError) {
      setResult(null)
      setError(calculationError.message)
    }
  }

  return (
    <ToolPage
      title="Fundraising calculator"
      description="Model a priced equity round and allocate the proposed raise. This is a planning estimate, not legal or investment advice."
    >
      <ToolCard title="Round assumptions" description="Enter all currency values in INR. Existing founder ownership is the combined pre-round share of founders.">
        <div className="workspace-tool-grid">
          <ToolField label="Funding amount" value={fundingAmount} onChange={updateInput(setFundingAmount)} />
          <ToolField label="Pre-money valuation" value={preMoneyValuation} onChange={updateInput(setPreMoneyValuation)} />
          <ToolField label="Existing founder ownership" value={founderOwnershipPercent} onChange={updateInput(setFounderOwnershipPercent)} min={0} max={100} suffix="%" />
        </div>
      </ToolCard>
      <ToolCard title="Use of funds" description="Allocate the entire raise. Percentages must total exactly 100%.">
        <div className="workspace-tool-grid">
          {allocations.map((allocation, index) => (
            <ToolField
              key={allocation.category}
              label={allocation.category}
              value={allocation.percent}
              onChange={(value) => updateAllocation(index, value)}
              min={0}
              max={100}
              suffix="%"
            />
          ))}
        </div>
        <ToolError>{error}</ToolError>
        <ToolAction onClick={calculate}>Calculate round</ToolAction>
        <ToolNotice>Your fundraising assumptions and calculation are held in this browser session only and are not saved to the backend.</ToolNotice>
      </ToolCard>

      {result && (
        <ToolCard title="Round estimate">
          <ToolMetrics items={[
            { label: 'Post-money valuation', value: formatInr(result.postMoneyValuation), note: 'Pre-money valuation + funding amount.' },
            { label: 'New investor ownership', value: formatPercent(result.investorOwnershipPercent), note: 'Funding amount ÷ post-money valuation.' },
            { label: 'Founder ownership after round', value: formatPercent(result.founderPostRoundPercent) },
            { label: 'Founder dilution', value: `${result.founderDilutionPercentagePoints.toFixed(2)} percentage points` },
          ]} />
          <div className="workspace-table-scroll">
            <table className="workspace-table">
              <thead><tr><th>Use</th><th>Allocation</th><th>Planned amount</th></tr></thead>
              <tbody>{result.allocations.map((allocation) => (
                <tr key={allocation.category}>
                  <th scope="row">{allocation.category}</th>
                  <td>{formatPercent(allocation.percent)}</td>
                  <td>{formatInr(allocation.amount)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <ToolNotice>Formula: post-money = pre-money + investment; new investor ownership = investment ÷ post-money. Founder dilution assumes all pre-round ownership is diluted pro-rata, with no option-pool top-up, SAFE, convertible note, preferences, or other securities.</ToolNotice>
        </ToolCard>
      )}
    </ToolPage>
  )
}

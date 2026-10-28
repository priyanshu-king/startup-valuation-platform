import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { calculateCapTable } from '@/services/financialCalculations'
import {
  formatInr,
  formatPercent,
  ToolAction,
  ToolCard,
  ToolError,
  ToolField,
  ToolNotice,
  ToolPage,
} from './ToolUi'

const INITIAL_SHAREHOLDER = { name: '', type: 'founder', ownershipPercent: '' }

export default function CapTable() {
  const [shareholders, setShareholders] = useState([{ ...INITIAL_SHAREHOLDER }])
  const [fundingAmount, setFundingAmount] = useState('')
  const [preMoneyValuation, setPreMoneyValuation] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const updateShareholder = (index, key, value) => {
    setShareholders((previous) => previous.map((shareholder, shareholderIndex) => (
      shareholderIndex === index ? { ...shareholder, [key]: value } : shareholder
    )))
    setResult(null)
    setError('')
  }

  const calculate = () => {
    try {
      if (!fundingAmount || !preMoneyValuation || shareholders.some(
        (shareholder) => !shareholder.name.trim() || shareholder.ownershipPercent === '',
      )) {
        throw new RangeError('Enter every shareholder name and ownership, plus the round assumptions.')
      }
      setResult(calculateCapTable({ shareholders, fundingAmount, preMoneyValuation }))
      setError('')
    } catch (calculationError) {
      setResult(null)
      setError(calculationError.message)
    }
  }

  return (
    <ToolPage
      title="Cap table"
      description="Model pro-rata ownership dilution in a single priced equity round. Complex securities and option-pool changes are not included."
    >
      <ToolCard title="Current shareholders" description="Enter a complete current ownership split that totals exactly 100%.">
        <div className="workspace-shareholder-list">
          {shareholders.map((shareholder, index) => (
            <div className="workspace-shareholder-row" key={`shareholder-${index}`}>
              <div className="workspace-tool-field">
                <label htmlFor={`shareholder-name-${index}`}>Name *</label>
                <input id={`shareholder-name-${index}`} value={shareholder.name} onChange={(event) => updateShareholder(index, 'name', event.target.value)} />
              </div>
              <div className="workspace-tool-field">
                <label htmlFor={`shareholder-type-${index}`}>Holder type</label>
                <select id={`shareholder-type-${index}`} value={shareholder.type} onChange={(event) => updateShareholder(index, 'type', event.target.value)}>
                  <option value="founder">Founder</option>
                  <option value="investor">Existing investor</option>
                  <option value="other">Other holder</option>
                </select>
              </div>
              <ToolField label={`Ownership ${index + 1}`} value={shareholder.ownershipPercent} onChange={(value) => updateShareholder(index, 'ownershipPercent', value)} min={0} max={100} suffix="%" />
              <button
                type="button"
                className="workspace-icon-action"
                aria-label={`Remove ${shareholder.name || `shareholder ${index + 1}`}`}
                onClick={() => {
                  setShareholders((previous) => previous.filter((_, shareholderIndex) => shareholderIndex !== index))
                  setResult(null)
                  setError('')
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="workspace-inline-action"
          onClick={() => {
            setShareholders((previous) => [...previous, { ...INITIAL_SHAREHOLDER }])
            setResult(null)
            setError('')
          }}
        >
          <Plus size={16} /> Add shareholder
        </button>
      </ToolCard>

      <ToolCard title="New priced equity round">
        <div className="workspace-tool-grid workspace-tool-grid--two">
          <ToolField label="Pre-money valuation (INR)" value={preMoneyValuation} onChange={(value) => { setPreMoneyValuation(value); setResult(null); setError('') }} />
          <ToolField label="New investment (INR)" value={fundingAmount} onChange={(value) => { setFundingAmount(value); setResult(null); setError('') }} />
        </div>
        <ToolError>{error}</ToolError>
        <ToolAction onClick={calculate}>Model ownership</ToolAction>
        <ToolNotice>Your cap-table assumptions are held in this browser session only and are not saved to the backend.</ToolNotice>
      </ToolCard>

      {result && (
        <ToolCard title="Ownership after the round">
          <div className="workspace-table-scroll">
            <table className="workspace-table">
              <thead><tr><th>Holder</th><th>Category</th><th>Before</th><th>After</th></tr></thead>
              <tbody>
                {result.shareholders.map((shareholder, index) => (
                  <tr key={`${shareholder.name}-${index}`}>
                    <th scope="row">{shareholder.name}</th>
                    <td>{shareholder.type === 'investor' ? 'Existing investor' : shareholder.type === 'founder' ? 'Founder' : 'Other holder'}</td>
                    <td>{formatPercent(shareholder.ownershipPercent)}</td>
                    <td>{formatPercent(shareholder.postRoundOwnershipPercent)}</td>
                  </tr>
                ))}
                <tr>
                  <th scope="row">New investor(s)</th>
                  <td>New money</td>
                  <td>0%</td>
                  <td>{formatPercent(result.investorOwnershipPercent)}</td>
                </tr>
                <tr className="workspace-table__total">
                  <th scope="row" colSpan="3">Total after round</th>
                  <td>100%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="workspace-captable-summary">
            Post-money valuation: {formatInr(result.postMoneyValuation)}. Existing holders are diluted pro-rata by the pre-money ÷ post-money factor.
          </p>
          <ToolNotice>Each existing holder’s post-round percentage = pre-round percentage × pre-money valuation ÷ post-money valuation. New investor ownership = investment ÷ post-money valuation. This simple model excludes SAFEs, notes, option pools, preferences, and legal share counts.</ToolNotice>
        </ToolCard>
      )}
    </ToolPage>
  )
}

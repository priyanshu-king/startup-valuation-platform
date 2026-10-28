/**
 * Step 4 — Market & Competition
 */
import { NumberField, TextareaField } from '@/components/ui/FormField'

export default function StepMarket({ data, errors, onChange }) {
  const setNum = (field) => (e) =>
    onChange({ ...data, [field]: e.target.value === '' ? '' : Number(e.target.value) })
  const setInt = (field) => (e) =>
    onChange({ ...data, [field]: e.target.value === '' ? '' : parseInt(e.target.value, 10) })
  const setStr = (field) => (e) => onChange({ ...data, [field]: e.target.value })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <NumberField
        label="Total Addressable Market (TAM)"
        hint="In ₹ crore (1 Cr = ₹1,00,00,000)"
        prefix="₹Cr"
        placeholder="e.g. 50000"
        value={data.tam}
        onChange={setNum('tam')}
        error={errors.tam}
      />

      <NumberField
        label="Serviceable Addressable Market (SAM)"
        hint="In ₹ crore — the market you can realistically reach"
        prefix="₹Cr"
        placeholder="e.g. 5000"
        value={data.sam}
        onChange={setNum('sam')}
        error={errors.sam}
      />

      <NumberField
        label="Serviceable Obtainable Market (SOM)"
        hint="In ₹ crore — your realistic target this year"
        prefix="₹Cr"
        placeholder="e.g. 500"
        value={data.som}
        onChange={setNum('som')}
        error={errors.som}
      />

      <NumberField
        label="Market Growth Rate"
        hint="Annual market growth %"
        prefix="%"
        min="-100"
        max="1000"
        placeholder="e.g. 35"
        value={data.market_growth}
        onChange={setNum('market_growth')}
        error={errors.market_growth}
      />

      <div className="sm:col-span-2">
        <NumberField
          label="Number of Known Competitors"
          placeholder="e.g. 12"
          value={data.num_competitors}
          onChange={setInt('num_competitors')}
          error={errors.num_competitors}
        />
      </div>

      <div className="sm:col-span-2">
        <TextareaField
          label="Competitive Advantage"
          hint="Describe your moat, differentiation, or unique value proposition"
          placeholder="e.g. Proprietary workflow data or a differentiated distribution channel..."
          rows={4}
          value={data.competitive_advantage}
          onChange={setStr('competitive_advantage')}
          error={errors.competitive_advantage}
        />
      </div>
    </div>
  )
}

/**
 * Step 1 — Startup Profile
 */
import { SelectField, TextField } from '@/components/ui/FormField'

const STAGE_OPTIONS = [
  { value: 'idea',          label: 'Idea' },
  { value: 'pre_seed',      label: 'Pre-Seed' },
  { value: 'seed',          label: 'Seed' },
  { value: 'series_a',      label: 'Series A' },
  { value: 'series_b',      label: 'Series B' },
  { value: 'series_c_plus', label: 'Series C+' },
]

const BUSINESS_MODEL_OPTIONS = [
  { value: 'saas',        label: 'SaaS' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'ecommerce',   label: 'E-Commerce' },
  { value: 'fintech',     label: 'FinTech' },
  { value: 'edtech',      label: 'EdTech' },
  { value: 'healthtech',  label: 'HealthTech' },
  { value: 'other',       label: 'Other' },
]

export default function StepProfile({ data, errors, onChange }) {
  const set = (field) => (e) => onChange({ ...data, [field]: e.target.value })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="sm:col-span-2">
        <TextField
          label="Startup Name"
          required
          placeholder="e.g. Northstar Works"
          value={data.name}
          onChange={set('name')}
          error={errors.name}
        />
      </div>

      <TextField
        label="Industry"
        required
        placeholder="e.g. FinTech, HealthTech, SaaS"
        value={data.industry}
        onChange={set('industry')}
        error={errors.industry}
      />

      <TextField
        label="Country"
        required
        placeholder="e.g. India"
        value={data.country}
        onChange={set('country')}
        error={errors.country}
      />

      <TextField
        label="Founded Year"
        required
        type="number"
        min="1980"
        max={new Date().getFullYear()}
        placeholder="e.g. 2021"
        value={data.founded_year}
        onChange={set('founded_year')}
        error={errors.founded_year}
      />

      <SelectField
        label="Business Model"
        required
        placeholder="Select a business model"
        value={data.business_model}
        onChange={set('business_model')}
        options={BUSINESS_MODEL_OPTIONS}
        error={errors.business_model}
      />

      <div className="sm:col-span-2">
        <SelectField
          label="Startup Stage"
          required
          placeholder="Select current stage"
          value={data.stage}
          onChange={set('stage')}
          options={STAGE_OPTIONS}
          error={errors.stage}
        />
      </div>
    </div>
  )
}

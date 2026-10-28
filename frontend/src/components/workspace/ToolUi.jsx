import { AlertCircle } from 'lucide-react'

export function ToolPage({ eyebrow = 'FOUNDER WORKSPACE', title, description, children }) {
  return (
    <div className="workspace-page">
      <div className="workspace-page__heading">
        <div>
          <p className="workspace-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export function ToolCard({ title, description, children, className = '' }) {
  return (
    <section className={`workspace-tool-card ${className}`}>
      {(title || description) && (
        <div className="workspace-tool-card__heading">
          {title && <h2>{title}</h2>}
          {description && <p>{description}</p>}
        </div>
      )}
      {children}
    </section>
  )
}

export function ToolField({
  label,
  value,
  onChange,
  hint,
  error,
  min = 0,
  max,
  step = 'any',
  suffix,
  required = true,
}) {
  const id = `tool-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
  return (
    <div className="workspace-tool-field">
      <label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      <div className="workspace-tool-input-wrap">
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          required={required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        />
        {suffix && <span>{suffix}</span>}
      </div>
      {hint && !error && <p id={`${id}-hint`}>{hint}</p>}
      {error && <p id={`${id}-error`} className="workspace-tool-field__error">{error}</p>}
    </div>
  )
}

export function ToolAction({ children, ...props }) {
  return <button className="workspace-tool-action" type="button" {...props}>{children}</button>
}

export function ToolError({ children }) {
  if (!children) return null
  return (
    <p className="workspace-tool-error" role="alert">
      <AlertCircle size={16} /> {children}
    </p>
  )
}

export function ToolNotice({ children, tone = 'info' }) {
  return <p className={`workspace-tool-notice workspace-tool-notice--${tone}`}>{children}</p>
}

export function formatInr(value) {
  return formatCurrency(value, 'INR')
}

export function formatCurrency(value, currency = 'INR') {
  const locale = currency === 'INR' ? 'en-IN' : currency === 'GBP' || currency === 'EUR' ? 'en-GB' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value) {
  return `${Number(value).toFixed(2).replace(/\.?0+$/, '')}%`
}

export function ToolMetrics({ items }) {
  return (
    <dl className="workspace-tool-metrics">
      {items.map(({ label, value, note }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
          {note && <span>{note}</span>}
        </div>
      ))}
    </dl>
  )
}

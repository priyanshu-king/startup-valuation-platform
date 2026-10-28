/**
 * Form Field Components
 * =====================
 * Reusable, accessible inputs styled for the dark application design system.
 * Supports: text, number, textarea, select (dropdown)
 */
import clsx from 'clsx'

const base = [
  'w-full rounded-xl px-4 py-3 text-sm text-white',
  'bg-surface-700 border border-white/10',
  'placeholder:text-white/30',
  'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/60',
  'transition-colors duration-150',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ')

const errorBase = 'border-red-500/60 focus:ring-red-500/40 focus:border-red-500/60'

/** Wrapper with label + error message */
export function FieldWrapper({ label, hint, error, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-white/30">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}

/** Text / number input */
export function Input({ error, className = '', ...props }) {
  return (
    <input
      className={clsx(base, error && errorBase, className)}
      {...props}
    />
  )
}

/** Textarea */
export function Textarea({ error, className = '', rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      className={clsx(base, 'resize-none', error && errorBase, className)}
      {...props}
    />
  )
}

/** Select dropdown — styled to match dark theme */
export function Select({ error, className = '', children, ...props }) {
  return (
    <select
      className={clsx(
        base,
        'appearance-none cursor-pointer',
        // Custom chevron via background
        "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")]",
        'bg-no-repeat bg-[right_1rem_center]',
        // Firefox: remove default arrow
        '[&>option]:bg-surface-700',
        error && errorBase,
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}

/** Composed field: label + input */
export function TextField({ label, hint, error, required, ...inputProps }) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} required={required}>
      <Input error={error} {...inputProps} />
    </FieldWrapper>
  )
}

/** Composed field: label + number input with optional prefix symbol */
export function NumberField({ label, hint, error, required, prefix, min = 0, ...inputProps }) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} required={required}>
      {prefix ? (
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm select-none pointer-events-none">
            {prefix}
          </span>
          <Input
            type="number"
            min={min}
            step="any"
            error={error}
            className="pl-8"
            {...inputProps}
          />
        </div>
      ) : (
        <Input type="number" min={min} step="any" error={error} {...inputProps} />
      )}
    </FieldWrapper>
  )
}

/** Composed field: label + select */
export function SelectField({ label, hint, error, required, options = [], placeholder, ...selectProps }) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} required={required}>
      <Select error={error} {...selectProps}>
        {placeholder && (
          <option value="" disabled>{placeholder}</option>
        )}
        {options.map(({ value, label: optLabel }) => (
          <option key={value} value={value}>{optLabel}</option>
        ))}
      </Select>
    </FieldWrapper>
  )
}

/** Composed field: label + textarea */
export function TextareaField({ label, hint, error, required, ...props }) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} required={required}>
      <Textarea error={error} {...props} />
    </FieldWrapper>
  )
}

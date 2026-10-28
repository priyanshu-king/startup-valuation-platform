/**
 * Reusable Button Component
 * =========================
 */
import { forwardRef } from 'react'
import clsx from 'clsx'

const variants = {
  primary: [
    'bg-gradient-to-r from-brand-500 to-accent-500',
    'hover:from-brand-600 hover:to-accent-600',
    'text-white shadow-glow-sm hover:shadow-glow',
    'focus:ring-brand-500/50',
  ].join(' '),

  secondary: [
    'bg-white/8 hover:bg-white/12',
    'text-white border border-white/15 hover:border-white/25',
    'focus:ring-white/25',
  ].join(' '),

  ghost: [
    'text-white/70 hover:text-white hover:bg-white/8',
    'focus:ring-white/20',
  ].join(' '),

  outline: [
    'border border-brand-500/50 hover:border-brand-500',
    'text-brand-400 hover:text-brand-300 hover:bg-brand-500/8',
    'focus:ring-brand-500/40',
  ].join(' '),
}

const sizes = {
  sm:  'px-4 py-2 text-xs rounded-lg gap-1.5',
  md:  'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg:  'px-7 py-3.5 text-sm rounded-xl gap-2',
  xl:  'px-8 py-4 text-base rounded-2xl gap-2.5',
}

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    fullWidth = false,
    type = 'button',
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={clsx(
        // Base
        'inline-flex items-center justify-center font-semibold',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-900',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'select-none',
        // Variant
        variants[variant],
        // Size
        sizes[size],
        // Width
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading…</span>
        </>
      ) : children}
    </button>
  )
})

export default Button

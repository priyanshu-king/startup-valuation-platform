/**
 * Reusable Card Components
 * ========================
 */
import clsx from 'clsx'

/** Base card */
export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={clsx(
        'bg-surface-800 rounded-2xl border border-white/8 shadow-card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/** Card that lifts on hover */
export function CardHover({ children, className = '', ...props }) {
  return (
    <div
      className={clsx(
        'bg-surface-800 rounded-2xl border border-white/8 shadow-card',
        'transition-all duration-300',
        'hover:border-white/16 hover:shadow-card-lg hover:-translate-y-1',
        'group cursor-default',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/** Glassmorphism card */
export function CardGlass({ children, className = '', ...props }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-white/10 shadow-card backdrop-blur-xl',
        'bg-surface-800/60',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card

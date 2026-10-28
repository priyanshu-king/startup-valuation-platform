/**
 * StepIndicator
 * =============
 * Visual step progress bar for the multi-step valuation form.
 */
import clsx from 'clsx'
import { Check } from 'lucide-react'

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="w-full">
      {/* Mobile: just show "Step N of M" */}
      <div className="flex items-center justify-between mb-2 sm:hidden">
        <span className="text-sm text-white/50">
          Step <span className="text-white font-semibold">{currentStep + 1}</span> of {steps.length}
        </span>
        <span className="text-sm font-medium text-brand-400">{steps[currentStep]?.label}</span>
      </div>

      {/* Desktop: full indicator */}
      <div className="hidden sm:flex items-center gap-0">
        {steps.map((step, i) => {
          const done    = i < currentStep
          const active  = i === currentStep
          const pending = i > currentStep

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              {/* Circle */}
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div
                  className={clsx(
                    'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 text-sm font-bold',
                    done    && 'bg-brand-500 border-brand-500 text-white',
                    active  && 'bg-transparent border-brand-500 text-brand-400 shadow-glow-sm',
                    pending && 'bg-transparent border-white/15 text-white/25',
                  )}
                >
                  {done ? (
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                <span
                  className={clsx(
                    'text-[11px] font-medium whitespace-nowrap',
                    active  ? 'text-brand-400' : done ? 'text-white/60' : 'text-white/25',
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line — hidden after last step */}
              {i < steps.length - 1 && (
                <div
                  className={clsx(
                    'h-px flex-1 mx-2 mb-5 transition-all duration-500',
                    i < currentStep ? 'bg-brand-500' : 'bg-white/10',
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Progress bar (mobile) */}
      <div className="sm:hidden h-1 w-full bg-white/10 rounded-full mt-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  )
}

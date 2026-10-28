/**
 * ValuationPage  —  /valuation
 * =============================
 * Multi-step startup valuation form.
 * Steps: Profile → Financials → Business → Market → Review → Results
 *
 * Sends validated data to POST /api/valuation/calculate via the centralised
 * api.js service. Uses only dropdowns for constrained fields (stage, business_model)
 * so the backend validator never sees an invalid enum value.
 */
import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Calculator, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

import Button from '@/components/ui/Button'
import StepIndicator from '@/components/ui/StepIndicator'
import StepProfile   from '@/components/valuation/StepProfile'
import StepFinancials from '@/components/valuation/StepFinancials'
import StepBusiness  from '@/components/valuation/StepBusiness'
import StepMarket    from '@/components/valuation/StepMarket'
import StepReview    from '@/components/valuation/StepReview'
import ValuationResults from '@/components/valuation/ValuationResults'
import { valuationsApi } from '@/services/api'

// ── Step meta ────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 'profile',    label: 'Profile' },
  { id: 'financials', label: 'Financials' },
  { id: 'business',   label: 'Business' },
  { id: 'market',     label: 'Market' },
  { id: 'review',     label: 'Review' },
]

// ── Default form state ────────────────────────────────────────────────────────

const DEFAULT_PROFILE = {
  name: '', industry: '', country: 'India',
  founded_year: '', business_model: '', stage: '',
}
const DEFAULT_FINANCIALS = {
  annual_revenue: 0, mrr: 0, revenue_growth_yoy: 0, gross_margin: 0,
  monthly_opex: 0, monthly_burn: 0, cash_available: 0, total_funding_raised: 0,
}
const DEFAULT_BUSINESS = {
  total_customers: 0, monthly_active_users: 0,
  cac: 0, ltv: 0, churn_rate: 0, arpu: 0,
}
const DEFAULT_MARKET = {
  tam: 0, sam: 0, som: 0, market_growth: 0,
  num_competitors: 0, competitive_advantage: '',
}

// ── Validators ────────────────────────────────────────────────────────────────

const VALID_STAGES = ['idea', 'pre_seed', 'seed', 'series_a', 'series_b', 'series_c_plus']
const VALID_MODELS = ['saas', 'marketplace', 'ecommerce', 'fintech', 'edtech', 'healthtech', 'other']

function validateProfile(d) {
  const e = {}
  if (!d.name?.trim())                  e.name = 'Startup name is required'
  if (!d.industry?.trim())              e.industry = 'Industry is required'
  if (!d.country?.trim())               e.country = 'Country is required'
  if (!d.founded_year)                  e.founded_year = 'Founded year is required'
  else if (d.founded_year < 1980 || d.founded_year > new Date().getFullYear())
                                        e.founded_year = `Must be between 1980 and ${new Date().getFullYear()}`
  if (!VALID_MODELS.includes(d.business_model))
                                        e.business_model = 'Please select a business model'
  if (!VALID_STAGES.includes(d.stage)) e.stage = 'Please select a stage'
  return e
}

function validateFinancials(d) {
  const e = {}
  for (const field of ['annual_revenue', 'mrr', 'monthly_opex', 'monthly_burn', 'cash_available', 'total_funding_raised']) {
    if (!Number.isFinite(Number(d[field])) || Number(d[field]) < 0)
      e[field] = 'Must be a valid non-negative amount'
  }
  if (!Number.isFinite(Number(d.revenue_growth_yoy)) || d.revenue_growth_yoy < -100 || d.revenue_growth_yoy > 10000)
    e.revenue_growth_yoy = 'Growth must be between -100% and 10,000%'
  if (d.gross_margin < -100 || d.gross_margin > 100)
    e.gross_margin = 'Gross margin must be between -100 and 100'
  if (!Number.isFinite(Number(d.gross_margin)))
    e.gross_margin = 'Gross margin must be a valid percentage'
  return e
}

function validateBusiness(d) {
  const e = {}
  for (const field of ['total_customers', 'monthly_active_users', 'cac', 'ltv', 'arpu']) {
    if (!Number.isFinite(Number(d[field])) || Number(d[field]) < 0)
      e[field] = 'Must be a valid non-negative value'
  }
  if (!Number.isFinite(Number(d.churn_rate)) || d.churn_rate < 0 || d.churn_rate > 100)
    e.churn_rate = 'Churn rate must be between 0 and 100'
  return e
}

function validateMarket(d) {
  const e = {}
  for (const field of ['tam', 'sam', 'som', 'num_competitors']) {
    if (!Number.isFinite(Number(d[field])) || Number(d[field]) < 0)
      e[field] = 'Must be a valid non-negative value'
  }
  if (!Number.isFinite(Number(d.market_growth)) || d.market_growth < -100 || d.market_growth > 1000)
    e.market_growth = 'Market growth must be between -100% and 1,000%'
  if (Number(d.tam) < Number(d.sam))
    e.tam = 'TAM must be greater than or equal to SAM'
  if (Number(d.sam) < Number(d.som))
    e.sam = 'SAM must be greater than or equal to SOM'
  return e
}

const VALIDATORS = [validateProfile, validateFinancials, validateBusiness, validateMarket]

// ── Component ─────────────────────────────────────────────────────────────────

export default function ValuationPage({ embedded = false }) {
  const [step,       setStep]       = useState(0)    // 0-4 = form steps, 5 = results
  const [profile,    setProfile]    = useState(DEFAULT_PROFILE)
  const [financials, setFinancials] = useState(DEFAULT_FINANCIALS)
  const [business,   setBusiness]   = useState(DEFAULT_BUSINESS)
  const [market,     setMarket]     = useState(DEFAULT_MARKET)
  const [errors,     setErrors]     = useState({})
  const [loading,    setLoading]    = useState(false)
  const [result,     setResult]     = useState(null)
  const [apiError,   setApiError]   = useState('')

  const dataSets    = [profile, financials, business, market]
  const setterFuncs = [setProfile, setFinancials, setBusiness, setMarket]

  // Validate current step
  const validateStep = useCallback(() => {
    if (step >= 4) return {}   // review step has no local validation
    const errs = VALIDATORS[step](dataSets[step])
    setErrors(errs)
    return errs
  }, [step, profile, financials, business, market])

  const handleNext = useCallback(() => {
    const errs = validateStep()
    if (Object.keys(errs).length > 0) return
    setApiError('')
    setStep((s) => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [validateStep])

  const handleBack = useCallback(() => {
    setErrors({})
    setApiError('')
    setStep((s) => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSubmit = useCallback(async () => {
    if (loading) return   // prevent duplicate submission
    setLoading(true)
    setApiError('')

    const payload = {
      profile: {
        ...profile,
        founded_year: Number(profile.founded_year),
      },
      financials: {
        annual_revenue:       Number(financials.annual_revenue)       || 0,
        mrr:                  Number(financials.mrr)                  || 0,
        revenue_growth_yoy:   Number(financials.revenue_growth_yoy)   || 0,
        gross_margin:         Number(financials.gross_margin)         || 0,
        monthly_opex:         Number(financials.monthly_opex)         || 0,
        monthly_burn:         Number(financials.monthly_burn)         || 0,
        cash_available:       Number(financials.cash_available)       || 0,
        total_funding_raised: Number(financials.total_funding_raised) || 0,
      },
      business: {
        total_customers:      Number(business.total_customers)      || 0,
        monthly_active_users: Number(business.monthly_active_users) || 0,
        cac:                  Number(business.cac)                  || 0,
        ltv:                  Number(business.ltv)                  || 0,
        churn_rate:           Number(business.churn_rate)           || 0,
        arpu:                 Number(business.arpu)                 || 0,
      },
      market: {
        tam:                   Number(market.tam)                   || 0,
        sam:                   Number(market.sam)                   || 0,
        som:                   Number(market.som)                   || 0,
        market_growth:         Number(market.market_growth)         || 0,
        num_competitors:       Number(market.num_competitors)       || 0,
        competitive_advantage: market.competitive_advantage || '',
      },
    }

    try {
      const { data } = await valuationsApi.calculate(payload)
      setResult(data)
      setStep(5)   // show results
      window.scrollTo({ top: 0, behavior: 'smooth' })
      toast.success('Valuation calculated successfully!')
    } catch (err) {
      const msg = err.message || 'The valuation could not be calculated. Please try again.'
      if (err.fieldErrors) setErrors(err.fieldErrors)
      setApiError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [loading, profile, financials, business, market])

  const handleReset = useCallback(() => {
    setStep(0)
    setProfile(DEFAULT_PROFILE)
    setFinancials(DEFAULT_FINANCIALS)
    setBusiness(DEFAULT_BUSINESS)
    setMarket(DEFAULT_MARKET)
    setErrors({})
    setResult(null)
    setApiError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ── Render step content ───────────────────────────────────────────────────

  const stepContent = () => {
    switch (step) {
      case 0: return <StepProfile    data={profile}    errors={errors} onChange={setProfile} />
      case 1: return <StepFinancials data={financials} errors={errors} onChange={setFinancials} />
      case 2: return <StepBusiness   data={business}   errors={errors} onChange={setBusiness} />
      case 3: return <StepMarket     data={market}     errors={errors} onChange={setMarket} />
      case 4: return <StepReview     profile={profile} financials={financials} business={business} market={market} />
      case 5: return <ValuationResults result={result} onReset={handleReset} />
      default: return null
    }
  }

  const isLastFormStep = step === 4
  const isResults      = step === 5

  // ── Layout ────────────────────────────────────────────────────────────────

  return (
    <div className={embedded ? 'valuation-embedded' : 'min-h-screen bg-surface-900 flex flex-col'}>

      {/* Top bar */}
      {!embedded && <header className="sticky top-0 z-30 border-b border-white/8 bg-surface-900/90 backdrop-blur-sm px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <Calculator className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Startup Valuation</span>
          </div>
        </div>
      </header>}

      {/* Main */}
      <main className={`flex-1 px-4 ${embedded ? 'py-8' : 'py-10'}`}>
        <div className="max-w-3xl mx-auto">

          {/* Page title */}
          {!isResults && (
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Startup Valuation Calculator
              </h1>
              <p className="text-white/45 text-sm">
                Fill in your startup's data to get a transparent, model-based valuation estimate.
              </p>
            </div>
          )}

          {/* Step indicator */}
          {!isResults && (
            <div className="mb-10">
              <StepIndicator steps={STEPS} currentStep={step} />
            </div>
          )}

          {/* Step content */}
          <div className="animate-fade-in">
            {stepContent()}
          </div>

          {/* API error banner */}
          {apiError && !isResults && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3" role="alert">
              <p className="text-sm text-red-400">⚠ {apiError}</p>
              <p className="mt-1 text-xs text-red-300/70">No valuation result was produced for this request.</p>
            </div>
          )}

          {/* Navigation buttons */}
          {!isResults && (
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/8">
              <div>
                {step > 0 && (
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleBack}
                    disabled={loading}
                  >
                    ← Previous
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Step count */}
                <span className="text-sm text-white/30 hidden sm:block">
                  {step + 1} / {STEPS.length}
                </span>

                {isLastFormStep ? (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={loading}
                    loading={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Calculating…
                      </>
                    ) : (
                      'Calculate Valuation →'
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleNext}
                  >
                    Continue →
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

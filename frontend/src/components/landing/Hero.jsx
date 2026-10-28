import { lazy, Suspense, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownRight, ArrowRight, Check } from 'lucide-react'

const HeroScene = lazy(() => import('@/components/landing/HeroScene'))

const PREVIEW = [
  { label: 'Financial health', value: 78 },
  { label: 'Growth profile', value: 64 },
  { label: 'Investor readiness', value: 71 },
]

function SceneFallback() {
  return (
    <div className="hero-architecture" aria-hidden="true">
      <div className="hero-architecture__orbit" />
      <div className="hero-architecture__base" />
      <div className="hero-architecture__tower hero-architecture__tower--one" />
      <div className="hero-architecture__tower hero-architecture__tower--two" />
      <div className="hero-architecture__tower hero-architecture__tower--three" />
      <div className="hero-architecture__line" />
    </div>
  )
}

function useWebGLSceneEnabled() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const smallScreen = window.matchMedia('(max-width: 680px)')
    const update = () => {
      let supportsWebGL = false
      try {
        const canvas = document.createElement('canvas')
        supportsWebGL = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
      } catch {
        supportsWebGL = false
      }
      setEnabled(!reducedMotion.matches && !smallScreen.matches && supportsWebGL)
    }

    update()
    reducedMotion.addEventListener('change', update)
    smallScreen.addEventListener('change', update)
    return () => {
      reducedMotion.removeEventListener('change', update)
      smallScreen.removeEventListener('change', update)
    }
  }, [])

  return enabled
}

function SamplePreview() {
  return (
    <aside className="sample-preview" aria-label="Fictional sample report preview">
      <div className="sample-preview__topline">
        <span className="sample-preview__mark" />
        Fictional sample · illustrative figures
      </div>
      <div className="sample-preview__heading">
        <div>
          <p>Illustrative valuation range</p>
          <strong>₹12.5 <span>—</span> ₹17.8 Cr</strong>
        </div>
        <span className="sample-preview__arrow"><ArrowDownRight size={18} /></span>
      </div>
      <div className="sample-preview__rule" />
      <div className="sample-preview__scores">
        {PREVIEW.map(({ label, value }) => (
          <div className="sample-preview__score" key={label}>
            <div className="sample-preview__score-label">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
            <div className="sample-preview__track">
              <span style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="sample-preview__foot">
        <Check size={14} />
        Example only — not a calculation or market benchmark
      </div>
    </aside>
  )
}

export default function Hero() {
  const show3D = useWebGLSceneEnabled()

  return (
    <section className="sv-hero" aria-labelledby="hero-title">
      <div className="sv-hero__grid" aria-hidden="true" />
      <div className="sv-container sv-hero__layout">
        <div className="sv-hero__copy">
          <p className="sv-eyebrow"><span /> Financial clarity for founders</p>
          <h1 id="hero-title">
            Understand what your business is worth <em>and what moves the number.</em>
          </h1>
          <p className="sv-hero__lede">
            A transparent view of valuation, financial health, and investor readiness—built from the
            numbers you provide.
          </p>
          <div className="sv-hero__actions">
            <Link className="sv-button sv-button--primary" to="/valuation">
              Calculate Valuation <ArrowRight size={17} />
            </Link>
            <a className="sv-button sv-button--quiet" href="#sample-report">
              Explore Sample Report
            </a>
          </div>
          <div className="sv-hero__assurance">
            <span>Model-based estimates</span><span>Visible assumptions</span><span>No account required</span>
          </div>
        </div>

        <div className="sv-hero__visual">
          <div className="sv-hero__scene" aria-hidden="true">
            {show3D ? (
              <Suspense fallback={<SceneFallback />}>
                <HeroScene fallback={<SceneFallback />} />
              </Suspense>
            ) : <SceneFallback />}
          </div>
          <div className="sv-hero__caption">A company is more than a single number.</div>
          <SamplePreview />
        </div>
      </div>
      <a className="sv-hero__scroll" href="#product">
        Explore the platform <span />
      </a>
    </section>
  )
}

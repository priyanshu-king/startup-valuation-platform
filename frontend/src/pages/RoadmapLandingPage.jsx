import { ArrowRight, Compass, Lightbulb, ShieldAlert, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROADMAP_EXAMPLES } from '@/services/roadmapExamples'

export default function RoadmapLandingPage() {
  return (
    <div className="roadmap-public">
      <section className="roadmap-hero">
        <p className="roadmap-eyebrow"><span /> Founder planning</p>
        <h1>Turn an idea into a practical next step.</h1>
        <p className="roadmap-hero__intro">
          Describe what you want to build. Get an editable, step-by-step plan shaped around
          your business type, stage, budget, and available time.
        </p>
        <div className="roadmap-hero__actions">
          <Link className="roadmap-button roadmap-button--primary" to="/roadmap/new">
            Build a roadmap <ArrowRight size={17} />
          </Link>
          <Link className="roadmap-text-link" to="/app/roadmaps">Open roadmap workspace</Link>
        </div>
        <div className="roadmap-principles" aria-label="Roadmap principles">
          <div><Sparkles size={17} /><span>Deterministic templates; no AI API required</span></div>
          <div><Compass size={17} /><span>Plans for services as well as software</span></div>
          <div><Lightbulb size={17} /><span>Estimates and assumptions are labeled</span></div>
        </div>
        <div className="roadmap-security-note">
          <ShieldAlert size={18} />
          <p>
            Roadmap drafts live only in the current page and are not saved to your account.
            Sign-in is required for private valuation reports in the founder workspace.
          </p>
        </div>
      </section>

      <section className="roadmap-examples" aria-labelledby="roadmap-examples-title">
        <div className="roadmap-section-heading">
          <p className="roadmap-eyebrow"><span /> Start from an example</p>
          <h2>One planning approach does not fit every business.</h2>
          <p>Pick a starting point or begin with your own idea. Examples only prefill the intake; no data is saved.</p>
        </div>
        <div className="roadmap-example-grid">
          {ROADMAP_EXAMPLES.map((example) => (
            <article className="roadmap-example-card" key={example.category}>
              <span>{example.label}</span>
              <p>{example.idea}</p>
              <Link
                to={`/roadmap/new?example=${example.category}`}
                aria-label={`Use ${example.label} example`}
              >
                Use as a starting point <ArrowRight size={15} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="roadmap-boundaries">
        <div>
          <p className="roadmap-eyebrow"><span /> Planning, not prediction</p>
          <h2>Keep the plan connected to real numbers.</h2>
        </div>
        <div>
          <p>Financial-planning and runway steps link to the existing calculators. Enter your own costs and actual outcomes there; a generated roadmap does not create financial projections or change a valuation.</p>
          <Link to="/valuation">Open the valuation tool <ArrowRight size={15} /></Link>
        </div>
      </section>
    </div>
  )
}

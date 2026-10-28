import { Link } from 'react-router-dom'
import { ArrowRight, CircleAlert, ClipboardList, Clock3, FileText, LineChart, Milestone, PieChart, Wallet } from 'lucide-react'

const PAGES = {
  overview: {
    title: 'Your workspace',
    description: 'A private workspace for your startup valuation and planning tools.',
    status: 'No startup data connected',
    detail: 'Startup profiles do not yet have a dedicated listing. Your saved valuation reports are available from Reports; no company metrics are fabricated here.',
  },
  startups: {
    title: 'Startups',
    description: 'Startup profiles and saved workspaces.',
    status: 'Startup listing is not available yet',
    detail: 'There is no startup list endpoint yet. You can calculate valuations and review saved reports from this account.',
  },
}

export default function WorkspacePage({ page }) {
  const content = PAGES[page]
  const isOverview = page === 'overview'

  return (
    <div className="workspace-page">
      <div className="workspace-page__heading">
        <div>
          <p className="workspace-eyebrow">FOUNDER WORKSPACE · PREVIEW</p>
          <h1>{content.title}</h1>
          <p>{content.description}</p>
        </div>
        {isOverview && (
          <div className="workspace-overview-actions">
            <Link className="workspace-primary-action" to="/valuation">Start a valuation <ArrowRight size={16} /></Link>
            <Link className="workspace-secondary-action" to="/roadmap">Build a roadmap <Milestone size={16} /></Link>
          </div>
        )}
      </div>

      <section className="workspace-empty-state" aria-labelledby="workspace-state-title">
        <span className="workspace-empty-state__icon"><CircleAlert size={20} /></span>
        <div>
          <h2 id="workspace-state-title">{content.status}</h2>
          <p>{content.detail}</p>
          {!isOverview && <Link to="/valuation" className="workspace-inline-link">Open the valuation form <ArrowRight size={15} /></Link>}
        </div>
      </section>

      {isOverview && (
        <>
          <section className="workspace-next-step">
            <p className="workspace-eyebrow">AVAILABLE TODAY</p>
            <h2>Calculate a model-based valuation</h2>
            <p>Enter your startup profile, financials, business details, and market assumptions to receive a result from the deterministic valuation engine.</p>
            <Link to="/valuation" className="workspace-inline-link">Go to valuation <ArrowRight size={15} /></Link>
          </section>
          <section className="workspace-tools-overview" aria-label="Available planning tools">
            <h2>Planning tools</h2>
            <p>Calculated in this browser session; these inputs are not saved to an account or backend plan.</p>
            <div className="workspace-tools-overview__grid">
              {[
                { label: 'Financial planner', path: '/app/financial-planner', icon: LineChart },
                { label: 'Runway', path: '/app/runway', icon: Clock3 },
                { label: 'Fundraising', path: '/app/fundraising', icon: Wallet },
                { label: 'Cap table', path: '/app/cap-table', icon: PieChart },
                { label: 'Readiness checklist', path: '/app/readiness', icon: ClipboardList },
                { label: 'Report history', path: '/app/reports', icon: FileText },
                { label: 'Startup roadmaps', path: '/app/roadmaps', icon: Milestone },
              ].map(({ label, path, icon: Icon }) => (
                <Link to={path} key={path}>
                  <Icon size={17} />
                  <span>{label}</span>
                  <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

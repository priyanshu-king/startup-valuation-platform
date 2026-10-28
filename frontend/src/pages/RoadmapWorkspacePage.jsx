import { ArrowRight, CircleAlert, LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'

const COPY = {
  list: {
    eyebrow: 'ROADMAPS · WORKSPACE PREVIEW',
    title: 'Saved roadmaps',
    description: 'Roadmap drafts are not stored yet. Authentication and an owner-scoped backend API are required before private roadmap records can be saved or listed.',
    status: 'No saved roadmaps are available',
    detail: 'Build an editable draft to explore the deterministic roadmap templates. Leaving the builder clears its unsaved plan.',
  },
  detail: {
    eyebrow: 'ROADMAP · WORKSPACE PREVIEW',
    title: 'Roadmap workspace',
    description: 'A persistent, private roadmap workspace is not available in this build.',
    status: 'This roadmap cannot be loaded',
    detail: 'There is no roadmap database model or owner-authorized detail endpoint. No private records are exposed by this route.',
  },
  progress: {
    eyebrow: 'PROGRESS · WORKSPACE PREVIEW',
    title: 'Roadmap progress',
    description: 'Task completion and milestone progress require saved, authenticated roadmap records.',
    status: 'No progress data is stored',
    detail: 'This preview does not create progress percentages from a generated plan. Future progress will be calculated from actual task states.',
  },
}

export default function RoadmapWorkspacePage({ view = 'list' }) {
  const content = COPY[view] ?? COPY.list
  return (
    <div className="workspace-page roadmap-workspace">
      <div className="workspace-page__heading">
        <div>
          <p className="workspace-eyebrow">{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p>{content.description}</p>
        </div>
        {view === 'list' && <Link className="workspace-primary-action" to="/roadmap/new">Build a roadmap <ArrowRight size={16} /></Link>}
      </div>
      <section className="workspace-empty-state" aria-labelledby="roadmap-workspace-state">
        <span className="workspace-empty-state__icon"><CircleAlert size={20} /></span>
        <div>
          <h2 id="roadmap-workspace-state">{content.status}</h2>
          <p>{content.detail}</p>
          {view !== 'list' && <Link to="/app/roadmaps" className="workspace-inline-link">Back to roadmaps <ArrowRight size={15} /></Link>}
        </div>
      </section>
      <section className="roadmap-auth-dependency">
        <LockKeyhole size={18} />
        <div>
          <strong>Authentication is a required dependency</strong>
          <p>Roadmap storage is intentionally disabled until the application can authenticate users and verify record ownership on every server request. Do not use the preview for confidential information.</p>
        </div>
      </section>
      {view === 'list' && (
        <section className="roadmap-workspace-cta">
          <h2>Explore a sample plan without saving it</h2>
          <p>The deterministic builder creates an editable draft in the current page session. It does not create an account record or claim task progress.</p>
          <Link className="workspace-inline-link" to="/roadmap">Learn about the roadmap builder <ArrowRight size={15} /></Link>
        </section>
      )}
    </div>
  )
}

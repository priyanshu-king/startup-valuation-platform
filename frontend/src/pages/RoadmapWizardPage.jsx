import { cloneElement, useEffect, useId, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CircleAlert, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { generateRoadmap } from '@/services/roadmapGenerator'
import { ROADMAP_EXAMPLES } from '@/services/roadmapExamples'

const STEPS = ['Idea', 'Stage & audience', 'Time & resources']
const CATEGORY_OPTIONS = [
  ['saas', 'SaaS or web application'],
  ['mobile_app', 'Mobile app'],
  ['marketplace', 'Marketplace'],
  ['ecommerce', 'E-commerce'],
  ['local_service', 'Local service business'],
  ['consulting', 'Consulting or professional service'],
  ['other', 'Other business'],
]

const INITIAL_VALUES = {
  idea: '',
  targetCustomers: '',
  category: '',
  businessModel: '',
  geography: '',
  budgetInr: '',
  hoursPerWeek: '6',
  stage: 'idea',
  teamSize: '',
  skills: '',
  launchTimeline: '',
}

function Field({ label, optional = false, hint, children }) {
  const id = useId()
  return (
    <div className="roadmap-field">
      <label htmlFor={id}>{label}{optional && <span> · Optional</span>}</label>
      {cloneElement(children, { id })}
      {hint && <p>{hint}</p>}
    </div>
  )
}

function RoadmapTask({ task, taskNames, onUpdate, onRemove }) {
  return (
    <article className="roadmap-task-card">
      <div className="roadmap-task-card__top">
        <span className={`roadmap-priority roadmap-priority--${task.priority}`}>{task.priority} priority</span>
        <button type="button" className="roadmap-icon-button" onClick={onRemove} aria-label={`Remove ${task.title}`}>
          <Trash2 size={15} />
        </button>
      </div>
      <label className="roadmap-edit-label">
        Task
        <input value={task.title} onChange={(event) => onUpdate({ title: event.target.value })} />
      </label>
      <label className="roadmap-edit-label">
        Instructions
        <textarea value={task.instructions} onChange={(event) => onUpdate({ instructions: event.target.value, description: event.target.value })} rows={3} />
      </label>
      <div className="roadmap-task-meta">
        <span>~{task.estimatedHours} effort hours · estimate</span>
        <span>Target {task.targetDate}</span>
      </div>
      <p className="roadmap-task-detail"><strong>Finish when:</strong> {task.completionCriteria}</p>
      <p className="roadmap-task-detail"><strong>Measure:</strong> {task.successMetric}</p>
      <p className="roadmap-task-detail"><strong>Skills/resources:</strong> {task.requiredSkills.join(', ')}</p>
      <p className="roadmap-task-cost">{task.costNote}</p>
      {task.dependencies.length > 0 && (
        <p className="roadmap-task-dependency">Depends on: {task.dependencies.map((id) => taskNames[id] ?? id).join(', ')}</p>
      )}
      {task.tool && <Link className="roadmap-task-tool" to={task.tool.href}>{task.tool.label} <ArrowRight size={14} /></Link>}
    </article>
  )
}

function GeneratedRoadmap({ roadmap, setRoadmap, onReset }) {
  const taskCount = roadmap.tasks.length
  const handleUpdate = (phaseId, taskId, updates) => {
    setRoadmap((current) => {
      const phases = current.phases.map((phase) => phase.id === phaseId
        ? { ...phase, tasks: phase.tasks.map((task) => task.id === taskId ? { ...task, ...updates } : task) }
        : phase)
      return { ...current, phases, tasks: phases.flatMap((phase) => phase.tasks) }
    })
  }
  const handleRemove = (phaseId, taskId) => {
    setRoadmap((current) => {
      const phases = current.phases.map((phase) => phase.id === phaseId
        ? { ...phase, tasks: phase.tasks.filter((task) => task.id !== taskId) }
        : phase)
      const remainingIds = new Set(phases.flatMap((phase) => phase.tasks.map((task) => task.id)))
      const cleanedPhases = phases.map((phase) => ({
        ...phase,
        tasks: phase.tasks.map((task) => ({
          ...task,
          dependencies: task.dependencies.filter((dependency) => remainingIds.has(dependency)),
        })),
      }))
      return { ...current, phases: cleanedPhases, tasks: cleanedPhases.flatMap((phase) => phase.tasks) }
    })
  }
  const handleAdd = (phase) => {
    setRoadmap((current) => {
      const task = {
        id: `custom-${Date.now()}`,
        title: 'Add your next action',
        description: '',
        instructions: '',
        estimatedHours: 0,
        startDate: new Date().toISOString().slice(0, 10),
        targetDate: new Date().toISOString().slice(0, 10),
        dependencies: [],
        priority: 'medium',
        requiredSkills: [],
        costEstimateInr: null,
        costNote: 'Enter costs only when supported by a quote or your own budget assumption.',
        completionCriteria: 'Describe a clear, observable completion condition.',
        successMetric: 'Choose a measure that reflects an actual outcome.',
        status: 'not_started',
        tool: null,
      }
      const phases = current.phases.map((item) => item.id === phase.id
        ? { ...item, tasks: [...item.tasks, task] }
        : item)
      return { ...current, phases, tasks: phases.flatMap((item) => item.tasks) }
    })
  }
  const taskNames = Object.fromEntries(roadmap.tasks.map((task) => [task.id, task.title]))

  return (
    <div className="roadmap-result">
      <div className="roadmap-result__heading">
        <div>
          <p className="roadmap-eyebrow"><span /> Editable draft · not saved</p>
          <h1>{roadmap.title}</h1>
          <p>{roadmap.categoryLabel} · {roadmap.businessModel} · {roadmap.stage} stage</p>
        </div>
        <button type="button" className="roadmap-button roadmap-button--outline" onClick={onReset}>
          <RotateCcw size={15} /> Start over
        </button>
      </div>

      <div className="roadmap-summary-grid">
        <div><span>Plan effort</span><strong>~{roadmap.totalEstimatedHours} hours</strong></div>
        <div><span>At your availability</span><strong>~{roadmap.totalEstimatedWeeks} weeks</strong></div>
        <div><span>Draft actions</span><strong>{taskCount} tasks</strong></div>
        <div><span>Target date estimate</span><strong>{roadmap.targetDate}</strong></div>
      </div>
      <div className="roadmap-information">
        <CircleAlert size={17} />
        <p>This editable roadmap draft exists only in this page session. Roadmap saving and progress tracking are not implemented. Task completion is not inferred.</p>
      </div>
      <div className="roadmap-guidance"><strong>Fit for your business:</strong> {roadmap.categoryGuidance}</div>
      <div className="roadmap-guidance"><strong>Stage focus:</strong> {roadmap.stageGuidance}</div>

      <section className="roadmap-plan" aria-label="Generated startup roadmap">
        {roadmap.phases.map((phase, phaseIndex) => (
          <section className="roadmap-phase" key={phase.id}>
            <header className="roadmap-phase__heading">
              <span>{String(phaseIndex + 1).padStart(2, '0')}</span>
              <div><h2>{phase.name}</h2><p>{phase.milestone}</p></div>
              <time dateTime={phase.targetDate}>{phase.targetDate}</time>
            </header>
            <div className="roadmap-task-list">
              {phase.tasks.map((task) => (
                <RoadmapTask
                  key={task.id}
                  task={task}
                  taskNames={taskNames}
                  onUpdate={(updates) => handleUpdate(phase.id, task.id, updates)}
                  onRemove={() => handleRemove(phase.id, task.id)}
                />
              ))}
              <button type="button" className="roadmap-add-task" onClick={() => handleAdd(phase)}>
                <Plus size={15} /> Add a task to {phase.name.toLowerCase()}
              </button>
            </div>
          </section>
        ))}
      </section>

      <section className="roadmap-assumptions">
        <h2>Assumptions and limits</h2>
        <ul>{roadmap.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>
        <p>{roadmap.costDisclosure}</p>
        <p><strong>Resource note:</strong> {roadmap.resourceGuidance}</p>
        <h3>Risks to review</h3>
        <ul>{roadmap.risks.map((risk) => <li key={risk}>{risk}</li>)}</ul>
      </section>
      <div className="roadmap-related-tools">
        <h2>Use your actual numbers</h2>
        <p>These links open existing tools. A roadmap action or completion never changes financial results automatically.</p>
        <div>
          <Link to="/app/financial-planner">Financial planner <ArrowRight size={14} /></Link>
          <Link to="/app/runway">Runway calculator <ArrowRight size={14} /></Link>
          <Link to="/valuation">Recalculate valuation <ArrowRight size={14} /></Link>
          <Link to="/app/reports">Report history <ArrowRight size={14} /></Link>
        </div>
      </div>
    </div>
  )
}

export default function RoadmapWizardPage() {
  const [searchParams] = useSearchParams()
  const example = ROADMAP_EXAMPLES.find((item) => item.category === searchParams.get('example'))
  const [values, setValues] = useState(INITIAL_VALUES)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [roadmap, setRoadmap] = useState(null)

  useEffect(() => {
    setValues({
      ...INITIAL_VALUES,
      ...(example ? {
      idea: example.idea,
      targetCustomers: example.customers,
      category: example.category,
      businessModel: example.category === 'consulting' || example.category === 'local_service' ? 'service' : '',
      } : {}),
    })
    setStep(0)
    setError('')
    setRoadmap(null)
  }, [example])

  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }))
  const stepError = () => {
    if (step === 0) {
      if (values.idea.trim().length < 20) return 'Add at least 20 characters about the idea so the plan has enough context.'
      if (!values.category) return 'Choose the business type that best fits your idea.'
    }
    if (step === 1 && !values.stage) return 'Choose the stage that best describes your business today.'
    if (step === 2) {
      const hours = Number(values.hoursPerWeek)
      if (!Number.isFinite(hours) || hours < 1 || hours > 80) return 'Enter between 1 and 80 available hours per week.'
      const team = Number(values.teamSize)
      if (values.teamSize !== '' && (!Number.isInteger(team) || team < 1 || team > 1000)) return 'Enter a whole team size from 1 to 1,000 or leave it blank.'
      if (values.budgetInr !== '' && (!Number.isFinite(Number(values.budgetInr)) || Number(values.budgetInr) < 0)) return 'Starting budget must be a non-negative INR amount.'
    }
    return ''
  }
  const next = () => {
    const message = stepError()
    if (message) {
      setError(message)
      return
    }
    setError('')
    setStep((current) => Math.min(current + 1, STEPS.length - 1))
  }
  const build = (event) => {
    event.preventDefault()
    const message = stepError()
    if (message) {
      setError(message)
      return
    }
    try {
      setRoadmap(generateRoadmap(values))
      setError('')
    } catch (generationError) {
      setError(generationError.message)
    }
  }
  const startOver = () => {
    setRoadmap(null)
    setStep(0)
    setError('')
  }

  if (roadmap) return (
    <main className="roadmap-builder roadmap-builder--result">
      <GeneratedRoadmap roadmap={roadmap} setRoadmap={setRoadmap} onReset={startOver} />
    </main>
  )

  return (
    <main className="roadmap-builder">
      <Link to="/roadmap" className="roadmap-back-link"><ArrowLeft size={15} /> Roadmap overview</Link>
      <div className="roadmap-builder__intro">
        <p className="roadmap-eyebrow"><span /> Build your plan</p>
        <h1>Start with what you know.</h1>
        <p>Answer a few useful questions. Skip anything you are unsure about; the plan will call out missing information instead of making it up.</p>
      </div>
      <div className="roadmap-stepper" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
        {STEPS.map((label, index) => (
          <div key={label} className={`roadmap-step${index === step ? ' is-active' : ''}${index < step ? ' is-done' : ''}`}>
            <span>{index < step ? <Check size={15} /> : index + 1}</span><b>{label}</b>
          </div>
        ))}
      </div>

      <form className="roadmap-form" onSubmit={step === STEPS.length - 1 ? build : (event) => { event.preventDefault(); next() }}>
        {error && <div className="roadmap-form-error" role="alert"><CircleAlert size={17} />{error}</div>}
        {step === 0 && (
          <section className="roadmap-form-step">
            <h2>Describe the idea</h2>
            <p>Tell us what you hope to offer and whose problem it might solve. Plain language is enough.</p>
            <Field label="Your business idea" hint="At least 20 characters. Avoid confidential details.">
              <textarea maxLength={2000} rows={5} value={values.idea} onChange={(event) => update('idea', event.target.value)} placeholder="I want to help [customer] solve [problem] by offering…" />
            </Field>
            <div className="roadmap-field-grid">
              <Field label="Business type">
                <select value={values.category} onChange={(event) => update('category', event.target.value)}>
                  <option value="">Choose a business type</option>
                  {CATEGORY_OPTIONS.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                </select>
              </Field>
              <Field label="Business model" optional hint="Choose what best describes how you expect to earn revenue.">
                <select value={values.businessModel} onChange={(event) => update('businessModel', event.target.value)}>
                  <option value="">Not sure yet</option>
                  <option value="subscription">Subscription</option>
                  <option value="one_time">One-time sales</option>
                  <option value="commission">Commission or marketplace fee</option>
                  <option value="product_sales">Product sales</option>
                  <option value="service">Service fees</option>
                  <option value="other">Other or undecided</option>
                </select>
              </Field>
              <Field label="Target customers" optional hint="If unsure, leave this blank; the plan will flag it for research.">
                <input maxLength={300} value={values.targetCustomers} onChange={(event) => update('targetCustomers', event.target.value)} placeholder="e.g. Independent tutors in my city" />
              </Field>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="roadmap-form-step">
            <h2>Set the context</h2>
            <p>These details make the tasks more relevant. You can skip the geography if you are still exploring.</p>
            <div className="roadmap-field-grid">
              <Field label="Current stage">
                <select required value={values.stage} onChange={(event) => update('stage', event.target.value)}>
                  <option value="idea">Idea — exploring the opportunity</option>
                  <option value="validation">Validation — talking to customers</option>
                  <option value="mvp">MVP — testing a first offer</option>
                  <option value="launched">Launched — serving customers</option>
                  <option value="growing">Growing — improving what works</option>
                </select>
              </Field>
              <Field label="Target geography" optional hint="Location affects rules, costs, and customer channels; none are assumed when blank.">
                <input maxLength={200} value={values.geography} onChange={(event) => update('geography', event.target.value)} placeholder="e.g. Bengaluru, India" />
              </Field>
            </div>
            <div className="roadmap-stage-note">
              <CircleAlert size={16} />
              <p>The plan will not mark work complete based on your stage selection. Review each task and count it as done only if you have actually completed it.</p>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="roadmap-form-step">
            <h2>Plan around your resources</h2>
            <p>Time estimates are planning assumptions. We leave costs blank unless you provide your own budget.</p>
            <div className="roadmap-field-grid">
              <Field label="Available time each week" hint="Used to estimate dates, not to judge progress. The form starts with a 6-hour/week assumption; adjust it to fit your schedule.">
                <input type="number" min="1" max="80" step="1" value={values.hoursPerWeek} onChange={(event) => update('hoursPerWeek', event.target.value)} />
              </Field>
              <Field label="Starting budget (INR)" optional hint="An amount you enter is treated as your assumption, not a verified balance.">
                <input type="number" min="0" step="1000" value={values.budgetInr} onChange={(event) => update('budgetInr', event.target.value)} placeholder="Leave blank if unknown" />
              </Field>
              <Field label="Team size" optional hint="Include yourself if working alone.">
                <input type="number" min="1" max="1000" step="1" value={values.teamSize} onChange={(event) => update('teamSize', event.target.value)} />
              </Field>
              <Field label="Skills already available" optional hint="The generated plan will note these; it will not assume someone is assigned.">
                <input maxLength={500} value={values.skills} onChange={(event) => update('skills', event.target.value)} placeholder="e.g. Design, sales, bookkeeping" />
              </Field>
              <Field label="Preferred launch timeline" optional hint="Your target is compared with the estimated plan dates.">
                <select value={values.launchTimeline} onChange={(event) => update('launchTimeline', event.target.value)}>
                  <option value="">Not sure yet</option>
                  <option value="within 1 month">Within 1 month</option>
                  <option value="1-3 months">1–3 months</option>
                  <option value="3-6 months">3–6 months</option>
                  <option value="6-12 months">6–12 months</option>
                  <option value="more than 12 months">More than 12 months</option>
                </select>
              </Field>
            </div>
            <div className="roadmap-review-box">
              <strong>Before generating</strong>
              <p>{values.category ? CATEGORY_OPTIONS.find(([value]) => value === values.category)?.[1] : 'Business type not selected'} · {values.stage} stage · {values.hoursPerWeek || '—'} hours/week</p>
              <span>Your draft will be editable and available only in this browser page session. It will not be saved to an account.</span>
            </div>
          </section>
        )}

        <div className="roadmap-form-actions">
          {step > 0
            ? <button className="roadmap-button roadmap-button--outline" type="button" onClick={() => { setError(''); setStep((current) => current - 1) }}><ArrowLeft size={15} /> Back</button>
            : <Link className="roadmap-text-link" to="/roadmap">Cancel</Link>}
          {step < STEPS.length - 1
            ? <button className="roadmap-button roadmap-button--primary" type="submit">Continue <ArrowRight size={16} /></button>
            : <button className="roadmap-button roadmap-button--primary" type="submit">Generate editable plan <ArrowRight size={16} /></button>}
        </div>
      </form>
    </main>
  )
}

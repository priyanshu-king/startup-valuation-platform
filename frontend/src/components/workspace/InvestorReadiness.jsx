import { useEffect, useState } from 'react'
import { calculateCompletionProgress } from '@/services/financialCalculations'
import { ToolCard, ToolNotice, ToolPage } from './ToolUi'

const STORAGE_KEY = 'startup-valuation-readiness-checklist-v1'

const DEFAULT_ITEMS = [
  { id: 'corporate-records', category: 'Company', task: 'Company incorporation and statutory records are organized.' },
  { id: 'ownership-records', category: 'Company', task: 'Founder and shareholder ownership records are up to date.' },
  { id: 'financial-statements', category: 'Financials', task: 'Historical financial statements are available for review.' },
  { id: 'cash-forecast', category: 'Financials', task: 'A cash-flow forecast and runway assumptions are documented.' },
  { id: 'revenue-evidence', category: 'Business', task: 'Revenue and customer metrics can be reconciled to source records.' },
  { id: 'unit-economics', category: 'Business', task: 'Customer acquisition and retention assumptions are documented.' },
  { id: 'market-evidence', category: 'Market', task: 'Market-size assumptions have traceable sources.' },
  { id: 'product-security', category: 'Product & risk', task: 'Product, security, and material risk information is documented.' },
  { id: 'fundraising-materials', category: 'Fundraising', task: 'Fundraising goals and use-of-funds assumptions are prepared.' },
]

const STATUSES = [
  { value: 'not_started', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
]

function readChecklist() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return { items: DEFAULT_ITEMS.map((item) => ({ ...item, status: 'not_started', notes: '' })), error: '' }
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed) || parsed.length !== DEFAULT_ITEMS.length) throw new Error('Saved checklist format is not supported.')
    const items = DEFAULT_ITEMS.map((item) => {
      const savedItem = parsed.find((entry) => entry.id === item.id)
      if (!savedItem || !STATUSES.some((status) => status.value === savedItem.status)) {
        throw new Error('Saved checklist contains invalid status data.')
      }
      return { ...item, status: savedItem.status, notes: String(savedItem.notes ?? '') }
    })
    return { items, error: '' }
  } catch {
    return {
      items: DEFAULT_ITEMS.map((item) => ({ ...item, status: 'not_started', notes: '' })),
      error: 'The saved checklist could not be read. Changes can still be used during this session.',
    }
  }
}

export default function InvestorReadiness() {
  const [initial] = useState(readChecklist)
  const [items, setItems] = useState(initial.items)
  const [storageError, setStorageError] = useState(initial.error)
  const [hasUserChanges, setHasUserChanges] = useState(false)
  const progress = calculateCompletionProgress(items)
  const categories = [...new Set(items.map((item) => item.category))]

  useEffect(() => {
    if (!hasUserChanges) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map(({ id, status, notes }) => ({ id, status, notes }))))
      setStorageError('')
    } catch {
      setStorageError('Checklist changes could not be saved in this browser. They will be lost when you leave this page.')
    }
  }, [items, hasUserChanges])

  const update = (id, field, value) => {
    setHasUserChanges(true)
    setItems((previous) => previous.map((item) => item.id === id ? { ...item, [field]: value } : item))
  }

  return (
    <ToolPage
      title="Investor readiness"
      description="Use this editable preparation checklist to track documents and assumptions. It is not a diligence review or readiness certification."
    >
      <ToolCard title="Checklist progress" description={`${items.filter((item) => item.status === 'done').length} of ${items.length} items marked complete.`}>
        <div className="workspace-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Checklist completion">
          <span style={{ width: `${progress}%` }} />
        </div>
        <p className="workspace-progress__label">{progress}% complete</p>
        {storageError && <p className="workspace-tool-error" role="alert">{storageError}</p>}
      </ToolCard>
      {categories.map((category) => (
        <ToolCard key={category} title={category}>
          <div className="workspace-checklist">
            {items.filter((item) => item.category === category).map((item) => (
              <article key={item.id} className="workspace-checklist-item">
                <div className="workspace-checklist-item__task">
                  <label htmlFor={`readiness-status-${item.id}`}>{item.task}</label>
                  <select id={`readiness-status-${item.id}`} value={item.status} onChange={(event) => update(item.id, 'status', event.target.value)}>
                    {STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                  </select>
                </div>
                <label className="workspace-visually-hidden" htmlFor={`readiness-note-${item.id}`}>Notes for {item.task}</label>
                <textarea id={`readiness-note-${item.id}`} value={item.notes} maxLength={500} placeholder="Optional notes (stored in this browser only)" onChange={(event) => update(item.id, 'notes', event.target.value)} />
              </article>
            ))}
          </div>
        </ToolCard>
      ))}
      <ToolNotice>Checklist statuses and notes are stored only in this browser’s local storage; there is no account, server-side persistence, or private workspace synchronization.</ToolNotice>
    </ToolPage>
  )
}

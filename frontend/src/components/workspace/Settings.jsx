import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bell,
  Building2,
  Check,
  CircleHelp,
  CreditCard,
  Download,
  FileText,
  LockKeyhole,
  Palette,
  RotateCcw,
  Settings2,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  loadSettings,
  normalizeSettings,
  resetSettings,
  saveSettings,
  SETTINGS_STORAGE_KEY,
  validateSettings,
} from '@/services/userSettings'
import packageInfo from '../../../package.json'
import { ToolAction, ToolError, ToolNotice, ToolPage } from './ToolUi'
import './settings.css'

const SECTIONS = [
  { id: 'profile', label: 'Profile & account', icon: UserRound },
  { id: 'workspace', label: 'Workspace', icon: Building2 },
  { id: 'preferences', label: 'Financial preferences', icon: Settings2 },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security & privacy', icon: LockKeyhole },
  { id: 'data', label: 'Data management', icon: Download },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'plan', label: 'Plan & billing', icon: CreditCard },
  { id: 'help', label: 'Help & about', icon: CircleHelp },
]

const INDUSTRIES = [
  ['saas', 'SaaS / software'],
  ['marketplace', 'Marketplace'],
  ['ecommerce', 'E-commerce'],
  ['fintech', 'Fintech'],
  ['edtech', 'Education'],
  ['healthtech', 'Healthcare'],
  ['other', 'Other'],
]

const STAGES = [
  ['idea', 'Idea'],
  ['pre_seed', 'Pre-seed'],
  ['seed', 'Seed'],
  ['series_a', 'Series A'],
  ['series_b', 'Series B'],
  ['series_c_plus', 'Series C+'],
]

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function initials(name) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  return words.length
    ? words.slice(0, 2).map((word) => word[0].toUpperCase()).join('')
    : 'F'
}

function Field({ label, value, onChange, type = 'text', maxLength, placeholder, readOnly = false, hint }) {
  const id = `settings-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <div className="settings-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {hint && <p id={`${id}-hint`} className="settings-field__hint">{hint}</p>}
    </div>
  )
}

function SelectField({ label, value, onChange, options, hint }) {
  const id = `settings-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <div className="settings-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} aria-describedby={hint ? `${id}-hint` : undefined}>
        {options.map(([optionValue, optionLabel]) => (
          <option value={optionValue} key={optionValue}>{optionLabel}</option>
        ))}
      </select>
      {hint && <p id={`${id}-hint`} className="settings-field__hint">{hint}</p>}
    </div>
  )
}

function Toggle({ label, description, checked, onChange }) {
  const id = `settings-toggle-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <div className="settings-toggle-row">
      <div>
        <label htmlFor={id}>{label}</label>
        <p>{description}</p>
      </div>
      <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </div>
  )
}

export default function Settings() {
  const { user } = useAuth()
  const [initial] = useState(loadSettings)
  const [saved, setSaved] = useState(initial.settings)
  const [draft, setDraft] = useState(initial.settings)
  const [activeSection, setActiveSection] = useState('profile')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState(initial.error)
  const [resetOpen, setResetOpen] = useState(false)
  const resetDialog = useRef(null)
  const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(draft), [saved, draft])

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      const theme = draft.appearance.theme === 'system'
        ? (media?.matches ? 'dark' : 'light')
        : draft.appearance.theme
      root.dataset.theme = theme
      root.style.colorScheme = theme
    }

    applyTheme()
    media?.addEventListener?.('change', applyTheme)
    return () => media?.removeEventListener?.('change', applyTheme)
  }, [draft.appearance.theme])

  useEffect(() => () => {
    const root = document.documentElement
    const storedTheme = loadSettings().settings.appearance.theme
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    const theme = storedTheme === 'system' ? (media?.matches ? 'dark' : 'light') : storedTheme
    root.dataset.theme = theme
    root.style.colorScheme = theme
  }, [])

  useEffect(() => {
    const dialog = resetDialog.current
    if (!dialog) return
    if (resetOpen && !dialog.open) dialog.showModal()
    if (!resetOpen && dialog.open) dialog.close()
  }, [resetOpen])

  function update(group, key, value) {
    setDraft((current) => ({
      ...current,
      [group]: { ...current[group], [key]: value },
    }))
    setError('')
    setNotice('')
  }

  function save(event) {
    event.preventDefault()
    const validationError = validateSettings(draft)
    if (validationError) {
      setError(validationError)
      setNotice('')
      return
    }
    try {
      saveSettings(draft)
      const normalized = normalizeSettings(draft)
      setSaved(normalized)
      setDraft(normalized)
      setError('')
      setNotice('Your preferences were saved in this browser.')
    } catch (saveError) {
      setError(saveError.message || 'Settings could not be saved in this browser.')
      setNotice('')
    }
  }

  function cancel() {
    setDraft(normalizeSettings(saved))
    setError('')
    setNotice('Unsaved changes were discarded.')
  }

  function exportSettings() {
    try {
      const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
      const payload = {
        product: 'Startup Valuation',
        version: packageInfo.version,
        exportedAt: new Date().toISOString(),
        scope: 'Browser-stored profile, workspace labels, preferences, appearance, and notification settings only. No account credentials, financial inputs, or server reports are included.',
        settings: stored ? normalizeSettings(JSON.parse(stored)) : normalizeSettings(saved),
      }
      const objectUrl = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }))
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = 'startup-valuation-settings.json'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
      setError('')
      setNotice('The browser-stored settings export was prepared.')
    } catch {
      setError('Settings could not be exported from this browser.')
      setNotice('')
    }
  }

  function reset() {
    try {
      const defaults = resetSettings()
      setSaved(defaults)
      setDraft(defaults)
      setError('')
      setNotice('Browser-stored settings were reset. Server reports were not changed.')
      setResetOpen(false)
    } catch {
      setError('Browser settings could not be reset.')
      setNotice('')
    }
  }

  const section = SECTIONS.find((item) => item.id === activeSection) ?? SECTIONS[0]
  const initialsText = initials(draft.profile.fullName)

  return (
    <ToolPage
      title="Settings"
      description="Manage your workspace, preferences and data."
    >
      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          <p>SETTINGS</p>
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              className={activeSection === id ? 'is-active' : ''}
              aria-current={activeSection === id ? 'page' : undefined}
              onClick={() => { setActiveSection(id); setNotice('') }}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <form className="settings-panel" onSubmit={save} noValidate>
          <header className="settings-panel__heading">
            <div className="settings-panel__icon"><section.icon size={18} aria-hidden="true" /></div>
            <div>
              <h2>{section.label}</h2>
              <p>Changes in this section are saved to this browser only.</p>
            </div>
          </header>

          {activeSection === 'profile' && (
            <div className="settings-section">
              <ToolNotice>Account sign-in is active. Profile details below are browser-only preferences; the email address comes from your authenticated account and cannot be changed here.</ToolNotice>
              <div className="settings-avatar-row">
                <span className="settings-avatar" aria-label={`Initials avatar ${initialsText}`}>{initialsText}</span>
                <div><strong>Initials avatar</strong><p>Generated from your display name. Image uploads are not available.</p></div>
              </div>
              <div className="settings-grid">
                <Field label="Full name" value={draft.profile.fullName} onChange={(value) => update('profile', 'fullName', value)} maxLength={80} placeholder="Your name" />
                <Field label="Email address" value={user?.email ?? ''} readOnly type="email" hint="Managed by your signed-in account." />
                <Field label="Job title / founder role" value={draft.profile.role} onChange={(value) => update('profile', 'role', value)} maxLength={80} placeholder="e.g. Co-founder" />
              </div>
            </div>
          )}

          {activeSection === 'workspace' && (
            <div className="settings-section">
              <ToolNotice>Workspace and company details are labels stored in this browser. They do not update a server company profile.</ToolNotice>
              <div className="settings-avatar-row">
                <span className="settings-workspace-logo" aria-hidden="true"><Building2 size={20} /></span>
                <div><strong>Workspace mark</strong><p>Default icon placeholder. Logo upload is not available.</p></div>
              </div>
              <div className="settings-grid">
                <Field label="Workspace name" value={draft.workspace.name} onChange={(value) => update('workspace', 'name', value)} maxLength={80} placeholder="Founder workspace" />
                <Field label="Startup / company name" value={draft.workspace.companyName} onChange={(value) => update('workspace', 'companyName', value)} maxLength={120} placeholder="Company name (optional)" />
                <SelectField label="Industry" value={draft.workspace.industry} onChange={(value) => update('workspace', 'industry', value)} options={INDUSTRIES} />
                <SelectField label="Company stage" value={draft.workspace.stage} onChange={(value) => update('workspace', 'stage', value)} options={STAGES} />
                <Field label="Company website" type="url" value={draft.workspace.website} onChange={(value) => update('workspace', 'website', value)} maxLength={200} placeholder="https://example.com" hint="Optional. Use a complete https:// or http:// address." />
              </div>
            </div>
          )}

          {activeSection === 'preferences' && (
            <div className="settings-section">
              <p className="settings-intro">Currency and forecast period are used by Financial Planner and Runway. Currency changes formatting only; it does not convert values or change calculations. Valuation results remain in INR under the existing engine.</p>
              <div className="settings-grid">
                <SelectField label="Default currency" value={draft.preferences.currency} onChange={(value) => update('preferences', 'currency', value)} options={['INR', 'USD', 'GBP', 'EUR'].map((currency) => [currency, currency])} />
                <SelectField label="Financial year starts" value={String(draft.preferences.financialYearStartMonth)} onChange={(value) => update('preferences', 'financialYearStartMonth', Number(value))} options={MONTHS.map((month, index) => [String(index + 1), month])} hint="Saved as a preference; monthly forecasts are rolling and are not grouped by financial year." />
                <SelectField label="Date format" value={draft.preferences.dateFormat} onChange={(value) => update('preferences', 'dateFormat', value)} options={['DD MMM YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map((format) => [format, format])} hint="Applied to report-history dates." />
                <SelectField label="Default forecast period" value={String(draft.preferences.forecastMonths)} onChange={(value) => update('preferences', 'forecastMonths', Number(value))} options={[6, 12, 24, 36].map((months) => [String(months), `${months} months`])} hint="Prefills the Financial Planner and Runway forecast period." />
              </div>
              <div className="settings-fixed-preference">
                <span>Default valuation method</span>
                <strong>Automatic model blend</strong>
                <p>The existing valuation engine selects applicable methods automatically. Choosing a different method is not supported.</p>
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="settings-section">
              <p className="settings-intro">The selected theme applies to the founder workspace and follows your device when System is selected.</p>
              <fieldset className="settings-theme-options">
                <legend>Choose appearance</legend>
                {[
                  ['light', 'Light', 'Bright surfaces and dark text'],
                  ['dark', 'Dark', 'Dark surfaces and light text'],
                  ['system', 'System', 'Match your device preference'],
                ].map(([value, label, description]) => (
                  <label key={value} className={draft.appearance.theme === value ? 'is-selected' : ''}>
                    <input type="radio" name="settings-theme" value={value} checked={draft.appearance.theme === value} onChange={() => update('appearance', 'theme', value)} />
                    <span><strong>{label}</strong><small>{description}</small></span>
                  </label>
                ))}
              </fieldset>
              <ToolNotice>Theme preview applies immediately. Save to keep the selection after refresh; Cancel restores your last saved theme.</ToolNotice>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="settings-section">
              <ToolNotice tone="warning">Security status is descriptive, not a certification. Hosting, TLS termination, database access, retention, and backups must be verified by the operator before production use.</ToolNotice>
              <dl className="settings-status-list">
                <div><dt>Authentication</dt><dd><span className="settings-status settings-status--configured">Configured</span><p>Account registration and sign-in use Argon2 password hashes.</p></dd></div>
                <div><dt>Authorization & data isolation</dt><dd><span className="settings-status settings-status--configured">Implemented for valuation reports</span><p>Valuations and report endpoints enforce owner-scoped access. Roadmap drafts and financial tool inputs are not server-persisted.</p></dd></div>
                <div><dt>Session management</dt><dd><span className="settings-status settings-status--configured">Configured</span><p>Revocable database-backed HttpOnly sessions; session lifetime is configured by the backend.</p></dd></div>
                <div><dt>Browser connection</dt><dd><span className={`settings-status ${window.location.protocol === 'https:' ? 'settings-status--configured' : 'settings-status--warning'}`}>{window.location.protocol === 'https:' ? 'HTTPS' : 'HTTP / local preview'}</span><p>This describes the page connection only. Verify API transport, TLS termination, and trusted origins in production.</p></dd></div>
                <div><dt>Database backups</dt><dd><span className="settings-status settings-status--warning">Not verified in this app</span><p>Backup scheduling and restore testing are operator responsibilities and are not configured here.</p></dd></div>
                <div><dt>Privacy & retention</dt><dd><span className="settings-status settings-status--warning">No automatic retention policy</span><p>Valuation reports remain until deleted from Reports. Review the <Link to="/privacy">Privacy page</Link>.</p></dd></div>
              </dl>
            </div>
          )}

          {activeSection === 'data' && (
            <div className="settings-section">
              <div className="settings-data-summary">
                <h3>Where your data lives</h3>
                <ul>
                  <li><strong>This browser:</strong> profile display name, workspace labels, preferences, appearance, and notification selections.</li>
                  <li><strong>Backend database:</strong> authenticated valuations and report records. Financial planner and runway inputs are session-only.</li>
                  <li><strong>Not included:</strong> passwords, secrets, financial inputs, PDFs, or server-side reports in the browser settings export.</li>
                </ul>
              </div>
              <ToolNotice tone="warning">Browser storage is not encrypted backup storage. This page does not delete database records or financial reports.</ToolNotice>
              <div className="settings-actions-inline">
                <ToolAction type="button" onClick={exportSettings}><Download size={15} /> Export browser settings (JSON)</ToolAction>
                <button className="settings-danger-action" type="button" onClick={() => setResetOpen(true)}><RotateCcw size={15} /> Reset browser settings</button>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="settings-section">
              <ToolNotice>Email delivery is not implemented. These choices are stored in this browser and do not send messages.</ToolNotice>
              <div className="settings-toggle-list">
                <Toggle label="Financial report reminders" description="Local preference only; no reminder is currently sent." checked={draft.notifications.financialReminders} onChange={(value) => update('notifications', 'financialReminders', value)} />
                <Toggle label="Product announcements" description="Local preference only; no announcement email is sent." checked={draft.notifications.productAnnouncements} onChange={(value) => update('notifications', 'productAnnouncements', value)} />
                <Toggle label="Important application updates" description="Stored as a local preference; delivery is not configured." checked={draft.notifications.importantUpdates} onChange={(value) => update('notifications', 'importantUpdates', value)} />
              </div>
            </div>
          )}

          {activeSection === 'plan' && (
            <div className="settings-section">
              <div className="settings-plan-card">
                <span className="settings-plan-icon"><CreditCard size={19} /></span>
                <div>
                  <p className="settings-plan-eyebrow">CURRENT ACCESS</p>
                  <h3>Preview workspace</h3>
                  <p>No paid plan or active subscription is configured. No payment details or invoices are collected here.</p>
                </div>
                <span className="settings-plan-badge">Payments pending</span>
              </div>
              <ToolNotice>Feature limits and paid-plan entitlements are not enforced or available in this build. There is no checkout or billing portal.</ToolNotice>
            </div>
          )}

          {activeSection === 'help' && (
            <div className="settings-section">
              <div className="settings-about-card">
                <div><span>Application</span><strong>Startup Valuation</strong></div>
                <div><span>Version</span><strong>{packageInfo.version}</strong></div>
                <div><span>Support contact</span><strong>Not configured</strong></div>
                <div><span>Documentation</span><strong>Project README (local)</strong></div>
              </div>
              <div className="settings-links">
                <Link to="/faq"><CircleHelp size={15} /> FAQ and product guidance</Link>
                <Link to="/privacy"><LockKeyhole size={15} /> Privacy and data handling</Link>
                <Link to="/terms"><FileText size={15} /> Terms of use</Link>
              </div>
            </div>
          )}

          {error && <ToolError>{error}</ToolError>}
          {notice && <p className="settings-success" role="status"><Check size={15} />{notice}</p>}
          <footer className="settings-panel__footer">
            <span>{dirty ? 'Unsaved changes' : 'All changes saved'}</span>
            <div>
              <button type="button" className="settings-cancel" onClick={cancel} disabled={!dirty}>Cancel</button>
              <button type="submit" className="settings-save" disabled={!dirty}>Save changes</button>
            </div>
          </footer>
        </form>
      </div>

      <dialog ref={resetDialog} className="settings-dialog" onCancel={() => setResetOpen(false)} onClose={() => setResetOpen(false)} aria-labelledby="settings-reset-title">
        <h2 id="settings-reset-title">Reset browser settings?</h2>
        <p>This clears only the settings stored in this browser and restores defaults. Saved valuation reports in the backend will not be changed.</p>
        <div>
          <button type="button" className="settings-cancel" onClick={() => setResetOpen(false)}>Cancel</button>
          <button type="button" className="settings-danger-action" onClick={reset}>Reset settings</button>
        </div>
      </dialog>
    </ToolPage>
  )
}

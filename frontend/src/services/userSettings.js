export const SETTINGS_STORAGE_KEY = 'startup-valuation-demo-settings-v1'

export const DEFAULT_SETTINGS = {
  profile: {
    fullName: '',
    role: '',
  },
  workspace: {
    name: 'Founder workspace',
    companyName: '',
    industry: 'other',
    stage: 'idea',
    website: '',
  },
  preferences: {
    currency: 'INR',
    financialYearStartMonth: 4,
    dateFormat: 'DD MMM YYYY',
    forecastMonths: 12,
    valuationMethod: 'automatic',
  },
  appearance: {
    theme: 'system',
  },
  notifications: {
    financialReminders: false,
    productAnnouncements: false,
    importantUpdates: true,
  },
}

const CURRENCIES = ['INR', 'USD', 'GBP', 'EUR']
const INDUSTRIES = ['saas', 'marketplace', 'ecommerce', 'fintech', 'edtech', 'healthtech', 'other']
const STAGES = ['idea', 'pre_seed', 'seed', 'series_a', 'series_b', 'series_c_plus']
const DATE_FORMATS = ['DD MMM YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']
const FORECAST_PERIODS = [6, 12, 24, 36]
const THEMES = ['light', 'dark', 'system']

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function normalizeSettings(value) {
  if (!isRecord(value)) return structuredClone(DEFAULT_SETTINGS)
  const profile = isRecord(value.profile) ? value.profile : {}
  const workspace = isRecord(value.workspace) ? value.workspace : {}
  const preferences = isRecord(value.preferences) ? value.preferences : {}
  const appearance = isRecord(value.appearance) ? value.appearance : {}
  const notifications = isRecord(value.notifications) ? value.notifications : {}
  return {
    profile: {
      fullName: typeof profile.fullName === 'string' ? profile.fullName : DEFAULT_SETTINGS.profile.fullName,
      role: typeof profile.role === 'string' ? profile.role : DEFAULT_SETTINGS.profile.role,
    },
    workspace: {
      name: typeof workspace.name === 'string' ? workspace.name : DEFAULT_SETTINGS.workspace.name,
      companyName: typeof workspace.companyName === 'string' ? workspace.companyName : DEFAULT_SETTINGS.workspace.companyName,
      industry: typeof workspace.industry === 'string' ? workspace.industry : DEFAULT_SETTINGS.workspace.industry,
      stage: typeof workspace.stage === 'string' ? workspace.stage : DEFAULT_SETTINGS.workspace.stage,
      website: typeof workspace.website === 'string' ? workspace.website : DEFAULT_SETTINGS.workspace.website,
    },
    preferences: {
      currency: typeof preferences.currency === 'string' ? preferences.currency : DEFAULT_SETTINGS.preferences.currency,
      financialYearStartMonth: preferences.financialYearStartMonth ?? DEFAULT_SETTINGS.preferences.financialYearStartMonth,
      dateFormat: typeof preferences.dateFormat === 'string' ? preferences.dateFormat : DEFAULT_SETTINGS.preferences.dateFormat,
      forecastMonths: preferences.forecastMonths ?? DEFAULT_SETTINGS.preferences.forecastMonths,
      valuationMethod: typeof preferences.valuationMethod === 'string' ? preferences.valuationMethod : DEFAULT_SETTINGS.preferences.valuationMethod,
    },
    appearance: {
      theme: typeof appearance.theme === 'string' ? appearance.theme : DEFAULT_SETTINGS.appearance.theme,
    },
    notifications: {
      financialReminders: typeof notifications.financialReminders === 'boolean' ? notifications.financialReminders : DEFAULT_SETTINGS.notifications.financialReminders,
      productAnnouncements: typeof notifications.productAnnouncements === 'boolean' ? notifications.productAnnouncements : DEFAULT_SETTINGS.notifications.productAnnouncements,
      importantUpdates: typeof notifications.importantUpdates === 'boolean' ? notifications.importantUpdates : DEFAULT_SETTINGS.notifications.importantUpdates,
    },
  }
}

export function loadSettings() {
  try {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    return {
      settings: stored ? normalizeSettings(JSON.parse(stored)) : structuredClone(DEFAULT_SETTINGS),
      error: '',
    }
  } catch {
    return {
      settings: structuredClone(DEFAULT_SETTINGS),
      error: 'Saved browser settings could not be read. You can continue with defaults and save again.',
    }
  }
}

export function validateSettings(value) {
  const settings = normalizeSettings(value)
  const { profile, workspace, preferences, appearance, notifications } = settings

  if (typeof profile.fullName !== 'string' || profile.fullName.trim().length > 80) {
    return 'Full name must be 80 characters or fewer.'
  }
  if (typeof profile.role !== 'string' || profile.role.length > 80) {
    return 'Job title must be 80 characters or fewer.'
  }
  if (typeof workspace.name !== 'string' || workspace.name.trim().length === 0 || workspace.name.trim().length > 80) {
    return 'Workspace name is required and must be 80 characters or fewer.'
  }
  if (typeof workspace.companyName !== 'string' || workspace.companyName.length > 120) {
    return 'Company name must be 120 characters or fewer.'
  }
  if (!INDUSTRIES.includes(workspace.industry)) return 'Choose a supported industry.'
  if (!STAGES.includes(workspace.stage)) return 'Choose a supported company stage.'
  if (typeof workspace.website !== 'string' || workspace.website.length > 200) {
    return 'Company website must be 200 characters or fewer.'
  }
  if (workspace.website.trim()) {
    try {
      const website = new URL(workspace.website.trim())
      if (!['http:', 'https:'].includes(website.protocol) || !website.hostname.includes('.')) {
        return 'Enter a complete website address beginning with https://.'
      }
    } catch {
      return 'Enter a complete website address beginning with https://.'
    }
  }
  if (!CURRENCIES.includes(preferences.currency)) return 'Choose a supported currency.'
  if (!Number.isInteger(Number(preferences.financialYearStartMonth))
    || Number(preferences.financialYearStartMonth) < 1
    || Number(preferences.financialYearStartMonth) > 12) {
    return 'Choose a valid financial year start month.'
  }
  if (!DATE_FORMATS.includes(preferences.dateFormat)) return 'Choose a supported date format.'
  if (!FORECAST_PERIODS.includes(Number(preferences.forecastMonths))) {
    return 'Choose a forecast period of 6, 12, 24, or 36 months.'
  }
  if (!['automatic'].includes(preferences.valuationMethod)) return 'The selected valuation method is not supported.'
  if (!THEMES.includes(appearance.theme)) return 'Choose a supported appearance theme.'
  if (Object.values(notifications).some((enabled) => typeof enabled !== 'boolean')) {
    return 'Notification preferences must be enabled or disabled.'
  }

  return ''
}

export function saveSettings(value) {
  const error = validateSettings(value)
  if (error) throw new Error(error)
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalizeSettings(value)))
}

export function resetSettings() {
  window.localStorage.removeItem(SETTINGS_STORAGE_KEY)
  return structuredClone(DEFAULT_SETTINGS)
}

export function formatDate(value, pattern = 'DD MMM YYYY') {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear())
  if (pattern === 'DD/MM/YYYY') return `${day}/${month}/${year}`
  if (pattern === 'MM/DD/YYYY') return `${month}/${day}/${year}`
  if (pattern === 'YYYY-MM-DD') return `${year}-${month}-${day}`
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(value, pattern = 'DD MMM YYYY') {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'
  return `${formatDate(date, pattern)} ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`
}

import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_SETTINGS,
  formatDate,
  formatDateTime,
  loadSettings,
  normalizeSettings,
  resetSettings,
  saveSettings,
  SETTINGS_STORAGE_KEY,
  validateSettings,
} from '../src/services/userSettings.js'

function withStorage(callback) {
  const entries = new Map()
  const previousWindow = globalThis.window
  globalThis.window = {
    localStorage: {
      getItem: (key) => entries.get(key) ?? null,
      setItem: (key, value) => entries.set(key, value),
      removeItem: (key) => entries.delete(key),
    },
  }
  try {
    callback(entries)
  } finally {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
  }
}

test('normalizes corrupt local settings without trusting arbitrary field types', () => {
  const normalized = normalizeSettings({
    profile: { fullName: { injected: true } },
    workspace: { website: 22 },
    notifications: { importantUpdates: 'yes' },
  })
  assert.equal(normalized.profile.fullName, '')
  assert.equal(normalized.workspace.website, '')
  assert.equal(normalized.notifications.importantUpdates, true)
})

test('validates workspace values and supported finance preferences', () => {
  const valid = structuredClone(DEFAULT_SETTINGS)
  valid.workspace.website = 'https://example.com'
  valid.preferences.currency = 'USD'
  valid.preferences.forecastMonths = 24
  assert.equal(validateSettings(valid), '')

  assert.match(validateSettings({ ...valid, workspace: { ...valid.workspace, website: 'not a URL' } }), /website/i)
  assert.match(validateSettings({ ...valid, preferences: { ...valid.preferences, forecastMonths: 18 } }), /forecast period/i)
  assert.match(validateSettings({ ...valid, workspace: { ...valid.workspace, name: ' ' } }), /workspace name/i)
})

test('saves, reloads, exports a stable date format, and resets browser settings', () => {
  withStorage((entries) => {
    const updated = structuredClone(DEFAULT_SETTINGS)
    updated.workspace.name = 'North Star'
    updated.preferences.currency = 'GBP'
    updated.preferences.forecastMonths = 36
    updated.appearance.theme = 'dark'
    saveSettings(updated)

    assert.equal(entries.has(SETTINGS_STORAGE_KEY), true)
    assert.equal(loadSettings().settings.workspace.name, 'North Star')
    assert.equal(loadSettings().settings.preferences.currency, 'GBP')
    assert.equal(formatDate('2026-10-28T10:00:00Z', 'YYYY-MM-DD'), '2026-10-28')
    assert.match(formatDateTime('2026-10-28T10:00:00Z', 'YYYY-MM-DD'), /^2026-10-28 /)
    assert.equal(formatDate('invalid', 'DD/MM/YYYY'), 'Date unavailable')

    const reset = resetSettings()
    assert.equal(reset.workspace.name, DEFAULT_SETTINGS.workspace.name)
    assert.equal(entries.has(SETTINGS_STORAGE_KEY), false)
  })
})

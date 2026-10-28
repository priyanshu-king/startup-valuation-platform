/**
 * Formatting Utilities
 * ====================
 */

/**
 * Format a number as a currency string (USD).
 * @param {number} value
 * @param {string} currency
 * @returns {string}
 */
export function formatCurrency(value, currency = 'USD') {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: Math.abs(value) >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value)
}

/**
 * Format a large number with K/M/B suffix.
 * @param {number} value
 * @returns {string}
 */
export function formatCompact(value) {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

/**
 * Format a decimal as a percentage string.
 * @param {number} value - e.g. 0.15 → "15.0%"
 * @param {number} decimals
 * @returns {string}
 */
export function formatPercent(value, decimals = 1) {
  if (value == null) return '—'
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Format a date string to a readable format.
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

/**
 * Clamp a number between min and max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

/**
 * Calculate a simple CAGR (Compound Annual Growth Rate).
 * @param {number} startValue
 * @param {number} endValue
 * @param {number} years
 * @returns {number} - decimal, e.g. 0.35 for 35%
 */
export function calcCAGR(startValue, endValue, years) {
  if (!startValue || years <= 0) return 0
  return Math.pow(endValue / startValue, 1 / years) - 1
}

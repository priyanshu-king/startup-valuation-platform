/**
 * API Service
 * ===========
 * Centralised Axios instance for all backend API calls.
 * Base URL: /api (proxied by Vite in development), or VITE_API_BASE_URL.
 */

import axios from 'axios'
import { createApiError } from '@/services/apiErrors'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'
let csrfToken = ''

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// ── Request Interceptor ───────────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase()) && csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response Interceptor ──────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(createApiError(error))
  },
)

// ════════════════════════════════════════════════════════
// Endpoint Definitions
// ════════════════════════════════════════════════════════

/** Health & System */
export const healthApi = {
  check: () => api.get('/health'),
}

/**
 * Valuations
 * POST /api/valuation/calculate  — run the valuation engine
 * GET  /api/valuation/:id        — retrieve saved result
 */
export const valuationsApi = {
  calculate: (payload) => api.post('/valuation/calculate', payload),
  getById:   (id)      => api.get(`/valuation/${id}`),
}

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}

export const reportsApi = {
  list: () => api.get('/reports'),
  get: (id) => api.get(`/reports/${id}`),
  downloadPdf: (id) => api.get(`/reports/${id}/pdf`, { responseType: 'blob' }),
  delete: (id) => api.delete(`/reports/${id}`),
}

export function setApiCsrfToken(value) {
  csrfToken = value || ''
}

export default api

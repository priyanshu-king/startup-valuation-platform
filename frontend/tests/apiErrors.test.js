import test from 'node:test'
import assert from 'node:assert/strict'
import { createApiError } from '../src/services/apiErrors.js'

test('turns FastAPI validation details into field-specific messages', () => {
  const error = createApiError({
    response: {
      status: 422,
      data: {
        detail: [
          { loc: ['body', 'market', 'tam'], msg: 'Value error, tam must be greater than or equal to sam' },
        ],
      },
    },
  })
  assert.equal(error.kind, 'validation')
  assert.match(error.message, /market\.tam: tam must be greater than or equal to sam/)
  assert.equal(error.fieldErrors.tam, 'tam must be greater than or equal to sam')
})

test('distinguishes service errors without exposing response internals', () => {
  const error = createApiError({
    response: { status: 500, data: { detail: 'database password and stack trace' } },
  })
  assert.equal(error.kind, 'http')
  assert.match(error.message, /HTTP 500/)
  assert.doesNotMatch(error.message, /password|stack trace/)
})

test('distinguishes unavailable service and timeout errors', () => {
  assert.equal(createApiError({ code: 'ERR_NETWORK' }).kind, 'network')
  assert.equal(createApiError({ code: 'ECONNABORTED' }).kind, 'timeout')
  assert.equal(createApiError({ response: { status: 502 } }).kind, 'network')
  assert.equal(createApiError({ response: { status: 504 } }).kind, 'timeout')
})

test('gives actionable messages for authentication, CSRF, conflict, and rate-limit errors', () => {
  const cases = [
    [401, 'authentication', /session has expired/i],
    [403, 'authorization', /could not be verified/i],
    [409, 'conflict', /already exists/i],
    [429, 'rate_limit', /too many attempts/i],
  ]

  for (const [status, kind, message] of cases) {
    const error = createApiError({ response: { status } })
    assert.equal(error.kind, kind)
    assert.match(error.message, message)
  }
})

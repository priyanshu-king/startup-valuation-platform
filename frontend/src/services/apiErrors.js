function formatValidationErrors(details) {
  return details.map((detail) => {
    const location = Array.isArray(detail.loc) ? detail.loc.filter((part) => part !== 'body') : []
    const field = location.length ? location.join('.') : 'request'
    const message = String(detail.msg ?? 'is invalid').replace(/^Value error,\s*/i, '')
    return `${field}: ${message}`
  }).join('; ')
}

export function createApiError(error) {
  const response = error.response
  const status = response?.status
  const detail = response?.data?.detail

  if (status === 502) {
    return Object.assign(new Error(
      'Cannot reach the configured backend. Start FastAPI or update VITE_API_PROXY_TARGET, then retry.',
    ), { kind: 'network', status })
  }

  if (status === 504) {
    return Object.assign(new Error('The configured backend did not respond in time. Check the service and retry.'), {
      kind: 'timeout',
      status,
    })
  }

  if (status === 401) {
    return Object.assign(new Error('Your session has expired. Sign in again to continue.'), {
      kind: 'authentication',
      status,
    })
  }

  if (status === 403) {
    return Object.assign(new Error('This request could not be verified. Refresh the page and try again.'), {
      kind: 'authorization',
      status,
    })
  }

  if (status === 409) {
    return Object.assign(new Error('An account with this email already exists. Sign in instead.'), {
      kind: 'conflict',
      status,
    })
  }

  if (status === 429) {
    return Object.assign(new Error('Too many attempts. Wait a minute before trying again.'), {
      kind: 'rate_limit',
      status,
    })
  }

  if (status === 422 && Array.isArray(detail)) {
    const fieldErrors = detail.reduce((errors, item) => {
      const location = Array.isArray(item.loc) ? item.loc.filter((part) => part !== 'body') : []
      const key = location.length ? location[location.length - 1] : null
      if (key) errors[key] = String(item.msg ?? 'Please check this value.').replace(/^Value error,\s*/i, '')
      return errors
    }, {})
    return Object.assign(new Error(`Please review the submitted values: ${formatValidationErrors(detail)}`), {
      kind: 'validation',
      status,
      fieldErrors,
    })
  }

  if (response) {
    const message = status >= 500
      ? `The service returned an error (HTTP ${status}). Please try again later.`
      : status === 404
        ? 'The requested item was not found.'
        : status === 422
          ? 'The server could not process this calculation. Review the submitted values and try again.'
          : `The request was rejected (HTTP ${status}). Please review the submitted information.`
    return Object.assign(new Error(message), { kind: 'http', status })
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return Object.assign(new Error('The valuation request timed out. Check the service and try again.'), {
      kind: 'timeout',
    })
  }

  return Object.assign(new Error(
    'Cannot reach the service. Confirm the FastAPI server and API URL are available, then try again.',
  ), { kind: 'network' })
}

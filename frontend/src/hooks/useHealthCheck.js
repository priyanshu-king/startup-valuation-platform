/**
 * useHealthCheck Hook
 * ===================
 * Polls the /api/health endpoint and returns the service status.
 * Used by the Navbar to show a live backend connection indicator.
 */

import { useState, useEffect, useCallback } from 'react'
import { healthApi } from '@/services/api'

/**
 * @param {number} intervalMs - How often to poll (default: 30 seconds)
 * @returns {{ status, data, error, isLoading, refetch }}
 */
export function useHealthCheck(intervalMs = 30_000) {
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus]       = useState('unknown') // 'ok' | 'error' | 'unknown'
  const [data, setData]           = useState(null)
  const [error, setError]         = useState(null)

  const check = useCallback(async () => {
    try {
      const response = await healthApi.check()
      setData(response.data)
      setStatus(response.data.status === 'ok' ? 'ok' : 'error')
      setError(null)
    } catch (err) {
      setStatus('error')
      setError(err.message)
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    check()
    const interval = setInterval(check, intervalMs)
    return () => clearInterval(interval)
  }, [check, intervalMs])

  return { status, data, error, isLoading, refetch: check }
}

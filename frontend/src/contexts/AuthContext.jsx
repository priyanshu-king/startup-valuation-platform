import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi, setApiCsrfToken } from '@/services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const applySession = useCallback((response) => {
    setUser(response.user)
    setApiCsrfToken(response.csrf_token)
    setError('')
  }, [])

  useEffect(() => {
    let active = true
    authApi.me()
      .then(({ data }) => { if (active) applySession(data) })
      .catch((requestError) => {
        setApiCsrfToken('')
        if (active && requestError.status !== 401) {
          setError(requestError.message || 'Could not verify the current session.')
        }
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [applySession])

  const login = useCallback(async (credentials, register = false) => {
    const { data } = await (register ? authApi.register(credentials) : authApi.login(credentials))
    applySession(data)
    return data.user
  }, [applySession])

  const logout = useCallback(async () => {
    await authApi.logout()
    setApiCsrfToken('')
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    user, loading, error, login, logout,
  }), [user, loading, error, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider.')
  return context
}

import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthPage() {
  const [register, setRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { user, loading, error: sessionError, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  if (loading) return <main className="auth-loading" role="status">Checking your secure session…</main>
  if (user) return <Navigate to="/app/overview" replace />

  async function submit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await login({ email: email.trim().toLowerCase(), password }, register)
      const returnTo = location.state?.from?.pathname || '/app/overview'
      navigate(returnTo, { replace: true })
    } catch (requestError) {
      setError(requestError.message || 'Authentication failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <Link to="/" className="auth-brand">Startup <strong>Valuation</strong></Link>
        <p className="auth-eyebrow">PRIVATE FOUNDER WORKSPACE</p>
        <h1 id="auth-title">{register ? 'Create your account' : 'Sign in'}</h1>
        <p className="auth-description">Saved valuations and reports are private to your account.</p>
        {(error || sessionError) && <p className="auth-error" role="alert">{error || sessionError}</p>}
        <form onSubmit={submit}>
          <label htmlFor="auth-email">Email address</label>
          <input id="auth-email" type="email" autoComplete="email" required maxLength={320} placeholder="name@company.com" value={email} onChange={(event) => setEmail(event.target.value)} />
          <label htmlFor="auth-password">Password</label>
          <input id="auth-password" type="password" autoComplete={register ? 'new-password' : 'current-password'} required minLength={register ? 12 : 1} maxLength={128} placeholder={register ? 'At least 12 characters' : 'Enter your password'} value={password} onChange={(event) => setPassword(event.target.value)} />
          {register && <p className="auth-help">Use at least 12 characters. Password recovery is not available yet.</p>}
          <button type="submit" disabled={submitting}>{submitting ? 'Please wait…' : register ? 'Create account' : 'Sign in'}</button>
        </form>
        <p className="auth-toggle">
          {register ? 'Already have an account?' : 'New here?'}{' '}
          <button type="button" onClick={() => { setRegister((value) => !value); setError('') }}>
            {register ? 'Sign in' : 'Create an account'}
          </button>
        </p>
        <p className="auth-security">Your session uses a revocable HttpOnly cookie. Do not reuse a password from another service.</p>
      </section>
    </main>
  )
}

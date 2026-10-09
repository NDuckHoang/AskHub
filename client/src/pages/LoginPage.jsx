import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './AuthForm.css'

function LoginPage() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const justRegistered = location.state?.justRegistered

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Đã đăng nhập rồi thì không cần xem lại form đăng nhập
  if (loading) return null
  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu')
      return
    }

    setSubmitting(true)
    try {
      await login(email.trim(), password)
      const redirectTo = location.state?.from?.pathname || '/'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container auth-container">
      <div className="card auth-card">
        <h1>Đăng nhập</h1>

        {justRegistered && (
          <div className="auth-success">Đăng ký thành công! Hãy đăng nhập để tiếp tục.</div>
        )}
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="password">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
            {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="auth-switch">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage

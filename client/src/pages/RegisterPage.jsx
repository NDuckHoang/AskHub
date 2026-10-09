import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './AuthForm.css'

function RegisterPage() {
  const { user, loading, register } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Đã đăng nhập rồi thì không cần xem lại form đăng ký
  if (loading) return null
  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!username.trim() || !email.trim() || !password) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp')
      return
    }

    setSubmitting(true)
    try {
      await register(username.trim(), email.trim(), password)
      navigate('/login', { state: { justRegistered: true } })
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container auth-container">
      <div className="card auth-card">
        <h1>Đăng ký</h1>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

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
              autoComplete="new-password"
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="confirmPassword">
              Nhập lại mật khẩu
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
            {submitting ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <p className="auth-switch">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage

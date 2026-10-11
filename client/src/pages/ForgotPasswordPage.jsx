import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import * as authService from '../services/authService'
import './AuthForm.css'

function ForgotPasswordPage() {
  const { user, loading } = useAuth()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  if (loading) return null
  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Vui lòng nhập email')
      return
    }

    setSubmitting(true)
    try {
      await authService.forgotPassword(email.trim())
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container auth-container">
      <div className="card auth-card">
        <h1>Quên mật khẩu</h1>

        {sent ? (
          <>
            <div className="auth-success">
              Nếu email này đã đăng ký tài khoản, chúng tôi đã gửi link đặt lại mật khẩu - vui lòng kiểm
              tra hộp thư (kể cả mục spam).
            </div>
            <p className="auth-switch">
              <Link to="/login">Quay lại đăng nhập</Link>
            </p>
          </>
        ) : (
          <>
            <p className="auth-hint">Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu.</p>
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

              <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
                {submitting ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
              </button>
            </form>

            <p className="auth-switch">
              Nhớ ra mật khẩu? <Link to="/login">Đăng nhập</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordPage

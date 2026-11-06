import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { MessageSquareCode } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import PasswordInput from '../components/PasswordInput'
import './AuthForm.css'

function LoginPage() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const justRegistered = location.state?.justRegistered
  const passwordReset = location.state?.passwordReset

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Mặc định tick sẵn để giữ hành vi cũ (trước đây luôn nhớ đăng nhập)
  const [remember, setRemember] = useState(true)
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
      await login(email.trim(), password, remember)
      const redirectTo = location.state?.from?.pathname || '/'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div className="auth-card-head">
          <span className="auth-card-icon">
            <MessageSquareCode size={22} />
          </span>
          <h1>Chào mừng trở lại!</h1>
          <p className="auth-card-subtitle">Tiếp tục hành trình chia sẻ kiến thức cùng AskHub.</p>
        </div>

        {justRegistered && (
          <div className="auth-success">Đăng ký thành công! Hãy đăng nhập để tiếp tục.</div>
        )}
        {passwordReset && (
          <div className="auth-success">Đặt lại mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.</div>
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
              placeholder="ban@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="password">
              Mật khẩu
            </label>
            <PasswordInput
              id="password"
              placeholder="Nhập mật khẩu của bạn"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <div className="auth-options">
            <label className="auth-remember">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Ghi nhớ đăng nhập
            </label>
            <Link to="/forgot-password" className="auth-forgot">
              Quên mật khẩu?
            </Link>
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

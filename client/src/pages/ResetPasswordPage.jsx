import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import PasswordInput from '../components/PasswordInput'
import * as authService from '../services/authService'
import './AuthForm.css'

function ResetPasswordPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const showToast = useToast()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return null
  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

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
      await authService.resetPassword(token, password)
      showToast('Đặt lại mật khẩu thành công, hãy đăng nhập lại')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  // Không có token trong URL (vd người dùng vào thẳng trang này) -> không có gì để đặt lại
  if (!token) {
    return (
      <div className="container auth-container">
        <div className="card auth-card">
          <h1>Đặt lại mật khẩu</h1>
          <div className="auth-error">Link đặt lại mật khẩu không hợp lệ hoặc thiếu token.</div>
          <p className="auth-switch">
            <Link to="/forgot-password">Yêu cầu link mới</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container auth-container">
      <div className="card auth-card">
        <h1>Đặt lại mật khẩu</h1>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field-label" htmlFor="password">
              Mật khẩu mới
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="confirmPassword">
              Nhập lại mật khẩu mới
            </label>
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
            {submitting ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPasswordPage

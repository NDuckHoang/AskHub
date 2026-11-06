import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { KeyRound, Check } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import * as authService from '../services/authService'
import PasswordInput from '../components/PasswordInput'
import './AuthForm.css'

// Quên mật khẩu bằng câu hỏi bảo mật - 2 bước, không cần email:
//  1. Nhập email -> backend trả về câu hỏi bảo mật của tài khoản
//  2. Trả lời đúng + nhập mật khẩu mới -> đặt lại mật khẩu, quay về trang đăng nhập
function ForgotPasswordPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Đang đăng nhập thì dùng chức năng Đổi mật khẩu trong hồ sơ, không cần trang này
  if (loading) return null
  if (user) return <Navigate to="/" replace />

  async function handleFindAccount(e) {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Vui lòng nhập email')
      return
    }

    setSubmitting(true)
    try {
      const foundQuestion = await authService.getRecoveryQuestion(email.trim())
      setQuestion(foundQuestion)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReset(e) {
    e.preventDefault()
    setError('')
    if (!answer.trim()) {
      setError('Vui lòng nhập câu trả lời')
      return
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới nhập lại không khớp')
      return
    }

    setSubmitting(true)
    try {
      await authService.resetPassword({ email: email.trim(), answer, newPassword })
      navigate('/login', { state: { passwordReset: true } })
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  function backToStep1() {
    setStep(1)
    setAnswer('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div className="auth-card-head">
          <span className="auth-card-icon">
            <KeyRound size={22} />
          </span>
          <h1>Quên mật khẩu</h1>
          <p className="auth-card-subtitle">Trả lời câu hỏi bảo mật để đặt lại mật khẩu.</p>
        </div>

        <div className="auth-steps" aria-label={`Bước ${step} trên 2`}>
          <span className={`auth-step${step === 1 ? ' is-active' : ' is-done'}`}>
            <span className="auth-step-number">{step > 1 ? <Check size={13} /> : 1}</span>
            Tìm tài khoản
          </span>
          <span className="auth-step-line" />
          <span className={`auth-step${step === 2 ? ' is-active' : ''}`}>
            <span className="auth-step-number">2</span>
            Đặt mật khẩu mới
          </span>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleFindAccount} noValidate>
            <div className="field">
              <label className="field-label" htmlFor="email">
                Email đã đăng ký
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

            <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
              {submitting ? 'Đang tìm...' : 'Tiếp tục'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleReset} noValidate>
            <div className="auth-question">
              <small>Câu hỏi bảo mật của {email.trim()}</small>
              {question}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="answer">
                Câu trả lời
              </label>
              <input
                id="answer"
                className="input"
                placeholder="Không phân biệt chữ hoa/thường"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="newPassword">
                Mật khẩu mới
              </label>
              <PasswordInput
                id="newPassword"
                placeholder="Tối thiểu 6 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="confirmNewPassword">
                Nhập lại mật khẩu mới
              </label>
              <PasswordInput
                id="confirmNewPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
              {submitting ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
            </button>
            <button type="button" className="auth-back" onClick={backToStep1}>
              ← Dùng email khác
            </button>
          </form>
        )}

        <p className="auth-switch">
          Nhớ ra mật khẩu? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPasswordPage

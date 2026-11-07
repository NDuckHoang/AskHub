import { useState } from 'react'
import { ShieldCheck, ShieldAlert } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import * as userService from '../services/userService'
import PasswordInput from '../components/PasswordInput'
import SecurityQuestionFields from '../components/SecurityQuestionFields'
import './EditProfilePage.css' // dùng chung kiểu thẻ/form với trang Chỉnh sửa hồ sơ
import './SecurityPage.css'

// Form đổi mật khẩu - tách riêng khỏi form hồ sơ chính vì khác API, khác luồng
// thành công/lỗi (đổi hồ sơ xong thì chuyển trang, đổi mật khẩu xong thì ở lại và xóa form)
function ChangePasswordForm({ userId }) {
  const showToast = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

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
      await userService.changePassword(userId, { currentPassword, newPassword })
      showToast('Đổi mật khẩu thành công')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="card edit-profile-card" onSubmit={handleSubmit} noValidate>
      <h2 className="edit-profile-section-title">Đổi mật khẩu</h2>

      {error && <div className="auth-error">{error}</div>}

      <div className="field">
        <label className="field-label" htmlFor="currentPassword">
          Mật khẩu hiện tại
        </label>
        <PasswordInput
          id="currentPassword"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="newPassword">
          Mật khẩu mới
        </label>
        <PasswordInput
          id="newPassword"
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

      <div className="edit-profile-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Đang lưu...' : 'Đổi mật khẩu'}
        </button>
      </div>
    </form>
  )
}

// Đặt/đổi câu hỏi bảo mật - dùng cho chức năng Quên mật khẩu (trang /forgot-password).
// currentQuestion: câu hỏi đang dùng (null nếu tài khoản cũ chưa thiết lập)
function SecurityQuestionForm({ userId, currentQuestion, onSaved }) {
  const showToast = useToast()
  const [question, setQuestion] = useState(currentQuestion || '')
  const [answer, setAnswer] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!question || answer.trim().length < 2) {
      setError('Vui lòng chọn câu hỏi và nhập câu trả lời (ít nhất 2 ký tự)')
      return
    }
    if (!currentPassword) {
      setError('Vui lòng nhập mật khẩu hiện tại để xác nhận')
      return
    }

    setSubmitting(true)
    try {
      await userService.updateSecurityQuestion(userId, {
        currentPassword,
        securityQuestion: question,
        securityAnswer: answer,
      })
      showToast('Đã lưu câu hỏi bảo mật')
      onSaved(question)
      setAnswer('')
      setCurrentPassword('')
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="card edit-profile-card" onSubmit={handleSubmit} noValidate>
      <h2 className="edit-profile-section-title">Câu hỏi bảo mật</h2>

      {currentQuestion ? (
        <p className="security-status is-set">
          <ShieldCheck size={16} /> Đã thiết lập - bạn có thể lấy lại mật khẩu khi quên.
        </p>
      ) : (
        <p className="security-status is-missing">
          <ShieldAlert size={16} /> Chưa thiết lập. Hãy thiết lập để có thể lấy lại mật khẩu khi quên.
        </p>
      )}

      {error && <div className="auth-error">{error}</div>}

      <SecurityQuestionFields
        idPrefix="profile-security"
        question={question}
        onQuestionChange={setQuestion}
        answer={answer}
        onAnswerChange={setAnswer}
      />

      <div className="field">
        <label className="field-label" htmlFor="securityCurrentPassword">
          Mật khẩu hiện tại
        </label>
        <PasswordInput
          id="securityCurrentPassword"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>

      <div className="edit-profile-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Đang lưu...' : 'Lưu câu hỏi bảo mật'}
        </button>
      </div>
    </form>
  )
}

// Trang /security (cần đăng nhập): đổi mật khẩu + câu hỏi bảo mật của CHÍNH tài khoản đang đăng nhập.
// Tách khỏi trang Chỉnh sửa hồ sơ vì là thông tin nhạy cảm, mỗi thao tác đều cần mật khẩu hiện tại.
function SecurityPage() {
  const { user, updateUser } = useAuth()

  return (
    <div className="container edit-profile-page security-page">
      <h1>Bảo mật tài khoản</h1>
      <p className="security-page-subtitle">
        Quản lý mật khẩu và câu hỏi bảo mật dùng để lấy lại mật khẩu khi quên.
      </p>

      <ChangePasswordForm userId={user.id} />
      <SecurityQuestionForm
        userId={user.id}
        currentQuestion={user.security_question}
        onSaved={(question) => updateUser({ security_question: question })}
      />
    </div>
  )
}

export default SecurityPage

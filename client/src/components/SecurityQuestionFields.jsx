import { useEffect, useState } from 'react'
import * as authService from '../services/authService'
import Select from './Select'

// 2 ô "Câu hỏi bảo mật" + "Câu trả lời", dùng chung cho form Đăng ký và Chỉnh sửa hồ sơ.
// Danh sách câu hỏi lấy từ backend (GET /api/auth/security-questions) để 2 bên luôn khớp nhau.
function SecurityQuestionFields({ question, onQuestionChange, answer, onAnswerChange, idPrefix = 'security' }) {
  const [questions, setQuestions] = useState([])

  useEffect(() => {
    authService
      .getSecurityQuestions()
      .then(setQuestions)
      .catch(() => setQuestions([]))
  }, [])

  return (
    <>
      <div className="field">
        <label className="field-label" htmlFor={`${idPrefix}-question`}>
          Câu hỏi bảo mật
        </label>
        <Select
          id={`${idPrefix}-question`}
          value={question}
          onChange={onQuestionChange}
          placeholder="-- Chọn một câu hỏi --"
          options={questions.map((q) => ({ value: q, label: q }))}
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor={`${idPrefix}-answer`}>
          Câu trả lời
        </label>
        <input
          id={`${idPrefix}-answer`}
          className="input"
          placeholder="Câu trả lời bạn sẽ nhớ được"
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          autoComplete="off"
        />
        <span className="field-hint">
          Dùng để lấy lại mật khẩu khi quên. Không phân biệt chữ hoa/thường.
        </span>
      </div>
    </>
  )
}

export default SecurityQuestionFields

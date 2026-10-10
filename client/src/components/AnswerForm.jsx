import { useState } from 'react'
import * as answerService from '../services/answerService'
import { useToast } from '../hooks/useToast'
import MarkdownEditor from './MarkdownEditor'
import './AnswerForm.css'

function AnswerForm({ questionId, onSubmitted }) {
  const showToast = useToast()
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (content.trim().length < 10) {
      setError('Nội dung câu trả lời phải có ít nhất 10 ký tự')
      return
    }

    setSubmitting(true)
    try {
      const data = await answerService.createAnswer(questionId, content.trim())
      setContent('')
      onSubmitted(data.answer)
      showToast('Đăng câu trả lời thành công!')
    } catch (err) {
      setError(err.response?.data?.message || 'Không gửi được câu trả lời, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="answer-form" onSubmit={handleSubmit}>
      <div className="field">
        <label className="field-label" htmlFor="answer-content">
          Câu trả lời của bạn
        </label>
        <MarkdownEditor
          id="answer-content"
          value={content}
          onChange={setContent}
          onErrorClear={() => setError('')}
          onUploadingChange={setUploadingImage}
          hasError={!!error}
          placeholder="Chia sẻ giải pháp hoặc góc nhìn của bạn..."
          rows={6}
        />
        {error && <span className="field-error">{error}</span>}
      </div>

      <button type="submit" className="btn btn-primary" disabled={submitting || uploadingImage}>
        {submitting ? 'Đang gửi...' : 'Gửi câu trả lời'}
      </button>
    </form>
  )
}

export default AnswerForm

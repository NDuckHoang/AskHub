import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import QuestionForm from '../components/QuestionForm'
import * as questionService from '../services/questionService'
import { useAuth } from '../hooks/useAuth'
import './AskPage.css'

function EditQuestionPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    questionService
      .getQuestionById(id)
      .then(setQuestion)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(data) {
    await questionService.updateQuestion(id, data)
    navigate(`/questions/${id}`)
  }

  if (loading) {
    return (
      <div className="container">
        <div className="skeleton" style={{ height: 300, marginTop: 20 }} />
      </div>
    )
  }

  if (error || !question) {
    return (
      <div className="container">
        <div className="card state-box state-error">
          <p>Không tìm thấy câu hỏi.</p>
        </div>
      </div>
    )
  }

  if (!user || user.id !== question.user_id) {
    return (
      <div className="container">
        <div className="card state-box state-error">
          <p>Bạn không có quyền sửa câu hỏi này.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container ask-page">
      <h1>Sửa câu hỏi</h1>
      <div className="card ask-page-card">
        <QuestionForm
          initialValues={{
            title: question.title,
            content: question.content,
            category_id: question.category_id,
            tags: question.tags.map((t) => t.name),
          }}
          onSubmit={handleSubmit}
          submitLabel="Lưu thay đổi"
        />
      </div>
    </div>
  )
}

export default EditQuestionPage

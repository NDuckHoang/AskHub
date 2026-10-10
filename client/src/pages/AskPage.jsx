import { useNavigate } from 'react-router-dom'
import QuestionForm from '../components/QuestionForm'
import * as questionService from '../services/questionService'
import { useToast } from '../hooks/useToast'
import './AskPage.css'

function AskPage() {
  const navigate = useNavigate()
  const showToast = useToast()

  async function handleSubmit(data) {
    const res = await questionService.createQuestion(data)
    showToast('Đăng câu hỏi thành công!')
    navigate(`/questions/${res.question.id}`)
  }

  return (
    <div className="container ask-page">
      <h1>Đặt câu hỏi</h1>
      <div className="card ask-page-card">
        <QuestionForm onSubmit={handleSubmit} submitLabel="Đăng câu hỏi" />
      </div>
    </div>
  )
}

export default AskPage

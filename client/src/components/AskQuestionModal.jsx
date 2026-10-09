import { useNavigate } from 'react-router-dom'
import Modal from './Modal'
import QuestionForm from './QuestionForm'
import { useAskModal } from '../hooks/useAskModal'
import * as questionService from '../services/questionService'

// Popup "Đặt câu hỏi" mở từ Navbar, dùng chung QuestionForm với trang /ask
function AskQuestionModal() {
  const { isOpen, closeAskModal } = useAskModal()
  const navigate = useNavigate()

  if (!isOpen) return null

  async function handleSubmit(data) {
    const res = await questionService.createQuestion(data)
    closeAskModal()
    navigate(`/questions/${res.question.id}`)
  }

  return (
    <Modal title="Đặt câu hỏi mới" onClose={closeAskModal}>
      <QuestionForm onSubmit={handleSubmit} submitLabel="Đăng câu hỏi" />
    </Modal>
  )
}

export default AskQuestionModal

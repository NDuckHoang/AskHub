import { useNavigate } from 'react-router-dom'
import Modal from './Modal'
import QuestionForm from './QuestionForm'
import { useAskModal } from '../hooks/useAskModal'
import { useToast } from '../hooks/useToast'
import * as questionService from '../services/questionService'

// Popup "Đặt câu hỏi" mở từ Navbar, dùng chung QuestionForm với trang /ask
function AskQuestionModal() {
  const { isOpen, closeAskModal } = useAskModal()
  const navigate = useNavigate()
  const showToast = useToast()

  if (!isOpen) return null

  async function handleSubmit(data) {
    const res = await questionService.createQuestion(data)
    closeAskModal()
    showToast('Đăng câu hỏi thành công!')
    navigate(`/questions/${res.question.id}`)
  }

  return (
    <Modal title="Đặt câu hỏi mới" onClose={closeAskModal}>
      <QuestionForm onSubmit={handleSubmit} submitLabel="Đăng câu hỏi" />
    </Modal>
  )
}

export default AskQuestionModal

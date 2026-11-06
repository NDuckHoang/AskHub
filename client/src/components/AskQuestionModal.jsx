import { useNavigate } from 'react-router-dom'
import { PenLine, Lightbulb, ChevronDown } from 'lucide-react'
import Modal from './Modal'
import QuestionForm from './QuestionForm'
import AskTips from './AskTips'
import UserAvatar from './UserAvatar'
import { useAskModal } from '../hooks/useAskModal'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import * as questionService from '../services/questionService'
import './AskQuestionModal.css'

// Popup "Đặt câu hỏi" mở từ Navbar/Sidebar, dùng chung QuestionForm + khối mẹo với trang /ask.
// 1 cột để form chiếm toàn bộ chiều rộng modal: mẹo viết câu hỏi thu gọn thành 1 dải ở trên
// (bấm để mở), thông tin người đăng nằm bên trái hàng nút gửi.
function AskQuestionModal() {
  const { isOpen, closeAskModal } = useAskModal()
  const { user } = useAuth()
  const navigate = useNavigate()
  const showToast = useToast()

  if (!isOpen) return null

  async function handleSubmit(data) {
    const res = await questionService.createQuestion(data)
    closeAskModal()
    showToast('Đăng câu hỏi thành công!')
    navigate(`/questions/${res.question.id}`)
  }

  const author = user && (
    <div className="ask-modal-author">
      <UserAvatar username={user.username} avatar={user.avatar} size={28} />
      <span>
        Đăng với tư cách <b>{user.username}</b>
      </span>
    </div>
  )

  return (
    <Modal
      title="Đặt câu hỏi mới"
      subtitle="Mô tả rõ vấn đề để cộng đồng có thể giúp bạn nhanh nhất."
      icon={<PenLine size={20} />}
      size="lg"
      onClose={closeAskModal}
    >
      {/* <details>: thẻ HTML có sẵn chức năng đóng/mở, không cần state */}
      <details className="ask-modal-tips">
        <summary>
          <Lightbulb size={16} />
          <span>Mẹo viết câu hỏi tốt trong 4 bước</span>
          <ChevronDown size={16} className="ask-modal-tips-chevron" />
        </summary>
        <AskTips />
      </details>

      <QuestionForm onSubmit={handleSubmit} submitLabel="Đăng câu hỏi" editorRows={7} actionsStart={author} />
    </Modal>
  )
}

export default AskQuestionModal

import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { formatRelativeTime } from '../utils/formatTime'
import './UserAnswerItem.css'

// 1 dòng trong tab "Câu trả lời" ở trang hồ sơ: câu hỏi gốc + trích nội dung trả lời
function UserAnswerItem({ answer }) {
  return (
    <article className="user-answer-item">
      <div className="user-answer-item-header">
        <Link to={`/questions/${answer.question_id}`} className="user-answer-item-question">
          {answer.question_title}
        </Link>
        {answer.is_accepted === 1 && (
          <span className="user-answer-item-badge">
            <Check size={12} /> Được chấp nhận
          </span>
        )}
      </div>

      <p className="user-answer-item-content">{answer.content}</p>

      <div className="user-answer-item-meta">
        <span className="stat-number">{answer.vote_count} vote</span>
        <span>{formatRelativeTime(answer.created_at)}</span>
      </div>
    </article>
  )
}

export default UserAnswerItem

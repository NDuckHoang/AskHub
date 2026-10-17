import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import Tag from './Tag'
import CategoryPill from './CategoryPill'
import UserAvatar from './UserAvatar'
import { formatRelativeTime } from '../utils/formatTime'
import './QuestionItem.css'

// Một dòng câu hỏi trong danh sách: dòng số liệu, tiêu đề, tag, người đăng
// animationDelay: để QuestionList tạo hiệu ứng xuất hiện lần lượt (stagger) khi danh sách vừa tải xong
function QuestionItem({ question, animationDelay }) {
  const {
    id,
    user_id,
    title,
    views,
    vote_count,
    answer_count,
    accepted_count,
    tags,
    category_id,
    category_name,
    author_username,
    author_avatar,
    created_at,
  } = question

  const hasAccepted = accepted_count > 0

  return (
    <article
      className="question-item animate-fade-in-up"
      style={animationDelay ? { animationDelay } : undefined}
    >
      {/* Cột số liệu bên trái - bố cục dạng forum Q&A: vote/trả lời/lượt xem xếp dọc,
          tách khỏi nội dung thay vì nằm 1 dòng phía trên (so với bản trước) */}
      <div className="question-item-stats">
        <div className="q-stat-box">
          <span className="stat-number">{vote_count}</span>
          <span className="q-stat-label">vote</span>
        </div>
        <div className={`q-stat-box${hasAccepted ? ' is-accepted' : ''}`}>
          <span className="stat-number">{answer_count}</span>
          <span className="q-stat-label">trả lời</span>
        </div>
        <div className="q-stat-views">
          <span className="stat-number">{views}</span> xem
        </div>
      </div>

      <div className="question-item-body">
        <h3 className="question-item-title">
          <Link to={`/questions/${id}`}>{title}</Link>
          {hasAccepted && (
            <span className="question-item-solved">
              <CheckCircle2 size={12} /> Đã giải quyết
            </span>
          )}
        </h3>

        {(category_id || tags.length > 0) && (
          <div className="question-item-tags">
            <CategoryPill id={category_id} name={category_name} />
            {tags.map((t) => (
              <Tag key={t.id} id={t.id} name={t.name} />
            ))}
          </div>
        )}

        <div className="question-item-meta">
          <UserAvatar username={author_username} avatar={author_avatar} size={28} />
          <span>
            Hỏi bởi <Link to={`/users/${user_id}`}>{author_username}</Link> ·{' '}
            {formatRelativeTime(created_at)}
          </span>
        </div>
      </div>
    </article>
  )
}

export default QuestionItem

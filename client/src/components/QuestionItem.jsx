import { Link } from 'react-router-dom'
import Tag from './Tag'
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
      <div className="question-stats-line">
        <span className="q-stat">
          <span className="stat-number">{vote_count}</span> vote
        </span>
        <span className={`q-stat q-stat-answers${hasAccepted ? ' is-accepted' : ''}`}>
          <span className="stat-number">{answer_count}</span> answers
        </span>
        <span className="q-stat">
          <span className="stat-number">{views}</span> views
        </span>
      </div>

      <h3 className="question-item-title">
        <Link to={`/questions/${id}`}>{title}</Link>
      </h3>

      {tags.length > 0 && (
        <div className="question-item-tags">
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
    </article>
  )
}

export default QuestionItem

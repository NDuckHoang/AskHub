import { Link } from 'react-router-dom'
import { Flame, Sparkles } from 'lucide-react'
import Tag from './Tag'
import CategoryPill from './CategoryPill'
import UserAvatar from './UserAvatar'
import { formatRelativeTime } from '../utils/formatTime'
import { toExcerpt } from '../utils/plainText'
import './QuestionItem.css'

// Ngưỡng gắn badge, tính hoàn toàn từ dữ liệu thật của câu hỏi
const NEW_HOURS = 24 // đăng trong 24 giờ gần đây -> 'Mới'
const HOT_VOTES = 5 // từ 5 vote trở lên -> 'Hot'
const HOT_VIEWS = 300 // hoặc từ 300 lượt xem trở lên -> 'Hot'

// Câu hỏi đăng trong NEW_HOURS giờ gần đây hay không
function isRecent(dateString) {
  return Date.now() - new Date(dateString).getTime() < NEW_HOURS * 60 * 60 * 1000
}

// Một dòng câu hỏi trong danh sách: dòng số liệu, tiêu đề, tag, người đăng
// animationDelay: để QuestionList tạo hiệu ứng xuất hiện lần lượt (stagger) khi danh sách vừa tải xong
function QuestionItem({ question, animationDelay }) {
  const {
    id,
    user_id,
    title,
    content,
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
  const isNew = isRecent(created_at)
  const isHot = vote_count >= HOT_VOTES || views >= HOT_VIEWS

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
          {isHot && (
            <span className="question-badge is-hot">
              <Flame size={12} /> Hot
            </span>
          )}
          {isNew && (
            <span className="question-badge is-new">
              <Sparkles size={12} /> Mới
            </span>
          )}
        </h3>

        {content && <p className="question-item-excerpt">{toExcerpt(content)}</p>}

        <div className="question-item-footer">
          <div className="question-item-tags">
            {category_id && <CategoryPill id={category_id} name={category_name} />}
            {tags.map((t) => (
              <Tag key={t.id} id={t.id} name={t.name} />
            ))}
          </div>

          <div className="question-item-meta">
            <UserAvatar username={author_username} avatar={author_avatar} size={22} />
            <span>
              <Link to={`/users/${user_id}`}>{author_username}</Link> · {formatRelativeTime(created_at)}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

export default QuestionItem

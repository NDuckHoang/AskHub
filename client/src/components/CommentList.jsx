import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import UserAvatar from './UserAvatar'
import ReportButton from './ReportButton'
import { formatRelativeTime } from '../utils/formatTime'
import { useAuth } from '../hooks/useAuth'
import * as commentService from '../services/commentService'
import './CommentList.css'

// Danh sách bình luận của 1 question hoặc 1 answer (truyền đúng 1 trong 2 id)
function CommentList({ comments, questionId, answerId, onChange }) {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    const content = text.trim()
    if (!content) return

    setSubmitting(true)
    setError('')
    try {
      const data = await commentService.createComment({
        question_id: questionId,
        answer_id: answerId,
        content,
      })
      setText('')
      onChange([...comments, data.comment])
    } catch (err) {
      setError(err.response?.data?.message || 'Không bình luận được, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Xóa bình luận này?')) return
    await commentService.deleteComment(id)
    onChange(comments.filter((c) => c.id !== id))
  }

  return (
    <div className="comment-list">
      {comments.map((c) => (
        <div key={c.id} className="comment-row">
          <UserAvatar username={c.author_username} avatar={c.author_avatar} size={18} />
          <div className="comment-body">
            <span className="comment-meta">
              <Link to={`/users/${c.user_id}`}>{c.author_username}</Link> ·{' '}
              {formatRelativeTime(c.created_at)}
            </span>
            <p className="comment-text">{c.content}</p>
          </div>
          {user && user.id !== c.user_id && (
            <ReportButton targetType="COMMENT" targetId={c.id} compact />
          )}
          {user && (user.id === c.user_id || user.role === 'ADMIN') && (
            <button
              type="button"
              className="comment-delete"
              onClick={() => handleDelete(c.id)}
              aria-label="Xóa bình luận"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ))}

      {user ? (
        <form className="comment-form" onSubmit={handleAdd}>
          <input
            className="input comment-input"
            placeholder="Viết bình luận..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary btn-sm" disabled={submitting || !text.trim()}>
            Gửi
          </button>
        </form>
      ) : (
        <p className="comment-login-hint">
          <Link to="/login">Đăng nhập</Link> để bình luận.
        </p>
      )}
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}

export default CommentList

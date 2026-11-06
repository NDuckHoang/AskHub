import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, MessageCircle, Send, LogIn, ChevronDown, ChevronUp } from 'lucide-react'
import UserAvatar from './UserAvatar'
import ReportButton from './ReportButton'
import { formatRelativeTime } from '../utils/formatTime'
import { useAuth } from '../hooks/useAuth'
import { useConfirm } from '../hooks/useConfirm'
import { useToast } from '../hooks/useToast'
import * as commentService from '../services/commentService'
import './CommentList.css'

const MAX_LENGTH = 1000 // giống giới hạn bên backend (commentController)
const COLLAPSED_COUNT = 3 // nhiều hơn số này thì thu gọn, có nút "Xem thêm"
const MAX_INPUT_HEIGHT = 140 // ô nhập tự giãn theo nội dung tới tối đa chiều cao này (px)

// Danh sách bình luận của 1 question hoặc 1 answer (truyền đúng 1 trong 2 id).
// postAuthorId: id người đăng question/answer đó - để gắn nhãn "Tác giả" cho bình luận của họ.
function CommentList({ comments, questionId, answerId, postAuthorId, onChange }) {
  const { user } = useAuth()
  const confirm = useConfirm()
  const showToast = useToast()
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [newCommentId, setNewCommentId] = useState(null)
  const inputRef = useRef(null)

  const hiddenCount = comments.length - COLLAPSED_COUNT
  const visibleComments = expanded || hiddenCount <= 0 ? comments : comments.slice(0, COLLAPSED_COUNT)

  // Ô nhập tự giãn chiều cao theo nội dung (reset về auto rồi đo lại scrollHeight)
  function resizeInput() {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_INPUT_HEIGHT)}px`
  }

  function handleTextChange(e) {
    setText(e.target.value)
    resizeInput()
  }

  async function submitComment() {
    const content = text.trim()
    if (!content || submitting) return

    setSubmitting(true)
    setError('')
    try {
      const data = await commentService.createComment({
        question_id: questionId,
        answer_id: answerId,
        content,
      })
      setText('')
      // Đặt lại chiều cao ô nhập sau khi xóa nội dung
      requestAnimationFrame(resizeInput)
      setExpanded(true) // để bình luận vừa gửi (nằm cuối danh sách) luôn nhìn thấy
      setNewCommentId(data.comment.id)
      onChange([...comments, data.comment])
    } catch (err) {
      setError(err.response?.data?.message || 'Không bình luận được, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    submitComment()
  }

  // Enter: gửi; Shift+Enter: xuống dòng
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submitComment()
    }
  }

  function handleCancel() {
    setText('')
    setError('')
    requestAnimationFrame(resizeInput)
    inputRef.current?.blur()
  }

  async function handleDelete(id) {
    const ok = await confirm({ title: 'Xóa bình luận', message: 'Xóa bình luận này?', danger: true })
    if (!ok) return
    await commentService.deleteComment(id)
    onChange(comments.filter((c) => c.id !== id))
    showToast('Đã xóa bình luận')
  }

  const showComposerFooter = focused || text.length > 0

  return (
    <section className="comment-list" aria-label="Bình luận">
      <div className="comment-list-header">
        <MessageCircle size={15} />
        <span>
          Bình luận{comments.length > 0 && <span className="comment-count stat-number">{comments.length}</span>}
        </span>
      </div>

      {visibleComments.map((c) => {
        const isPostAuthor = postAuthorId && c.user_id === postAuthorId
        return (
          <div key={c.id} className={`comment-row${c.id === newCommentId ? ' is-new' : ''}`}>
            <Link to={`/users/${c.user_id}`} className="comment-avatar" aria-label={c.author_username}>
              <UserAvatar username={c.author_username} avatar={c.author_avatar} size={30} />
            </Link>
            <div className="comment-bubble">
              <div className="comment-meta">
                <Link to={`/users/${c.user_id}`} className="comment-author">
                  {c.author_username}
                </Link>
                {isPostAuthor && <span className="comment-badge">Tác giả</span>}
                <span className="comment-time">· {formatRelativeTime(c.created_at)}</span>

                <span className="comment-actions">
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
                </span>
              </div>
              <p className="comment-text">{c.content}</p>
            </div>
          </div>
        )
      })}

      {hiddenCount > 0 && (
        <button type="button" className="comment-toggle" onClick={() => setExpanded((v) => !v)}>
          {expanded ? (
            <>
              <ChevronUp size={14} /> Thu gọn bình luận
            </>
          ) : (
            <>
              <ChevronDown size={14} /> Xem thêm {hiddenCount} bình luận
            </>
          )}
        </button>
      )}

      {user ? (
        <form className={`comment-composer${showComposerFooter ? ' is-active' : ''}`} onSubmit={handleSubmit}>
          <UserAvatar username={user.username} avatar={user.avatar} size={30} />
          <div className="comment-composer-box">
            <textarea
              ref={inputRef}
              className="comment-input"
              rows={1}
              placeholder="Viết bình luận..."
              value={text}
              maxLength={MAX_LENGTH}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              aria-label="Nội dung bình luận"
            />
            {showComposerFooter && (
              <div className="comment-composer-footer">
                <span className="comment-composer-hint">Enter để gửi · Shift+Enter xuống dòng</span>
                <span className="comment-composer-counter stat-number">
                  {text.length}/{MAX_LENGTH}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  // onMouseDown + preventDefault: giữ focus ô nhập để footer không biến mất trước khi click xong
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleCancel}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  onMouseDown={(e) => e.preventDefault()}
                  disabled={submitting || !text.trim()}
                >
                  <Send size={14} /> {submitting ? 'Đang gửi...' : 'Gửi'}
                </button>
              </div>
            )}
          </div>
        </form>
      ) : (
        <p className="comment-login-hint">
          <LogIn size={15} />
          <span>
            <Link to="/login">Đăng nhập</Link> để tham gia bình luận.
          </span>
        </p>
      )}
      {error && <p className="field-error">{error}</p>}
    </section>
  )
}

export default CommentList

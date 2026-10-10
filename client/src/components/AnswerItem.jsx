import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Pencil, Trash2 } from 'lucide-react'
import VoteButton from './VoteButton'
import CommentList from './CommentList'
import MarkdownContent from './MarkdownContent'
import ReportButton from './ReportButton'
import UserAvatar from './UserAvatar'
import { formatRelativeTime } from '../utils/formatTime'
import { useAuth } from '../hooks/useAuth'
import { useConfirm } from '../hooks/useConfirm'
import { useToast } from '../hooks/useToast'
import * as answerService from '../services/answerService'
import './AnswerItem.css'

function AnswerItem({
  answer,
  questionOwnerId,
  onVoted,
  onEdited,
  onDeleted,
  onAccepted,
  onCommentsChange,
  animationDelay,
}) {
  const { user } = useAuth()
  const confirm = useConfirm()
  const showToast = useToast()
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(answer.content)
  const [busy, setBusy] = useState(false)

  const isOwner = user && user.id === answer.user_id
  const isQuestionOwner = user && user.id === questionOwnerId
  const canDelete = user && (isOwner || user.role === 'ADMIN')

  async function handleVote(type) {
    if (!user) return
    const data = await answerService.voteAnswer(answer.id, type)
    onVoted(answer.id, data)
  }

  async function handleAccept() {
    setBusy(true)
    try {
      await answerService.setAccepted(answer.id, !answer.is_accepted)
      onAccepted()
      showToast(answer.is_accepted ? 'Đã bỏ đánh dấu câu trả lời đúng' : 'Đã đánh dấu câu trả lời đúng')
    } finally {
      setBusy(false)
    }
  }

  async function handleSaveEdit() {
    if (editContent.trim().length < 10) return
    setBusy(true)
    try {
      const data = await answerService.updateContent(answer.id, editContent.trim())
      onEdited(answer.id, data.answer.content)
      setEditing(false)
      showToast('Đã lưu thay đổi')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    const ok = await confirm({ title: 'Xóa câu trả lời', message: 'Xóa câu trả lời này?', danger: true })
    if (!ok) return
    await answerService.deleteAnswer(answer.id)
    onDeleted(answer.id)
    showToast('Đã xóa câu trả lời')
  }

  return (
    <div
      className={`answer-item animate-fade-in-up${answer.is_accepted ? ' is-accepted' : ''}`}
      style={animationDelay ? { animationDelay } : undefined}
    >
      <VoteButton
        voteCount={answer.vote_count}
        myVote={answer.my_vote}
        onVote={handleVote}
        disabled={!user || isOwner}
        disabledTitle={!user ? 'Đăng nhập để vote' : 'Không thể vote cho câu trả lời của chính mình'}
        size="sm"
      />

      <div className="answer-body">
        {answer.is_accepted && (
          <div className="answer-accepted-badge">
            <Check size={14} /> Câu trả lời được chấp nhận
          </div>
        )}

        {editing ? (
          <div className="answer-edit">
            <textarea
              className="textarea"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <div className="answer-edit-actions">
              <button type="button" className="btn btn-primary btn-sm" onClick={handleSaveEdit} disabled={busy}>
                Lưu
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <div className="answer-content">
            <MarkdownContent text={answer.content} />
          </div>
        )}

        <div className="answer-footer">
          <span className="answer-meta">
            <UserAvatar username={answer.author_username} avatar={answer.author_avatar} size={18} />
            Trả lời bởi{' '}
            <Link to={`/users/${answer.user_id}`} className="answer-meta-author">
              {answer.author_username}
            </Link>{' '}
            · {formatRelativeTime(answer.created_at)}
          </span>

          <div className="answer-actions">
            {isQuestionOwner && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleAccept} disabled={busy}>
                <Check size={14} /> {answer.is_accepted ? 'Bỏ đánh dấu đúng' : 'Đánh dấu đúng'}
              </button>
            )}
            {isOwner && !editing && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
                <Pencil size={14} /> Sửa
              </button>
            )}
            {canDelete && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleDelete}>
                <Trash2 size={14} /> Xóa
              </button>
            )}
            {!isOwner && <ReportButton targetType="ANSWER" targetId={answer.id} />}
          </div>
        </div>

        <CommentList
          comments={answer.comments}
          answerId={answer.id}
          onChange={(newComments) => onCommentsChange(answer.id, newComments)}
        />
      </div>
    </div>
  )
}

export default AnswerItem

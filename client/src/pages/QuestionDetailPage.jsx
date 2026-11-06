import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Pencil, Trash2, AlertCircle, MessageSquarePlus, MessageSquare, Check } from 'lucide-react'
import * as questionService from '../services/questionService'
import * as answerService from '../services/answerService'
import { useAuth } from '../hooks/useAuth'
import { useConfirm } from '../hooks/useConfirm'
import { useToast } from '../hooks/useToast'
import VoteButton from '../components/VoteButton'
import Tag from '../components/Tag'
import CategoryPill from '../components/CategoryPill'
import UserAvatar from '../components/UserAvatar'
import MarkdownContent from '../components/MarkdownContent'
import CommentList from '../components/CommentList'
import AnswerForm from '../components/AnswerForm'
import AnswerItem from '../components/AnswerItem'
import ReportButton from '../components/ReportButton'
import SaveButton from '../components/SaveButton'
import ShareButton from '../components/ShareButton'
import QuestionAside from '../components/QuestionAside'
import { formatRelativeTime } from '../utils/formatTime'
import './QuestionDetailPage.css'

function QuestionDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const showToast = useToast()

  const [question, setQuestion] = useState(null)
  const [loadingQuestion, setLoadingQuestion] = useState(true)
  const [errorQuestion, setErrorQuestion] = useState(false)

  const [answers, setAnswers] = useState([])
  const [loadingAnswers, setLoadingAnswers] = useState(true)
  const [errorAnswers, setErrorAnswers] = useState(false)

  const fetchQuestion = useCallback(() => {
    setLoadingQuestion(true)
    setErrorQuestion(false)
    questionService
      .getQuestionById(id)
      .then(setQuestion)
      .catch(() => setErrorQuestion(true))
      .finally(() => setLoadingQuestion(false))
  }, [id])

  const fetchAnswers = useCallback(() => {
    setLoadingAnswers(true)
    setErrorAnswers(false)
    answerService
      .getAnswers(id)
      .then(setAnswers)
      .catch(() => setErrorAnswers(true))
      .finally(() => setLoadingAnswers(false))
  }, [id])

  useEffect(() => {
    fetchQuestion()
    fetchAnswers()
  }, [fetchQuestion, fetchAnswers])

  async function handleVoteQuestion(type) {
    if (!user || !question) return
    const data = await questionService.voteQuestion(question.id, type)
    setQuestion((prev) => ({ ...prev, vote_count: data.voteCount, my_vote: data.myVote }))
  }

  function handleQuestionCommentsChange(newComments) {
    setQuestion((prev) => ({ ...prev, comments: newComments }))
  }

  async function handleDeleteQuestion() {
    const ok = await confirm({
      title: 'Xóa câu hỏi',
      message: 'Xóa câu hỏi này? Hành động không thể hoàn tác.',
      danger: true,
    })
    if (!ok) return
    await questionService.deleteQuestion(question.id)
    showToast('Đã xóa câu hỏi')
    navigate('/')
  }

  function handleAnswerVoted(answerId, data) {
    setAnswers((prev) =>
      prev.map((a) => (a.id === answerId ? { ...a, vote_count: data.voteCount, my_vote: data.myVote } : a))
    )
  }

  function handleAnswerEdited(answerId, newContent) {
    setAnswers((prev) => prev.map((a) => (a.id === answerId ? { ...a, content: newContent } : a)))
  }

  function handleAnswerDeleted(answerId) {
    setAnswers((prev) => prev.filter((a) => a.id !== answerId))
  }

  function handleAnswerCommentsChange(answerId, newComments) {
    setAnswers((prev) => prev.map((a) => (a.id === answerId ? { ...a, comments: newComments } : a)))
  }

  if (loadingQuestion) {
    return (
      <div className="container question-detail-page stagger">
        <div className="skeleton" style={{ height: 28, width: '60%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 16, width: '100%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 16, width: '90%' }} />
      </div>
    )
  }

  if (errorQuestion || !question) {
    return (
      <div className="container">
        <div className="card state-box state-error">
          <span className="state-box-icon">
            <AlertCircle size={22} />
          </span>
          <p>Không tìm thấy câu hỏi hoặc có lỗi khi tải dữ liệu.</p>
          <Link to="/" className="btn btn-secondary btn-sm">
            Về trang chủ
          </Link>
        </div>
      </div>
    )
  }

  const isQuestionOwner = user && user.id === question.user_id
  const canDeleteQuestion = user && (isQuestionOwner || user.role === 'ADMIN')

  return (
    <div className="container content-with-sidebar question-detail-layout">
      <div className="question-detail-page stagger">
        <nav className="question-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Trang chủ</Link>
          {question.category_id && (
            <>
              <span>/</span>
              <Link to={`/questions?category_id=${question.category_id}`}>{question.category_name}</Link>
            </>
          )}
          <span>/</span>
          <span>Câu hỏi #{question.id}</span>
        </nav>

      <div className="question-detail-body card">
        <VoteButton
          voteCount={question.vote_count}
          myVote={question.my_vote}
          onVote={handleVoteQuestion}
          disabled={!user || isQuestionOwner}
          disabledTitle={!user ? 'Đăng nhập để vote' : 'Không thể vote cho câu hỏi của chính mình'}
        />

        <div className="question-detail-content">
          <div className="question-detail-meta-row">
            {question.accepted_count > 0 && (
              <span className="question-detail-solved">
                <Check size={12} strokeWidth={3} /> Đã giải quyết
              </span>
            )}
            <span>
              Đăng {formatRelativeTime(question.created_at)} · {question.views} lượt xem
            </span>
          </div>

          <h1 className="question-detail-title">{question.title}</h1>

          <MarkdownContent text={question.content} />

          {(question.category_id || question.tags.length > 0) && (
            <div className="question-detail-tags">
              <CategoryPill id={question.category_id} name={question.category_name} />
              {question.tags.map((t) => (
                <Tag key={t.id} id={t.id} name={t.name} />
              ))}
            </div>
          )}

          <div className="question-detail-actions">
            {isQuestionOwner && (
              <Link to={`/questions/${question.id}/edit`} className="btn btn-ghost btn-sm">
                <Pencil size={14} /> Sửa câu hỏi
              </Link>
            )}
            {canDeleteQuestion && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleDeleteQuestion}>
                <Trash2 size={14} /> Xóa câu hỏi
              </button>
            )}
            <SaveButton questionId={question.id} saved={question.is_saved} />
            <ShareButton title={question.title} />
            {!isQuestionOwner && user && <ReportButton targetType="QUESTION" targetId={question.id} />}
            <span className="question-detail-author">
              <UserAvatar username={question.author_username} avatar={question.author_avatar} size={32} />
              <span className="question-detail-author-info">
                <Link to={`/users/${question.user_id}`} className="question-detail-author-name">
                  {question.author_username}
                </Link>
                <small>Người đăng câu hỏi</small>
              </span>
            </span>
          </div>

          <CommentList
            comments={question.comments}
            questionId={question.id}
            postAuthorId={question.user_id}
            onChange={handleQuestionCommentsChange}
          />
        </div>
      </div>

      <h2 className="answers-heading">
        <span className="answers-heading-icon">
          <MessageSquare size={15} />
        </span>
        {loadingAnswers ? 'Câu trả lời' : `${answers.length} câu trả lời`}
      </h2>

      {loadingAnswers && (
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 16, width: '60%' }} />
        </div>
      )}

      {errorAnswers && (
        <div className="card state-box state-error">
          <span className="state-box-icon">
            <AlertCircle size={22} />
          </span>
          <p>Không tải được câu trả lời.</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={fetchAnswers}>
            Thử lại
          </button>
        </div>
      )}

      {!loadingAnswers && !errorAnswers && answers.length === 0 && (
        <div className="card state-box">
          <span className="state-box-icon">
            <MessageSquarePlus size={22} />
          </span>
          <p>Chưa có câu trả lời nào. Hãy là người đầu tiên trả lời!</p>
        </div>
      )}

      {!loadingAnswers && !errorAnswers && answers.length > 0 && (
        <div className="answer-list card">
          {answers.map((a, i) => (
            <AnswerItem
              key={a.id}
              answer={a}
              animationDelay={`${Math.min(i, 8) * 30}ms`}
              questionOwnerId={question.user_id}
              onVoted={handleAnswerVoted}
              onEdited={handleAnswerEdited}
              onDeleted={handleAnswerDeleted}
              onAccepted={fetchAnswers}
              onCommentsChange={handleAnswerCommentsChange}
            />
          ))}
        </div>
      )}

      <div className="answer-form-section">
        {user ? (
          <AnswerForm questionId={question.id} onSubmitted={fetchAnswers} />
        ) : (
          <div className="card state-box">
            <p>
              <Link to="/login">Đăng nhập</Link> để trả lời câu hỏi này.
            </p>
          </div>
        )}
      </div>
    </div>
      <QuestionAside question={question} answerCount={loadingAnswers ? null : answers.length} />
    </div>
  )
}

export default QuestionDetailPage

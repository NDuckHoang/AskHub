import { useCallback, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShieldCheck, Pencil, Phone } from 'lucide-react'
import * as userService from '../services/userService'
import * as questionService from '../services/questionService'
import { useAuth } from '../hooks/useAuth'
import UserAvatar from '../components/UserAvatar'
import QuestionList from '../components/QuestionList'
import UserAnswerItem from '../components/UserAnswerItem'
import { formatRelativeTime } from '../utils/formatTime'
import '../components/QuestionSortBar.css'
import './UserProfilePage.css'

const GENDER_LABELS = { MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' }

const TABS = [
  { value: 'questions', label: 'Câu hỏi' },
  { value: 'answers', label: 'Câu trả lời' },
  { value: 'activity', label: 'Hoạt động' },
  { value: 'saved', label: 'Đã lưu' },
]

function formatJoinDate(dateString) {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function UserProfilePage() {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const isOwnProfile = currentUser && String(currentUser.id) === id
  const [profile, setProfile] = useState(null)
  const [profileError, setProfileError] = useState(false)
  const [tab, setTab] = useState('questions')

  const [questions, setQuestions] = useState(null)
  const [questionsError, setQuestionsError] = useState(false)
  const [answers, setAnswers] = useState(null)
  const [answersError, setAnswersError] = useState(false)
  const [savedQuestions, setSavedQuestions] = useState(null)
  const [savedError, setSavedError] = useState(false)

  useEffect(() => {
    setProfile(null)
    setProfileError(false)
    setTab('questions')
    setQuestions(null)
    setAnswers(null)
    setSavedQuestions(null)
    userService
      .getUserProfile(id)
      .then(setProfile)
      .catch(() => setProfileError(true))
  }, [id])

  const fetchQuestions = useCallback(() => {
    setQuestions(null)
    setQuestionsError(false)
    questionService
      .getQuestions({ user_id: id, sort: 'newest', limit: 20 })
      .then((data) => setQuestions(data.questions))
      .catch(() => setQuestionsError(true))
  }, [id])

  const fetchAnswers = useCallback(() => {
    setAnswers(null)
    setAnswersError(false)
    userService
      .getUserAnswers(id, { limit: 20 })
      .then((data) => setAnswers(data.answers))
      .catch(() => setAnswersError(true))
  }, [id])

  const fetchSavedQuestions = useCallback(() => {
    setSavedQuestions(null)
    setSavedError(false)
    questionService
      .getSavedQuestions({ limit: 20 })
      .then((data) => setSavedQuestions(data.questions))
      .catch(() => setSavedError(true))
  }, [])

  // Chỉ fetch dữ liệu của tab khi thật sự cần (lần đầu mở tab đó)
  useEffect(() => {
    if (!profile) return
    if ((tab === 'questions' || tab === 'activity') && questions === null && !questionsError) {
      fetchQuestions()
    }
    if ((tab === 'answers' || tab === 'activity') && answers === null && !answersError) {
      fetchAnswers()
    }
    if (tab === 'saved' && isOwnProfile && savedQuestions === null && !savedError) {
      fetchSavedQuestions()
    }
  }, [
    tab,
    profile,
    questions,
    answers,
    savedQuestions,
    questionsError,
    answersError,
    savedError,
    isOwnProfile,
    fetchQuestions,
    fetchAnswers,
    fetchSavedQuestions,
  ])

  if (profileError) {
    return (
      <div className="container">
        <div className="card state-box state-error">
          <p>Không tìm thấy người dùng này.</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container user-profile-page">
        <div className="skeleton" style={{ height: 100, marginTop: 20, borderRadius: 8 }} />
      </div>
    )
  }

  // Hoạt động: gộp câu hỏi + câu trả lời, sắp theo thời gian mới nhất
  const activityItems =
    questions && answers
      ? [
          ...questions.map((q) => ({ type: 'question', time: q.created_at, data: q })),
          ...answers.map((a) => ({ type: 'answer', time: a.created_at, data: a })),
        ].sort((a, b) => new Date(b.time) - new Date(a.time))
      : null

  return (
    <div className="container user-profile-page">
      <div className="card user-profile-header">
        <UserAvatar username={profile.username} avatar={profile.avatar} size={64} />
        <div className="user-profile-info">
          <h1>
            {profile.username}
            {profile.role === 'ADMIN' && (
              <span className="user-profile-admin-badge">
                <ShieldCheck size={14} /> Admin
              </span>
            )}
          </h1>
          <div className="user-profile-stats">
            <span>Tham gia {formatJoinDate(profile.created_at)}</span>
            {profile.gender && (
              <>
                <span>·</span>
                <span>{GENDER_LABELS[profile.gender]}</span>
              </>
            )}
            <span>·</span>
            <span>
              <strong className="stat-number">{profile.reputation}</strong> điểm uy tín
            </span>
            <span>·</span>
            <span>
              <strong className="stat-number">{profile.question_count}</strong> câu hỏi
            </span>
            <span>·</span>
            <span>
              <strong className="stat-number">{profile.answer_count}</strong> câu trả lời
            </span>
          </div>
          {profile.bio && <p className="user-profile-bio">{profile.bio}</p>}
          {profile.contact && (
            <span className="user-profile-contact">
              <Phone size={13} /> {profile.contact}
            </span>
          )}
        </div>
        {isOwnProfile && (
          <Link to={`/users/${id}/edit`} className="btn btn-secondary btn-sm user-profile-edit-btn">
            <Pencil size={14} /> Chỉnh sửa hồ sơ
          </Link>
        )}
      </div>

      <div className="question-sort-tabs user-profile-tabs">
        {TABS.filter((t) => t.value !== 'saved' || isOwnProfile).map((t) => (
          <button
            key={t.value}
            type="button"
            className={`question-sort-tab${tab === t.value ? ' is-active' : ''}`}
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'questions' && (
        <QuestionList
          questions={questions || []}
          loading={questions === null}
          error={questionsError}
          onRetry={fetchQuestions}
        />
      )}

      {tab === 'answers' && (
        <>
          {answers === null && !answersError && (
            <div className="skeleton" style={{ height: 160, borderRadius: 8 }} />
          )}
          {answersError && (
            <div className="card state-box state-error">
              <p>Không tải được câu trả lời.</p>
              <button type="button" className="btn btn-secondary btn-sm" onClick={fetchAnswers}>
                Thử lại
              </button>
            </div>
          )}
          {answers && answers.length === 0 && (
            <div className="card state-box">
              <p>Người dùng này chưa trả lời câu hỏi nào.</p>
            </div>
          )}
          {answers && answers.length > 0 && (
            <div className="card user-answer-list">
              {answers.map((a) => (
                <UserAnswerItem key={a.id} answer={a} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'saved' && isOwnProfile && (
        <QuestionList
          questions={savedQuestions || []}
          loading={savedQuestions === null}
          error={savedError}
          onRetry={fetchSavedQuestions}
          emptyMessage="Bạn chưa lưu câu hỏi nào. Lưu lại câu hỏi hay để xem lại sau."
          emptyActionTo="/questions"
          emptyActionLabel="Khám phá câu hỏi"
        />
      )}

      {tab === 'activity' && (
        <>
          {!activityItems && <div className="skeleton" style={{ height: 160, borderRadius: 8 }} />}
          {activityItems && activityItems.length === 0 && (
            <div className="card state-box">
              <p>Chưa có hoạt động nào.</p>
            </div>
          )}
          {activityItems && activityItems.length > 0 && (
            <div className="card user-activity-list">
              {activityItems.map((item) => (
                <div key={`${item.type}-${item.data.id}`} className="user-activity-item">
                  <span className="user-activity-label">
                    {item.type === 'question' ? 'Đặt câu hỏi' : 'Trả lời'}
                  </span>
                  <Link
                    to={
                      item.type === 'question'
                        ? `/questions/${item.data.id}`
                        : `/questions/${item.data.question_id}`
                    }
                  >
                    {item.type === 'question' ? item.data.title : item.data.question_title}
                  </Link>
                  <span className="user-activity-time">{formatRelativeTime(item.time)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default UserProfilePage

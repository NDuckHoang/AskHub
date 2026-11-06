import { useCallback, useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { ShieldCheck, Pencil, Phone, UserX, MessageSquare, Activity, AlertCircle, Star, HelpCircle, CheckCircle2 } from 'lucide-react'
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

// Số đếm hiển thị cạnh tên tab (null = không hiện)
function getTabCount(tab, profile, activityItems) {
  if (tab === 'questions') return profile.question_count
  if (tab === 'answers') return profile.answer_count
  if (tab === 'activity') return activityItems ? activityItems.length : null
  return null
}

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
  // Tab đang mở lưu trên URL (?tab=answers) để sidebar có thể trỏ thẳng tới
  // 'Câu trả lời của tôi' / 'Câu hỏi đã lưu'. Không có ?tab hoặc giá trị lạ -> tab Câu hỏi.
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const tab = TABS.some((t) => t.value === tabParam) ? tabParam : 'questions'

  function setTab(value) {
    setSearchParams(value === 'questions' ? {} : { tab: value }, { replace: true })
  }

  const [questions, setQuestions] = useState(null)
  const [questionsError, setQuestionsError] = useState(false)
  const [answers, setAnswers] = useState(null)
  const [answersError, setAnswersError] = useState(false)
  const [savedQuestions, setSavedQuestions] = useState(null)
  const [savedError, setSavedError] = useState(false)

  useEffect(() => {
    setProfile(null)
    setProfileError(false)
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
    // Cột phải (chủ đề + hoạt động gần đây) cần cả câu hỏi lẫn câu trả lời, nên tải ngay khi có hồ sơ
    if (questions === null && !questionsError) {
      fetchQuestions()
    }
    if (answers === null && !answersError) {
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
          <span className="state-box-icon">
            <UserX size={22} />
          </span>
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

  // Chủ đề hay hỏi: đếm câu hỏi của người dùng theo danh mục (tối đa 5 mục, nhiều nhất trước)
  const topicCounts = {}
  ;(questions || []).forEach((q) => {
    topicCounts[q.category_name] = (topicCounts[q.category_name] || 0) + 1
  })
  const topTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="container user-profile-page">
      <div className="card user-profile-header">
        <div className="user-profile-cover" />
        <div className="user-profile-head-row">
          <div className="user-profile-avatar-wrap">
            <UserAvatar username={profile.username} avatar={profile.avatar} size={96} />
          </div>

          <div className="user-profile-info">
            <div className="user-profile-name-row">
              <h1>{profile.username}</h1>
              <span className="user-profile-admin-badge">
                {profile.role === 'ADMIN' ? (
                  <>
                    <ShieldCheck size={13} /> Admin
                  </>
                ) : (
                  'Thành viên'
                )}
              </span>
            </div>

            <div className="user-profile-meta">
              <span>Tham gia {formatJoinDate(profile.created_at)}</span>
              {profile.gender && (
                <>
                  <span>·</span>
                  <span>{GENDER_LABELS[profile.gender]}</span>
                </>
              )}
              {profile.contact && (
                <>
                  <span>·</span>
                  <span className="user-profile-contact">
                    <Phone size={13} /> {profile.contact}
                  </span>
                </>
              )}
              {profile.bio && (
                <>
                  <span>·</span>
                  <span>{profile.bio}</span>
                </>
              )}
            </div>
          </div>

          {isOwnProfile && (
            <Link to={`/users/${id}/edit`} className="user-profile-edit-btn">
              <Pencil size={16} /> Chỉnh sửa hồ sơ
            </Link>
          )}
        </div>
      </div>

      <div className="user-profile-stats stagger">
        <div className="user-profile-stat">
          <span className="user-profile-stat-icon is-accent"><Star size={20} /></span>
          <div>
            <div className="user-profile-stat-value stat-number">{profile.reputation}</div>
            <div className="user-profile-stat-label">điểm uy tín</div>
          </div>
        </div>
        <div className="user-profile-stat">
          <span className="user-profile-stat-icon"><HelpCircle size={20} /></span>
          <div>
            <div className="user-profile-stat-value stat-number">{profile.question_count}</div>
            <div className="user-profile-stat-label">câu hỏi</div>
          </div>
        </div>
        <div className="user-profile-stat">
          <span className="user-profile-stat-icon is-success"><CheckCircle2 size={20} /></span>
          <div>
            <div className="user-profile-stat-value stat-number">{profile.answer_count}</div>
            <div className="user-profile-stat-label">câu trả lời</div>
          </div>
        </div>
      </div>

      <div className="user-profile-layout">
      <div className="user-profile-main">
      <div className="user-profile-tabs" role="tablist">
        {TABS.filter((t) => t.value !== 'saved' || isOwnProfile).map((t) => {
          const count = getTabCount(t.value, profile, activityItems)
          return (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={tab === t.value}
              className={`user-profile-tab${tab === t.value ? ' is-active' : ''}`}
              onClick={() => setTab(t.value)}
            >
              {t.label}
              {count !== null && <span className="user-profile-tab-count">{count}</span>}
            </button>
          )
        })}
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
              <span className="state-box-icon">
                <AlertCircle size={22} />
              </span>
              <p>Không tải được câu trả lời.</p>
              <button type="button" className="btn btn-secondary btn-sm" onClick={fetchAnswers}>
                Thử lại
              </button>
            </div>
          )}
          {answers && answers.length === 0 && (
            <div className="card state-box">
              <span className="state-box-icon">
                <MessageSquare size={22} />
              </span>
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
              <span className="state-box-icon">
                <Activity size={22} />
              </span>
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

      <aside className="user-profile-aside">
        <div className="card user-profile-aside-card">
          <h2 className="user-profile-aside-title">Chủ đề hay hỏi</h2>
          {topTopics.length === 0 ? (
            <p className="user-profile-aside-empty">Chưa có dữ liệu.</p>
          ) : (
            topTopics.map(([name, count]) => (
              <div key={name} className="user-profile-topic">
                <div className="user-profile-topic-head">
                  <span>{name}</span>
                  <span className="stat-number">{count}</span>
                </div>
                <div className="user-profile-topic-bar">
                  <span style={{ width: `${(count / topTopics[0][1]) * 100}%` }} />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card user-profile-aside-card">
          <h2 className="user-profile-aside-title">Hoạt động gần đây</h2>
          {!activityItems || activityItems.length === 0 ? (
            <p className="user-profile-aside-empty">Chưa có hoạt động nào.</p>
          ) : (
            <ul className="user-profile-recent">
              {activityItems.slice(0, 5).map((item) => (
                <li key={`${item.type}-${item.data.id}`}>
                  <span className={`user-profile-recent-dot${item.type === 'answer' ? ' is-answer' : ''}`} />
                  <span>
                    {item.type === 'question' ? 'Đặt câu hỏi mới' : 'Trả lời một câu hỏi'}
                    <span className="user-profile-recent-time"> · {formatRelativeTime(item.time)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
      </div>
    </div>
  )
}

export default UserProfilePage

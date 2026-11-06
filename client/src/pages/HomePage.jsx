import { useCallback, useEffect, useState } from 'react'
import * as questionService from '../services/questionService'
import QuestionList from '../components/QuestionList'
import Hero from '../components/Hero'
import CategoryChips from '../components/CategoryChips'
import HomeHighlights from '../components/HomeHighlights'
import Pagination from '../components/Pagination'
import Sidebar from '../components/Sidebar'
import '../components/QuestionSortBar.css'
import './HomePage.css'

// 4 kiểu sắp xếp giống prototype; filter/search đầy đủ vẫn ở /questions
const HOME_SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'votes', label: 'Nhiều vote' },
  { value: 'answers', label: 'Nhiều trả lời' },
  { value: 'unanswered', label: 'Chưa trả lời' },
]

const PAGE_SIZE = 10
const RECENT_DAYS = 2

function HomePage() {
  const [questions, setQuestions] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [totalAll, setTotalAll] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)

  const fetchQuestions = useCallback(() => {
    setLoading(true)
    setError(false)

    // Trang 1, sort "Mới nhất": ưu tiên câu hỏi trong RECENT_DAYS ngày gần đây,
    // nếu chưa đủ 1 trang thì lấy thêm câu cũ hơn cho đủ (tránh trang chủ trống trải)
    if (sort === 'newest' && page === 1) {
      Promise.all([
        questionService.getQuestions({ sort: 'newest', days: RECENT_DAYS, page: 1, limit: PAGE_SIZE }),
        questionService.getQuestions({ sort: 'newest', page: 1, limit: PAGE_SIZE }),
      ])
        .then(([recentData, fullData]) => {
          const recentIds = new Set(recentData.questions.map((q) => q.id))
          const merged = [
            ...recentData.questions,
            ...fullData.questions.filter((q) => !recentIds.has(q.id)),
          ].slice(0, PAGE_SIZE)
          setQuestions(merged)
          setPagination(fullData.pagination)
          setTotalAll(fullData.pagination.total)
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false))
      return
    }

    questionService
      .getQuestions({ sort, page, limit: PAGE_SIZE })
      .then((data) => {
        setQuestions(data.questions)
        setPagination(data.pagination)
        if (sort !== 'unanswered') setTotalAll(data.pagination.total)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [sort, page])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  function handleSortChange(value) {
    setSort(value)
    setPage(1)
  }

  return (
    <div className="container home-page stagger">
      <Hero totalQuestions={totalAll} />
      <CategoryChips />
      <HomeHighlights />

      <div className="content-with-sidebar">
        <div>
          <div className="home-simple-toolbar">
            <h2 className="home-section-title">Câu hỏi mới nhất</h2>

            <div className="home-simple-tabs" role="tablist">
              {HOME_SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="tab"
                  aria-selected={sort === opt.value}
                  className={`question-sort-tab${sort === opt.value ? ' is-active' : ''}`}
                  onClick={() => handleSortChange(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <QuestionList
            questions={questions}
            loading={loading}
            error={error}
            onRetry={fetchQuestions}
          />

          <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
        </div>

        <Sidebar />
      </div>
    </div>
  )
}

export default HomePage

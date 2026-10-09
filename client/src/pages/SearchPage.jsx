import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import * as questionService from '../services/questionService'
import * as categoryService from '../services/categoryService'
import QuestionList from '../components/QuestionList'
import Pagination from '../components/Pagination'
import Sidebar from '../components/Sidebar'
import '../components/QuestionSortBar.css'
import './SearchPage.css'

// Trang /search: tìm theo tiêu đề/nội dung/tag (mục 13), có filter category, URL lưu q/category_id/page
function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const keyword = searchParams.get('q') || ''
  const categoryId = searchParams.get('category_id') || ''
  const page = Number(searchParams.get('page')) || 1

  const [questions, setQuestions] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(() => {})
  }, [])

  const fetchResults = useCallback(() => {
    if (!keyword.trim()) return

    setLoading(true)
    setError(false)
    questionService
      .getQuestions({ q: keyword, category_id: categoryId || undefined, page, limit: 10 })
      .then((data) => {
        setQuestions(data.questions)
        setPagination(data.pagination)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [keyword, categoryId, page])

  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  function updateParams(updates, resetPage = true) {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value)
      else next.delete(key)
    })
    if (resetPage) next.delete('page')
    setSearchParams(next)
  }

  if (!keyword.trim()) {
    return (
      <div className="container">
        <div className="card state-box">
          <p>Nhập từ khóa vào ô tìm kiếm ở trên để bắt đầu tìm câu hỏi.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container content-with-sidebar">
      <div>
        <h1 className="search-heading">Kết quả tìm kiếm cho: {keyword}</h1>

        <div className="search-toolbar">
          {!loading && !error && (
            <span className="question-toolbar-count">{pagination.total} câu hỏi</span>
          )}

          <select
            className="select search-category-select"
            value={categoryId}
            onChange={(e) => updateParams({ category_id: e.target.value || null })}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <QuestionList
          questions={questions}
          loading={loading}
          error={error}
          onRetry={fetchResults}
        />

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onChange={(newPage) => updateParams({ page: String(newPage) }, false)}
        />
      </div>

      <Sidebar />
    </div>
  )
}

export default SearchPage

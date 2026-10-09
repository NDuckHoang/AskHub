import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { X } from 'lucide-react'
import * as questionService from '../services/questionService'
import * as categoryService from '../services/categoryService'
import QuestionList from '../components/QuestionList'
import QuestionSortBar from '../components/QuestionSortBar'
import Pagination from '../components/Pagination'
import Sidebar from '../components/Sidebar'
import './QuestionsPage.css'

// Trang /questions: giống Home nhưng filter (danh mục, tag, sort, trang) lưu trên URL
// để các link từ Sidebar/Tag (vd /questions?category_id=3) mở ra đúng kết quả đã lọc.
function QuestionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const sort = searchParams.get('sort') || 'newest'
  const categoryId = searchParams.get('category_id') || ''
  const tagId = searchParams.get('tag_id') || ''
  const page = Number(searchParams.get('page')) || 1

  const [questions, setQuestions] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(() => {})
  }, [])

  const fetchQuestions = useCallback(() => {
    setLoading(true)
    setError(false)
    questionService
      .getQuestions({
        sort,
        category_id: categoryId || undefined,
        tag_id: tagId || undefined,
        page,
        limit: 10,
      })
      .then((data) => {
        setQuestions(data.questions)
        setPagination(data.pagination)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [sort, categoryId, tagId, page])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  // Cập nhật URL query params, bỏ page cũ mỗi khi đổi filter/sort
  function updateParams(updates, resetPage = true) {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value)
      else next.delete(key)
    })
    if (resetPage) next.delete('page')
    setSearchParams(next)
  }

  const activeCategory = categoryId ? categories.find((c) => String(c.id) === categoryId) : null
  const activeTag = tagId
    ? questions.flatMap((q) => q.tags).find((t) => String(t.id) === tagId)
    : null

  return (
    <div className="container content-with-sidebar">
      <div>
        <h1>Câu hỏi</h1>

        {(activeCategory || tagId) && (
          <div className="active-filter-banner">
            <span>
              Đang lọc theo
              {activeCategory && <strong> danh mục "{activeCategory.name}"</strong>}
              {activeCategory && tagId && ' và'}
              {tagId && <strong> tag "{activeTag ? activeTag.name : '…'}"</strong>}
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => updateParams({ category_id: null, tag_id: null })}
            >
              <X size={14} /> Bỏ lọc
            </button>
          </div>
        )}

        <QuestionSortBar
          total={pagination.total}
          loading={loading}
          error={error}
          sort={sort}
          onSortChange={(value) => updateParams({ sort: value })}
          categoryId={categoryId}
          onCategoryChange={(e) => updateParams({ category_id: e.target.value || null })}
          categories={categories}
        />

        <QuestionList
          questions={questions}
          loading={loading}
          error={error}
          onRetry={fetchQuestions}
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

export default QuestionsPage

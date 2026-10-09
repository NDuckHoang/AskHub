import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as categoryService from '../services/categoryService'
import * as questionService from '../services/questionService'
import './CategoriesPage.css'

const SAMPLE_COUNT = 3

function CategorySkeleton() {
  return (
    <div className="card category-card-skeleton">
      <div className="skeleton" style={{ height: 18, width: '50%', marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 14 }} />
      <div className="skeleton" style={{ height: 13, width: '85%', marginBottom: 4 }} />
      <div className="skeleton" style={{ height: 13, width: '75%' }} />
    </div>
  )
}

function CategoriesPage() {
  const [categories, setCategories] = useState(null)
  const [error, setError] = useState(false)

  function fetchCategories() {
    setCategories(null)
    setError(false)

    categoryService
      .getCategories()
      .then((data) => {
        const sorted = [...data].sort((a, b) => b.question_count - a.question_count)
        // Lấy kèm vài câu hỏi tiêu biểu gần đây cho mỗi danh mục, để trang này có nội dung
        // thật sự riêng (không chỉ là bản sao tên + số lượng của sidebar)
        return Promise.all(
          sorted.map((c) =>
            questionService
              .getQuestions({ category_id: c.id, sort: 'newest', limit: SAMPLE_COUNT })
              .then((res) => ({ ...c, sampleQuestions: res.questions }))
              .catch(() => ({ ...c, sampleQuestions: [] }))
          )
        )
      })
      .then(setCategories)
      .catch(() => setError(true))
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return (
    <div className="container categories-page">
      <h1>Danh mục</h1>
      <p className="categories-subtitle">Chọn một danh mục để xem các câu hỏi liên quan.</p>

      {!categories && !error && (
        <div className="category-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <CategorySkeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="card state-box state-error">
          <p>Không tải được danh sách danh mục. Vui lòng thử lại.</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={fetchCategories}>
            Thử lại
          </button>
        </div>
      )}

      {categories && categories.length === 0 && (
        <div className="card state-box">
          <p>Chưa có danh mục nào.</p>
        </div>
      )}

      {categories && categories.length > 0 && (
        <div className="category-grid">
          {categories.map((c) => (
            <div key={c.id} className="card category-card">
              <Link to={`/questions?category_id=${c.id}`} className="category-card-header">
                <h2>{c.name}</h2>
                <span className="category-count stat-number">{c.question_count} câu hỏi</span>
              </Link>

              {c.description && <p className="category-description">{c.description}</p>}

              {c.sampleQuestions.length > 0 ? (
                <ul className="category-sample-list">
                  {c.sampleQuestions.map((q) => (
                    <li key={q.id}>
                      <Link to={`/questions/${q.id}`}>{q.title}</Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="category-no-questions">Chưa có câu hỏi nào trong danh mục này.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CategoriesPage

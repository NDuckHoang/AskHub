import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import * as questionService from '../services/questionService'
import * as adminService from '../services/adminService'
import * as categoryService from '../services/categoryService'
import Pagination from './Pagination'
import ExportButton from './ExportButton'
import { formatRelativeTime } from '../utils/formatTime'
import './AdminRowList.css'

function AdminQuestionsPanel() {
  const [questions, setQuestions] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState('')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(() => {})
  }, [])

  const fetchQuestions = useCallback(() => {
    setQuestions(null)
    setError(false)
    questionService
      .getQuestions({ sort: 'newest', page, limit: 10, q: search || undefined })
      .then((data) => {
        setQuestions(data.questions)
        setPagination(data.pagination)
      })
      .catch(() => setError(true))
  }, [search, page])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  function handleSearchSubmit(e) {
    e.preventDefault()
    setSearch(searchInput.trim())
    setPage(1)
  }

  async function handleDelete(q) {
    if (!window.confirm(`Xóa câu hỏi "${q.title}"?`)) return
    setActionError('')
    try {
      await adminService.deleteQuestion(q.id)
      fetchQuestions()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Xóa thất bại')
    }
  }

  return (
    <div>
      <div className="admin-panel-toolbar">
        <ExportButton
          label="Xuất Excel"
          filterSummary={search ? `tìm kiếm "${search}"` : ''}
          fields={[
            {
              name: 'category_id',
              label: 'Danh mục',
              options: [
                { value: '', label: 'Tất cả' },
                ...categories.map((c) => ({ value: String(c.id), label: c.name })),
              ],
            },
          ]}
          onExport={(extra) => adminService.exportQuestions({ search: search || undefined, ...extra })}
        />
      </div>

      <form className="admin-search-form" onSubmit={handleSearchSubmit}>
        <input
          className="input admin-search-input"
          placeholder="Tìm theo tiêu đề, nội dung hoặc tag..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary btn-sm">
          Tìm
        </button>
      </form>

      {actionError && <div className="auth-error">{actionError}</div>}

      {questions === null && !error && <div className="skeleton" style={{ height: 240, borderRadius: 8 }} />}

      {error && (
        <div className="card state-box state-error">
          <p>Không tải được danh sách câu hỏi.</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={fetchQuestions}>
            Thử lại
          </button>
        </div>
      )}

      {questions && questions.length === 0 && (
        <div className="card state-box">
          <p>Không tìm thấy câu hỏi nào.</p>
        </div>
      )}

      {questions && questions.length > 0 && (
        <div className="card admin-row-list">
          {questions.map((q) => (
            <div key={q.id} className="admin-row">
              <div className="admin-row-info">
                <Link to={`/questions/${q.id}`}>{q.title}</Link>
                <span className="admin-row-meta">
                  {q.author_username} · {formatRelativeTime(q.created_at)} · {q.answer_count} trả lời
                </span>
              </div>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(q)}>
                <Trash2 size={14} /> Xóa
              </button>
            </div>
          ))}
        </div>
      )}

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
    </div>
  )
}

export default AdminQuestionsPanel

import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Check } from 'lucide-react'
import * as adminService from '../services/adminService'
import Pagination from './Pagination'
import ExportButton from './ExportButton'
import { formatRelativeTime } from '../utils/formatTime'
import './AdminRowList.css'
import './AdminAnswersPanel.css'

function AdminAnswersPanel() {
  const [answers, setAnswers] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState('')

  const fetchAnswers = useCallback(() => {
    setAnswers(null)
    setError(false)
    adminService
      .getAnswers({ page, limit: 10, search: search || undefined })
      .then((data) => {
        setAnswers(data.answers)
        setPagination(data.pagination)
      })
      .catch(() => setError(true))
  }, [search, page])

  useEffect(() => {
    fetchAnswers()
  }, [fetchAnswers])

  function handleSearchSubmit(e) {
    e.preventDefault()
    setSearch(searchInput.trim())
    setPage(1)
  }

  async function handleDelete(a) {
    if (!window.confirm('Xóa câu trả lời này?')) return
    setActionError('')
    try {
      await adminService.deleteAnswer(a.id)
      fetchAnswers()
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
              name: 'accepted',
              label: 'Trạng thái',
              options: [
                { value: '', label: 'Tất cả' },
                { value: '1', label: 'Đã chấp nhận' },
                { value: '0', label: 'Chưa chấp nhận' },
              ],
            },
          ]}
          onExport={(extra) => adminService.exportAnswers({ search: search || undefined, ...extra })}
        />
      </div>

      <form className="admin-search-form" onSubmit={handleSearchSubmit}>
        <input
          className="input admin-search-input"
          placeholder="Tìm theo nội dung, câu hỏi hoặc người trả lời..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary btn-sm">
          Tìm
        </button>
      </form>

      {actionError && <div className="auth-error">{actionError}</div>}

      {answers === null && !error && <div className="skeleton" style={{ height: 240, borderRadius: 8 }} />}

      {error && (
        <div className="card state-box state-error">
          <p>Không tải được danh sách câu trả lời.</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={fetchAnswers}>
            Thử lại
          </button>
        </div>
      )}

      {answers && answers.length === 0 && (
        <div className="card state-box">
          <p>Không tìm thấy câu trả lời nào.</p>
        </div>
      )}

      {answers && answers.length > 0 && (
        <div className="card admin-row-list">
          {answers.map((a) => (
            <div key={a.id} className="admin-row">
              <div className="admin-row-info">
                <div className="admin-answer-question-line">
                  <Link to={`/questions/${a.question_id}`}>{a.question_title}</Link>
                  {a.is_accepted === 1 && (
                    <span className="admin-answer-badge">
                      <Check size={12} /> Chấp nhận
                    </span>
                  )}
                </div>
                <p className="admin-answer-content">{a.content}</p>
                <span className="admin-row-meta">
                  {a.author_username} · {formatRelativeTime(a.created_at)}
                </span>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleDelete(a)}>
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

export default AdminAnswersPanel

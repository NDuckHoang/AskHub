import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, X } from 'lucide-react'
import * as adminService from '../services/adminService'
import { useConfirm } from '../hooks/useConfirm'
import { useToast } from '../hooks/useToast'
import Pagination from './Pagination'
import { formatRelativeTime } from '../utils/formatTime'
import './AdminRowList.css'
import './AdminReportsPanel.css'

const TARGET_LABELS = { QUESTION: 'Câu hỏi', ANSWER: 'Câu trả lời', COMMENT: 'Bình luận' }
const STATUS_FILTERS = [
  { value: 'PENDING', label: 'Chờ xử lý' },
  { value: 'RESOLVED', label: 'Đã xử lý' },
  { value: 'DISMISSED', label: 'Đã bỏ qua' },
]

function targetLink(report) {
  if (!report.question_id) return null
  return `/questions/${report.question_id}`
}

function AdminReportsPanel() {
  const confirm = useConfirm()
  const showToast = useToast()
  const [status, setStatus] = useState('PENDING')
  const [reports, setReports] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [error, setError] = useState(false)
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState('')

  const fetchReports = useCallback(() => {
    setReports(null)
    setError(false)
    adminService
      .getReports({ status, page, limit: 10 })
      .then((data) => {
        setReports(data.reports)
        setPagination(data.pagination)
      })
      .catch(() => setError(true))
  }, [status, page])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  function handleStatusChange(value) {
    setStatus(value)
    setPage(1)
  }

  async function handleRemoveContent(r) {
    const ok = await confirm({
      title: 'Xóa nội dung vi phạm',
      message: 'Xóa nội dung vi phạm này? Hành động không thể hoàn tác.',
      danger: true,
    })
    if (!ok) return
    setActionError('')
    try {
      await adminService.resolveReport(r.id, 'RESOLVED', true)
      fetchReports()
      showToast('Đã xóa nội dung vi phạm')
    } catch (err) {
      setActionError(err.response?.data?.message || 'Thao tác thất bại')
    }
  }

  async function handleDismiss(r) {
    setActionError('')
    try {
      await adminService.resolveReport(r.id, 'DISMISSED', false)
      fetchReports()
      showToast('Đã bỏ qua báo cáo')
    } catch (err) {
      setActionError(err.response?.data?.message || 'Thao tác thất bại')
    }
  }

  return (
    <div>
      <div className="admin-panel-toolbar admin-report-filters">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`btn btn-sm ${status === f.value ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => handleStatusChange(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {actionError && <div className="auth-error">{actionError}</div>}

      {reports === null && !error && <div className="skeleton" style={{ height: 240, borderRadius: 8 }} />}

      {error && (
        <div className="card state-box state-error">
          <p>Không tải được danh sách báo cáo.</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={fetchReports}>
            Thử lại
          </button>
        </div>
      )}

      {reports && reports.length === 0 && (
        <div className="card state-box">
          <p>Không có báo cáo nào ở trạng thái này.</p>
        </div>
      )}

      {reports && reports.length > 0 && (
        <div className="card admin-row-list">
          {reports.map((r) => (
            <div key={r.id} className="admin-row">
              <div className="admin-row-info">
                <div className="admin-report-target-line">
                  <span className="admin-role-badge">{TARGET_LABELS[r.target_type]}</span>
                  {targetLink(r) && <Link to={targetLink(r)}>Xem nội dung gốc</Link>}
                </div>
                <p className="admin-report-preview">{r.target_preview || '(Nội dung đã bị xóa)'}</p>
                <p className="admin-report-reason">Lý do: {r.reason}</p>
                <span className="admin-row-meta">
                  Báo cáo bởi {r.reporter_username} · {formatRelativeTime(r.created_at)}
                </span>
              </div>
              {status === 'PENDING' && (
                <div className="admin-report-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleDismiss(r)}>
                    <X size={14} /> Bỏ qua
                  </button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveContent(r)}>
                    <Trash2 size={14} /> Xóa nội dung vi phạm
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
    </div>
  )
}

export default AdminReportsPanel

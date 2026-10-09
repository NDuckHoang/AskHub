import { useState } from 'react'
import { Flag } from 'lucide-react'
import Modal from './Modal'
import { useAuth } from '../hooks/useAuth'
import * as reportService from '../services/reportService'
import './ReportButton.css'

// Danh sách lý do báo cáo có sẵn để chọn nhanh, "Khác" cho phép nhập tự do
const REASON_OPTIONS = [
  'Spam hoặc quảng cáo',
  'Nội dung không phù hợp, phản cảm',
  'Thông tin sai lệch, gây hiểu nhầm',
  'Quấy rối, công kích cá nhân',
  'Vi phạm bản quyền',
  'Khác',
]

// Nút "Báo cáo" dùng chung cho câu hỏi/câu trả lời/bình luận.
// targetType phải khớp ENUM ở bảng reports: QUESTION, ANSWER, COMMENT
// compact: chỉ hiện icon, dùng ở chỗ chật như 1 dòng bình luận
function ReportButton({ targetType, targetId, compact = false }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  if (!user) return null

  const isOther = selectedReason === 'Khác'
  const finalReason = isOther ? customReason.trim() : selectedReason
  const canSubmit = selectedReason && (!isOther || customReason.trim())

  function handleClose() {
    setOpen(false)
    setSelectedReason('')
    setCustomReason('')
    setError('')
    setDone(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return

    setSubmitting(true)
    setError('')
    try {
      await reportService.createReport(targetType, targetId, finalReason)
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Gửi báo cáo thất bại, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {compact ? (
        <button type="button" className="comment-delete" onClick={() => setOpen(true)} aria-label="Báo cáo">
          <Flag size={14} />
        </button>
      ) : (
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>
          <Flag size={14} /> Báo cáo
        </button>
      )}

      {open && (
        <Modal title="Báo cáo nội dung vi phạm" onClose={handleClose}>
          {done ? (
            <p className="report-done-message">
              Đã gửi báo cáo, cảm ơn bạn. Quản trị viên sẽ xem xét sớm.
            </p>
          ) : (
            <form className="report-form" onSubmit={handleSubmit}>
              <span className="field-label">Chọn lý do báo cáo</span>
              <div className="report-reason-list" role="radiogroup">
                {REASON_OPTIONS.map((option) => (
                  <label key={option} className="report-reason-option">
                    <input
                      type="radio"
                      name={`report-reason-${targetType}-${targetId}`}
                      value={option}
                      checked={selectedReason === option}
                      onChange={() => setSelectedReason(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>

              {isOther && (
                <textarea
                  className="textarea"
                  rows={3}
                  placeholder="Mô tả cụ thể lý do bạn báo cáo..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  maxLength={500}
                  autoFocus
                />
              )}

              {error && <p className="field-error">{error}</p>}
              <div className="report-form-actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleClose}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !canSubmit}>
                  Gửi báo cáo
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </>
  )
}

export default ReportButton

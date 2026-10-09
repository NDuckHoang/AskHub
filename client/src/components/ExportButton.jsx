import { useState } from 'react'
import { Download } from 'lucide-react'
import Modal from './Modal'
import './ExportButton.css'

// Nút xuất Excel dùng chung: mở hộp thoại cho chọn khoảng ngày + các bộ lọc riêng của
// từng bảng (vd: vai trò, trạng thái, danh mục...) trước khi tải.
// fields: [{ name, label, options: [{ value, label }] }] - mỗi field render thành 1 dropdown,
// option value rỗng ("") nghĩa là "không lọc theo field này".
// onExport({ dateFrom, dateTo, ...giá trị các field }) tự gộp thêm với bộ lọc hiện tại của bảng gọi nó.
// filterSummary: mô tả ngắn bộ lọc (search...) đang áp dụng trên bảng, hiển thị cho người dùng biết.
function ExportButton({ onExport, label = 'Xuất Excel', filterSummary, fields = [] }) {
  const [open, setOpen] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [fieldValues, setFieldValues] = useState({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function handleClose() {
    if (busy) return
    setOpen(false)
    setDateFrom('')
    setDateTo('')
    setFieldValues({})
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const extraFilters = {}
      fields.forEach((f) => {
        if (fieldValues[f.name]) extraFilters[f.name] = fieldValues[f.name]
      })
      await onExport({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, ...extraFilters })
      handleClose()
    } catch {
      setError('Xuất file thất bại, vui lòng thử lại')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOpen(true)}>
        <Download size={14} /> {label}
      </button>

      {open && (
        <Modal title="Xuất Excel" onClose={handleClose}>
          <form className="export-dialog-form" onSubmit={handleSubmit}>
            <p className="export-dialog-filter-note">
              {filterSummary
                ? `Đang áp dụng bộ lọc: ${filterSummary}`
                : 'Không có bộ lọc nào đang áp dụng, sẽ xuất toàn bộ dữ liệu.'}
            </p>

            {fields.length > 0 && (
              <div className="export-dialog-fields">
                {fields.map((f) => (
                  <label key={f.name} className="field-label" htmlFor={`export-field-${f.name}`}>
                    {f.label}
                    <select
                      id={`export-field-${f.name}`}
                      className="select"
                      value={fieldValues[f.name] || ''}
                      onChange={(e) => setFieldValues((prev) => ({ ...prev, [f.name]: e.target.value }))}
                    >
                      {f.options.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            )}

            <div className="export-dialog-dates">
              <label className="field-label" htmlFor="export-date-from">
                Từ ngày
                <input
                  id="export-date-from"
                  type="date"
                  className="input"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </label>
              <label className="field-label" htmlFor="export-date-to">
                Đến ngày
                <input
                  id="export-date-to"
                  type="date"
                  className="input"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </label>
            </div>

            {error && <p className="field-error">{error}</p>}

            <div className="export-dialog-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleClose} disabled={busy}>
                Hủy
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
                {busy ? 'Đang xuất...' : 'Xuất file'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}

export default ExportButton

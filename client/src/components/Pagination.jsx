import { ChevronLeft, ChevronRight } from 'lucide-react'
import './Pagination.css'

// Tính danh sách số trang hiển thị, rút gọn bằng "..." khi quá nhiều trang.
// Luôn giữ trang đầu, trang cuối, trang hiện tại và 1 trang liền kề mỗi bên.
function getPageNumbers(page, totalPages) {
  const pages = []
  const addRange = (from, to) => {
    for (let i = from; i <= to; i++) pages.push(i)
  }

  if (totalPages <= 7) {
    addRange(1, totalPages)
    return pages
  }

  pages.push(1)
  if (page > 3) pages.push('…')
  addRange(Math.max(2, page - 1), Math.min(totalPages - 1, page + 1))
  if (page < totalPages - 2) pages.push('…')
  pages.push(totalPages)
  return pages
}

function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null

  const pageNumbers = getPageNumbers(page, totalPages)

  return (
    <nav className="pagination" aria-label="Phân trang">
      <button
        type="button"
        className="pagination-nav-btn"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Trang trước"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="pagination-numbers">
        {pageNumbers.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="pagination-ellipsis">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`pagination-number${p === page ? ' is-active' : ''}`}
              onClick={() => onChange(p)}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        className="pagination-nav-btn"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Trang sau"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}

export default Pagination

import { ChevronLeft, ChevronRight } from 'lucide-react'
import './Pagination.css'

function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null

  return (
    <div className="pagination">
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft size={16} /> Trước
      </button>

      <span className="pagination-info">
        Trang <strong>{page}</strong> / {totalPages}
      </span>

      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Sau <ChevronRight size={16} />
      </button>
    </div>
  )
}

export default Pagination

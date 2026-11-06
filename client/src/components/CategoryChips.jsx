import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react'
import * as categoryService from '../services/categoryService'
import CategoryIcon from './CategoryIcon'
import './CategoryChips.css'

// Hàng chip danh mục ở trang chủ: bấm để xem câu hỏi của danh mục đó (dữ liệu thật từ API).
// Mỗi chip có icon riêng của danh mục (xem utils/categoryIcons.js).
// Luôn nằm trên 1 dòng, cuộn ngang được (vuốt/touchpad, hoặc bấm nút mũi tên 2 bên trên desktop).
// Nút mũi tên chỉ hiện ở phía còn chip bị khuất.
function CategoryChips() {
  const [categories, setCategories] = useState(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollerRef = useRef(null)

  // Kiểm tra còn chip bị khuất bên trái/phải không (sai số 2px cho làm tròn pixel)
  function updateArrows() {
    const el = scrollerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
  }

  function scrollByDirection(direction) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: 'smooth' })
  }

  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  // Tính lại khi danh sách đã hiển thị và mỗi khi đổi kích thước (ResizeObserver chạy 1 lần ngay khi gắn)
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return undefined
    const observer = new ResizeObserver(updateArrows)
    observer.observe(el)
    return () => observer.disconnect()
  }, [categories])

  if (categories === null) {
    return (
      <div className="category-chips">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton category-chip-skeleton" />
        ))}
      </div>
    )
  }

  if (categories.length === 0) return null

  return (
    <div className="category-chips-wrap">
      {canScrollLeft && (
        <button
          type="button"
          className="category-chips-arrow is-left"
          onClick={() => scrollByDirection(-1)}
          aria-label="Cuộn sang trái"
        >
          <ChevronLeft size={18} />
        </button>
      )}

      <nav
        ref={scrollerRef}
        className={`category-chips${canScrollLeft ? ' fade-left' : ''}${canScrollRight ? ' fade-right' : ''}`}
        aria-label="Danh mục"
        onScroll={updateArrows}
      >
        <Link to="/questions" className="category-chip is-all">
          <span className="category-chip-icon">
            <LayoutGrid size={14} />
          </span>
          Tất cả
          <span className="category-chip-count stat-number">{categories.reduce((sum, c) => sum + c.question_count, 0)}</span>
        </Link>
        {[...categories]
          .sort((a, b) => b.question_count - a.question_count)
          .map((c) => (
            <Link key={c.id} to={`/questions?category_id=${c.id}`} className="category-chip">
              <CategoryIcon name={c.name} size={26} />
              {c.name}
              <span className="category-chip-count stat-number">{c.question_count}</span>
            </Link>
          ))}
      </nav>

      {canScrollRight && (
        <button
          type="button"
          className="category-chips-arrow is-right"
          onClick={() => scrollByDirection(1)}
          aria-label="Cuộn sang phải"
        >
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  )
}

export default CategoryChips

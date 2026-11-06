import { Link } from 'react-router-dom'
import { getCategoryStyle } from '../utils/categoryIcons'
import './CategoryPill.css'

// Hiển thị danh mục của câu hỏi - viền (khác với tag nền đặc) để phân biệt rõ
// "1 danh mục duy nhất" với "nhiều tag" đi kèm
function CategoryPill({ id, name }) {
  if (!id || !name) return null
  const { Icon } = getCategoryStyle(name)

  return (
    <Link className="category-pill" to={`/questions?category_id=${id}`}>
      <Icon size={12} />
      {name}
    </Link>
  )
}

export default CategoryPill

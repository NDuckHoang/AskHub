import { getCategoryStyle } from '../utils/categoryIcons'
import './CategoryIcon.css'

// Icon danh mục đặt trong vòng tròn tông nhạt (size = đường kính, px)
function CategoryIcon({ name, size = 26 }) {
  const { Icon, tone } = getCategoryStyle(name)

  return (
    <span className={`category-icon tone-${tone}`} style={{ width: size, height: size }} aria-hidden="true">
      <Icon size={Math.round(size * 0.55)} strokeWidth={2.2} />
    </span>
  )
}

export default CategoryIcon

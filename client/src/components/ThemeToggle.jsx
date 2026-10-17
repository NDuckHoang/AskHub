import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import './ThemeToggle.css'

// showLabel: hiện chữ "Giao diện tối/sáng" cạnh icon - dùng khi đặt trong AppRail mở rộng,
// nhãn đổi theo đúng theme hiện tại (nhãn là hành động sẽ xảy ra khi bấm, không phải theme hiện tại)
function ThemeToggle({ showLabel = false }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const label = isDark ? 'Giao diện sáng' : 'Giao diện tối'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      title={label}
    >
      <span key={theme} className="theme-toggle-icon animate-scale-in">
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </span>
      {showLabel && <span className="theme-toggle-label">{label}</span>}
    </button>
  )
}

export default ThemeToggle

import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Home, HelpCircle, LayoutGrid, Plus, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useAskModal } from '../hooks/useAskModal'
import NotificationBell from './NotificationBell'
import ThemeToggle from './ThemeToggle'
import AccountMenu from './AccountMenu'
import AdminNavGroup from './AdminNavGroup'
import logoIcon from '../assets/logo-icon.png'
import './AppRail.css'

const NAV_ITEMS = [
  { to: '/', end: true, icon: Home, label: 'Trang chủ' },
  { to: '/questions', end: false, icon: HelpCircle, label: 'Câu hỏi' },
  { to: '/categories', end: false, icon: LayoutGrid, label: 'Danh mục' },
]

const STORAGE_KEY = 'askhub-rail-expanded'

function getInitialExpanded() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

// Rail điều hướng dọc, chỉ hiển thị ở desktop (ẩn ở mobile - CSS, xem AppRail.css).
// Thay cho 3 link ngang cũ trong Navbar: tách bạch "điều hướng" (ở rail) khỏi
// "tìm kiếm + tài khoản" (ở thanh trên) - bố cục kiểu app hiện đại (Linear/Discord).
// Người dùng tự thu gọn (chỉ icon) / mở rộng (icon + chữ) - lựa chọn lưu lại qua localStorage.
function AppRail() {
  const { user } = useAuth()
  const { openAskModal } = useAskModal()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(getInitialExpanded)

  function toggleExpanded() {
    setExpanded((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      } catch {
        // localStorage có thể bị chặn (chế độ ẩn danh...), bỏ qua lặng lẽ
      }
      return next
    })
  }

  function handleAskClick() {
    if (user) {
      openAskModal()
    } else {
      navigate('/login')
    }
  }

  return (
    <aside className={`app-rail${expanded ? ' is-expanded' : ''}`}>
      <Link to="/" className="app-rail-logo" aria-label="AskHub - Trang chủ">
        <img src={logoIcon} alt="" />
        <span className="app-rail-logo-text">AskHub</span>
      </Link>

      <nav className="app-rail-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `app-rail-link${isActive ? ' is-active' : ''}`}
          >
            <item.icon size={20} />
            <span className="app-rail-label">{item.label}</span>
            {!expanded && <span className="app-rail-tooltip">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="app-rail-divider" />

      <button type="button" className="app-rail-ask-btn" onClick={handleAskClick}>
        <Plus size={20} />
        <span className="app-rail-label">Đặt câu hỏi</span>
        {!expanded && <span className="app-rail-tooltip">Đặt câu hỏi</span>}
      </button>

      {user?.role === 'ADMIN' && (
        <>
          <div className="app-rail-divider" />
          <AdminNavGroup expanded={expanded} />
        </>
      )}

      <div className="app-rail-spacer" />

      {/* Nhóm tiện ích - luôn nằm sát đáy sidebar nhờ .app-rail-spacer (flex:1) phía trên,
          không định vị bằng pixel cố định. Thông báo/Tài khoản tự ẩn khi chưa đăng nhập
          (logic có sẵn trong từng component), Dark mode luôn hiện. */}
      <div className="app-rail-utility">
        <NotificationBell placement="rail" showLabel={expanded} />
        <ThemeToggle showLabel={expanded} />
        <AccountMenu placement="rail" />
      </div>

      <div className="app-rail-divider" />

      <button
        type="button"
        className="app-rail-toggle"
        onClick={toggleExpanded}
        title={expanded ? 'Thu gọn' : 'Mở rộng'}
      >
        {expanded ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        {!expanded && <span className="app-rail-tooltip">Mở rộng</span>}
      </button>
    </aside>
  )
}

export default AppRail

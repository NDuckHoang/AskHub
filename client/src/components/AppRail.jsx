import { useState } from 'react'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  HelpCircle,
  LayoutGrid,
  Trophy,
  FileQuestion,
  MessageSquareText,
  Bookmark,
  Plus,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useAskModal } from '../hooks/useAskModal'
import NotificationBell from './NotificationBell'
import ThemeToggle from './ThemeToggle'
import AccountMenu from './AccountMenu'
import logoIcon from '../assets/logo-icon.png'
import './AppRail.css'

const EXPLORE_ITEMS = [
  { to: '/', end: true, icon: Home, label: 'Trang chủ' },
  { to: '/questions', end: false, icon: HelpCircle, label: 'Câu hỏi' },
  { to: '/categories', end: false, icon: LayoutGrid, label: 'Danh mục' },
  { to: '/leaderboard', end: false, icon: Trophy, label: 'Bảng xếp hạng' },
]

// Nhóm cá nhân trỏ về các tab có sẵn của trang hồ sơ (/users/:id?tab=...),
// không tạo route mới. tab: giá trị ?tab tương ứng (questions là tab mặc định)
const PERSONAL_ITEMS = [
  { tab: 'questions', icon: FileQuestion, label: 'Câu hỏi của tôi' },
  { tab: 'answers', icon: MessageSquareText, label: 'Câu trả lời của tôi' },
  { tab: 'saved', icon: Bookmark, label: 'Câu hỏi đã lưu' },
]

const STORAGE_KEY = 'askhub-rail-expanded'

function getInitialExpanded() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

// 1 mục điều hướng: icon + nhãn (khi mở rộng) hoặc tooltip (khi thu gọn).
// active: nếu truyền vào thì dùng giá trị này thay cho cách so đường dẫn mặc định của NavLink
function RailLink({ to, end, icon: Icon, label, expanded, active }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `app-rail-link${(active ?? isActive) ? ' is-active' : ''}`}
      aria-label={expanded ? undefined : label}
    >
      <Icon size={20} />
      <span className="app-rail-label">{label}</span>
      {!expanded && <span className="app-rail-tooltip">{label}</span>}
    </NavLink>
  )
}

// Tiêu đề nhóm: chữ nhỏ khi mở rộng, chỉ còn đường kẻ ngắn khi thu gọn
function RailGroupTitle({ children, expanded }) {
  if (!expanded) return <div className="app-rail-divider" aria-hidden="true" />
  return <p className="app-rail-group-title">{children}</p>
}

// Sidebar điều hướng dọc, chỉ hiển thị ở desktop (>=769px, xem AppRail.css). Mobile dùng menu
// trong Navbar. Bố cục flex-column: logo -> các nhóm điều hướng -> (khoảng trống) -> nhóm tiện ích
// ở đáy (đẩy xuống bằng margin-top: auto). Người dùng tự thu gọn/mở rộng, lựa chọn lưu ở localStorage.
function AppRail() {
  const { user } = useAuth()
  const { openAskModal } = useAskModal()
  const navigate = useNavigate()
  const location = useLocation()
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

  // Tab đang mở của trang hồ sơ của chính mình -> để tô active đúng mục cá nhân
  const ownProfilePath = user ? `/users/${user.id}` : null
  const currentTab = new URLSearchParams(location.search).get('tab') || 'questions'
  const onOwnProfile = location.pathname === ownProfilePath

  return (
    <aside className={`app-rail${expanded ? ' is-expanded' : ''}`}>
      <Link to="/" className="app-rail-logo" aria-label="AskHub - Trang chủ">
        <img src={logoIcon} alt="" />
        <span className="app-rail-logo-text">AskHub</span>
      </Link>

      <nav className="app-rail-nav" aria-label="Điều hướng chính">
        <RailGroupTitle expanded={expanded}>Khám phá</RailGroupTitle>
        {EXPLORE_ITEMS.map((item) => (
          <RailLink key={item.to} {...item} expanded={expanded} />
        ))}

        {user && (
          <>
            <RailGroupTitle expanded={expanded}>Cá nhân</RailGroupTitle>
            {PERSONAL_ITEMS.map((item) => (
              <RailLink
                key={item.tab}
                to={item.tab === 'questions' ? ownProfilePath : `${ownProfilePath}?tab=${item.tab}`}
                icon={item.icon}
                label={item.label}
                expanded={expanded}
                active={onOwnProfile && currentTab === item.tab}
              />
            ))}
          </>
        )}
      </nav>

      <div className="app-rail-actions">
        <button type="button" className="app-rail-ask-btn" onClick={handleAskClick}>
          <Plus size={20} />
          <span className="app-rail-label">Đặt câu hỏi</span>
          {!expanded && <span className="app-rail-tooltip">Đặt câu hỏi</span>}
        </button>

        {user?.role === 'ADMIN' && (
          <RailLink to="/admin" icon={ShieldCheck} label="Quản trị" expanded={expanded} />
        )}
      </div>


      {/* Khu vực cuối: luôn nằm sát đáy nhờ margin-top: auto (xem .app-rail-bottom).
          Thông báo/Tài khoản tự ẩn khi chưa đăng nhập (logic có sẵn trong từng component). */}
      <div className="app-rail-bottom">
        <div className="app-rail-utility">
          <NotificationBell placement="rail" showLabel={expanded} />
          <ThemeToggle showLabel={expanded} />
          <AccountMenu placement="rail" />
        </div>

        <button
          type="button"
          className="app-rail-toggle"
          onClick={toggleExpanded}
          aria-label={expanded ? 'Thu gọn sidebar' : 'Mở rộng sidebar'}
        >
          {expanded ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          <span className="app-rail-label">Thu gọn</span>
          {!expanded && <span className="app-rail-tooltip">Mở rộng</span>}
        </button>
      </div>
    </aside>
  )
}

export default AppRail

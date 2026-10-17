import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ShieldCheck, ChevronDown } from 'lucide-react'
import * as adminService from '../services/adminService'
import { ADMIN_ITEMS } from './adminNavItems'
import './AdminNavGroup.css'

// Nhóm điều hướng "Quản trị" trong AppRail - chỉ render khi user.role === 'ADMIN' (kiểm tra
// ở AppRail.jsx trước khi dùng component này). Có thể thu gọn/mở rộng độc lập với trạng thái
// thu gọn/mở rộng của cả rail (2 khái niệm khác nhau):
//   - rail thu gọn (expanded=false): bấm icon Khiên -> mở flyout sang phải (giống dropdown
//     Thông báo/Tài khoản), vì không đủ chỗ hiện danh sách con ngay trong 72px.
//   - rail mở rộng (expanded=true): bấm -> mở/đóng danh sách con ngay trong rail (thu gọn gập).
function AdminNavGroup({ expanded }) {
  const location = useLocation()
  // Chỉ tự mở sẵn khi rail đang mở rộng (danh sách con nằm inline, không che gì cả).
  // Ở rail thu gọn, danh sách con hiện dạng flyout nổi lên - không tự mở, chỉ mở khi
  // người dùng bấm, nếu không sẽ che mất nội dung trang ngay khi vừa tải xong.
  const [open, setOpen] = useState(() => expanded && location.pathname.startsWith('/admin'))
  const [pendingReports, setPendingReports] = useState(0)
  const groupRef = useRef(null)

  useEffect(() => {
    adminService.getStats().then((s) => setPendingReports(s.pendingReports)).catch(() => {})
  }, [])

  // Đổi qua lại giữa rail thu gọn/mở rộng trong lúc đang mở thì đóng lại, tránh việc
  // danh sách inline bỗng dưng biến thành flyout nổi (hoặc ngược lại) một cách đột ngột.
  // Bỏ qua lần chạy đầu tiên (mount) - lúc đó "open" đã được tính đúng sẵn ở useState rồi.
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setOpen(false)
  }, [expanded])

  // Flyout (rail thu gọn) đóng khi bấm ra ngoài - giống NotificationBell/AccountMenu
  useEffect(() => {
    if (expanded) return undefined
    function handleClickOutside(e) {
      if (groupRef.current && !groupRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [expanded])

  function linkClass({ isActive }) {
    return `admin-nav-item${isActive ? ' is-active' : ''}`
  }

  return (
    <div className={`admin-nav-group${expanded ? ' is-expanded' : ''}`} ref={groupRef}>
      <button
        type="button"
        className="admin-nav-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <ShieldCheck size={20} />
        <span className="app-rail-label">Quản trị</span>
        {!expanded && !open && <span className="app-rail-tooltip">Quản trị</span>}
        {expanded && <ChevronDown size={14} className={`admin-nav-chevron${open ? ' is-open' : ''}`} />}
      </button>

      {open && (
        <nav className={`admin-nav-list${expanded ? '' : ' admin-nav-list-flyout animate-scale-in'}`}>
          {ADMIN_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={() => !expanded && setOpen(false)}>
              <item.icon size={16} />
              <span>{item.label}</span>
              {item.badge && pendingReports > 0 && (
                <span className="admin-tab-badge">{pendingReports}</span>
              )}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  )
}

export default AdminNavGroup

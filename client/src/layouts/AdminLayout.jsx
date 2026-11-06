import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ExternalLink, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import ThemeToggle from '../components/ThemeToggle'
import UserAvatar from '../components/UserAvatar'
import ToastContainer from '../components/ToastContainer'
import { ADMIN_ITEMS } from '../components/adminNavItems'
import * as adminService from '../services/adminService'
import logoIcon from '../assets/logo-icon.png'
import './AdminLayout.css'

// Khung riêng cho khu vực /admin: KHÔNG dùng AppRail/Navbar của trang người dùng.
// Điều hướng nằm ngang ở header; nút "Xem trang web" quay về giao diện người dùng.
// Quyền truy cập do AdminRoute (bọc ngoài trong App.jsx) và adminMiddleware ở backend quyết định.
function AdminLayout() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [pendingReports, setPendingReports] = useState(0)

  // Cập nhật số báo cáo chờ xử lý mỗi khi đổi trang con
  useEffect(() => {
    adminService.getStats().then((s) => setPendingReports(s.pendingReports)).catch(() => {})
  }, [pathname])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-inner">
          <Link to="/admin" className="admin-brand" aria-label="AskHub Admin">
            <img src={logoIcon} alt="" className="admin-brand-logo" />
            <span className="admin-brand-name">AskHub</span>
            <span className="admin-brand-badge">ADMIN</span>
          </Link>

          <nav className="admin-nav" aria-label="Menu quản trị">
            {ADMIN_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `admin-nav-link${isActive ? ' is-active' : ''}`}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
                {item.badge && pendingReports > 0 && (
                  <span className="admin-nav-badge anim-pulse">{pendingReports}</span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="admin-header-actions">
            <Link to="/" className="admin-site-link">
              <ExternalLink size={15} />
              <span>Xem trang web</span>
            </Link>
            <ThemeToggle />
            {user && <UserAvatar username={user.username} avatar={user.avatar} size={34} />}
            <button type="button" className="admin-logout" onClick={handleLogout} title="Đăng xuất" aria-label="Đăng xuất">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div key={pathname} className="animate-fade-in-up">
          <Outlet />
        </div>
      </main>
      <ToastContainer />
    </div>
  )
}

export default AdminLayout

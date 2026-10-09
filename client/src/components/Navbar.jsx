import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, Menu, X, ChevronDown, LogOut, User, ShieldCheck, Plus } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useAskModal } from '../hooks/useAskModal'
import UserAvatar from './UserAvatar'
import NotificationBell from './NotificationBell'
import ThemeToggle from './ThemeToggle'
import './Navbar.css'

function Navbar() {
  const { user, logout } = useAuth()
  const { openAskModal } = useAskModal()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Bấm ra ngoài dropdown user thì tự đóng lại
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSearchSubmit(e) {
    e.preventDefault()
    const keyword = query.trim()
    if (!keyword) return
    navigate(`/search?q=${encodeURIComponent(keyword)}`)
    setMobileOpen(false)
  }

  function handleLogout() {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  function handleAskClick() {
    setMobileOpen(false)
    if (user) {
      openAskModal()
    } else {
      navigate('/login')
    }
  }

  function linkClass({ isActive }) {
    return `navbar-link${isActive ? ' is-active' : ''}`
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-mark">A</span>
          AskHub
        </Link>

        <div className={`navbar-collapsible ${mobileOpen ? 'is-open' : ''}`}>
          <nav className="navbar-links">
            <NavLink to="/" end className={linkClass} onClick={() => setMobileOpen(false)}>
              Trang chủ
            </NavLink>
            <NavLink to="/questions" className={linkClass} onClick={() => setMobileOpen(false)}>
              Câu hỏi
            </NavLink>
            <NavLink to="/categories" className={linkClass} onClick={() => setMobileOpen(false)}>
              Danh mục
            </NavLink>
          </nav>

          <form className="navbar-search" onSubmit={handleSearchSubmit} role="search">
            <Search size={16} className="navbar-search-icon" />
            <input
              type="search"
              className="navbar-search-input"
              placeholder="Tìm câu hỏi..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="navbar-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm navbar-ask-btn"
            onClick={handleAskClick}
          >
            <Plus size={16} />
            <span>Đặt câu hỏi</span>
          </button>

          {!user && (
            <div className="navbar-auth-links">
              <Link to="/login" className="btn btn-secondary btn-sm">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn btn-secondary btn-sm">
                Đăng ký
              </Link>
            </div>
          )}

          <ThemeToggle />

          {user && <NotificationBell />}

          {user && (
            <div className="navbar-user" ref={menuRef}>
              <button
                type="button"
                className="navbar-user-trigger"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <UserAvatar username={user.username} avatar={user.avatar} size={28} />
                <span className="navbar-username">{user.username}</span>
                <ChevronDown size={14} />
              </button>

              {menuOpen && (
                <div className="navbar-dropdown">
                  <Link
                    to={`/users/${user.id}`}
                    className="navbar-dropdown-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User size={16} /> Hồ sơ
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      className="navbar-dropdown-item"
                      onClick={() => setMenuOpen(false)}
                    >
                      <ShieldCheck size={16} /> Quản trị
                    </Link>
                  )}
                  <button type="button" className="navbar-dropdown-item" onClick={handleLogout}>
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            className="navbar-mobile-toggle"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Mở menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar

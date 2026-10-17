import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Search, Menu, X, Plus, Clock } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useAskModal } from '../hooks/useAskModal'
import NotificationBell from './NotificationBell'
import ThemeToggle from './ThemeToggle'
import AccountMenu from './AccountMenu'
import { ADMIN_ITEMS } from './adminNavItems'
import logoIcon from '../assets/logo-icon.png'
import './Navbar.css'

const SEARCH_HISTORY_KEY = 'askhub-search-history'
const MAX_SEARCH_HISTORY = 8

function loadSearchHistory() {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveSearchHistory(history) {
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history))
  } catch {
    // localStorage có thể bị chặn (chế độ ẩn danh...), bỏ qua lặng lẽ
  }
}

function Navbar() {
  const { user } = useAuth()
  const { openAskModal } = useAskModal()
  const location = useLocation()
  const isAdminArea = location.pathname.startsWith('/admin')
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [searchHistory, setSearchHistory] = useState(loadSearchHistory)
  const searchRef = useRef(null)
  const searchInputRef = useRef(null)

  // Bấm ra ngoài lịch sử tìm kiếm thì tự đóng lại
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setHistoryOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Phím tắt Ctrl/Cmd+K focus thẳng vào ô tìm kiếm, dùng được từ bất kỳ đâu trên trang
  useEffect(() => {
    function handleGlobalKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  // Lưu từ khóa vào lịch sử (mới nhất lên đầu, không trùng lặp, tối đa MAX_SEARCH_HISTORY)
  function addToHistory(term) {
    setSearchHistory((prev) => {
      const next = [term, ...prev.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(
        0,
        MAX_SEARCH_HISTORY
      )
      saveSearchHistory(next)
      return next
    })
  }

  function removeHistoryItem(e, term) {
    e.preventDefault()
    e.stopPropagation()
    setSearchHistory((prev) => {
      const next = prev.filter((t) => t !== term)
      saveSearchHistory(next)
      return next
    })
  }

  function clearHistory() {
    setSearchHistory([])
    saveSearchHistory([])
  }

  function runSearch(term) {
    const keyword = term.trim()
    if (!keyword) return
    addToHistory(keyword)
    navigate(`/search?q=${encodeURIComponent(keyword)}`)
    setQuery('')
    setHistoryOpen(false)
    setMobileOpen(false)
  }

  function handleSearchSubmit(e) {
    e.preventDefault()
    runSearch(query)
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'Escape') setHistoryOpen(false)
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
          <img src={logoIcon} alt="" className="navbar-logo-icon" />
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

            {user?.role === 'ADMIN' && (
              <>
                <span className="navbar-links-group-label">Quản trị</span>
                {ADMIN_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={linkClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon size={15} /> {item.label}
                  </NavLink>
                ))}
              </>
            )}
          </nav>

          <form className="navbar-search" onSubmit={handleSearchSubmit} role="search" ref={searchRef}>
            <Search size={16} className="navbar-search-icon" />
            <input
              ref={searchInputRef}
              type="search"
              className="navbar-search-input"
              placeholder="Tìm câu hỏi, chủ đề..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                setHistoryOpen(true)
                setSearchFocused(true)
              }}
              onBlur={() => setSearchFocused(false)}
              onClick={() => setHistoryOpen(true)}
              onKeyDown={handleSearchKeyDown}
              autoComplete="off"
            />
            {!searchFocused && !query && (
              <span className="navbar-search-shortcut" aria-hidden="true">
                Ctrl+K
              </span>
            )}

            {historyOpen && !query.trim() && searchHistory.length > 0 && (
              <div className="navbar-search-history animate-scale-in">
                <div className="navbar-search-history-header">
                  <span>Tìm kiếm gần đây</span>
                  <button type="button" onClick={clearHistory}>
                    Xóa tất cả
                  </button>
                </div>
                <ul>
                  {searchHistory.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        className="navbar-search-history-item"
                        onClick={() => runSearch(term)}
                      >
                        <Clock size={14} />
                        <span>{term}</span>
                      </button>
                      <button
                        type="button"
                        className="navbar-search-history-remove"
                        onClick={(e) => removeHistoryItem(e, term)}
                        aria-label={`Xóa "${term}" khỏi lịch sử`}
                      >
                        <X size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>
        </div>

        <div className="navbar-actions">
          <button
            type="button"
            className={`btn btn-primary btn-sm navbar-ask-btn${isAdminArea ? ' is-admin-area' : ''}`}
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

          <AccountMenu />

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

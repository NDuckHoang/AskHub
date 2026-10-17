import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, User, ShieldCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import UserAvatar from './UserAvatar'

// Trigger (avatar + username + chevron) + dropdown (Hồ sơ/Quản trị/Đăng xuất).
// Dùng chung cho cả Navbar (mobile, dropdown mở xuống) và AppRail (desktop, dropdown
// mở sang phải vì trigger nằm sát đáy màn hình - mở xuống sẽ bị tràn ra ngoài viewport).
// placement: 'down' (mặc định, trong Navbar) | 'rail' (trong AppRail).
function AccountMenu({ placement = 'down' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function handleLogout() {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  if (!user) return null

  return (
    <div className="navbar-user" ref={menuRef}>
      <button
        type="button"
        className="navbar-user-trigger"
        onClick={() => setMenuOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={menuOpen}
      >
        <UserAvatar username={user.username} avatar={user.avatar} size={28} />
        <span className="navbar-username">{user.username}</span>
        <ChevronDown size={14} className="navbar-user-chevron" />
      </button>

      {menuOpen && (
        <div className={`navbar-dropdown animate-scale-in${placement === 'rail' ? ' navbar-dropdown-rail' : ''}`}>
          <Link to={`/users/${user.id}`} className="navbar-dropdown-item" onClick={() => setMenuOpen(false)}>
            <User size={16} /> Hồ sơ
          </Link>
          {user.role === 'ADMIN' && (
            <Link to="/admin" className="navbar-dropdown-item" onClick={() => setMenuOpen(false)}>
              <ShieldCheck size={16} /> Quản trị
            </Link>
          )}
          <button type="button" className="navbar-dropdown-item" onClick={handleLogout}>
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}

export default AccountMenu

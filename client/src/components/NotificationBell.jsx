import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import * as notificationService from '../services/notificationService'
import { formatRelativeTime } from '../utils/formatTime'
import './NotificationBell.css'

// Không realtime (không WebSocket) - chỉ tự tải lại số thông báo chưa đọc mỗi 30s
const POLL_INTERVAL = 30000

const TYPE_MESSAGES = {
  NEW_ANSWER: (n) => `${n.actor_username} đã trả lời câu hỏi "${n.question_title}" của bạn`,
  ANSWER_ACCEPTED: (n) => `${n.actor_username} đã chấp nhận câu trả lời của bạn cho "${n.question_title}"`,
  NEW_COMMENT: (n) => `${n.actor_username} đã bình luận vào "${n.question_title}"`,
}

function NotificationBell() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!user) return undefined

    function fetchCount() {
      notificationService.getUnreadCount().then(setUnreadCount).catch(() => {})
    }

    fetchCount()
    const interval = setInterval(fetchCount, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleToggle() {
    const next = !open
    setOpen(next)
    if (next && notifications === null) {
      notificationService
        .getNotifications({ limit: 10 })
        .then((data) => setNotifications(data.notifications))
        .catch(() => setNotifications([]))
    }
  }

  async function handleMarkAllRead() {
    await notificationService.markAllAsRead()
    setUnreadCount(0)
    setNotifications((prev) => (prev ? prev.map((n) => ({ ...n, is_read: 1 })) : prev))
  }

  async function handleItemClick(n) {
    setOpen(false)
    if (n.is_read) return
    await notificationService.markAsRead(n.id)
    setUnreadCount((c) => Math.max(0, c - 1))
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: 1 } : x)))
  }

  if (!user) return null

  return (
    <div className="notification-bell" ref={containerRef}>
      <button
        type="button"
        className="notification-bell-trigger"
        onClick={handleToggle}
        aria-label="Thông báo"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="notification-bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <span>Thông báo</span>
            {unreadCount > 0 && (
              <button type="button" className="notification-mark-all" onClick={handleMarkAllRead}>
                <CheckCheck size={13} /> Đánh dấu đã đọc
              </button>
            )}
          </div>

          {notifications === null && (
            <div className="skeleton" style={{ height: 100, margin: 12, borderRadius: 8 }} />
          )}

          {notifications && notifications.length === 0 && (
            <p className="notification-empty">Chưa có thông báo nào.</p>
          )}

          {notifications && notifications.length > 0 && (
            <ul className="notification-list">
              {notifications.map((n) => (
                <li key={n.id}>
                  <Link
                    to={`/questions/${n.question_id}`}
                    className={`notification-item${n.is_read ? '' : ' is-unread'}`}
                    onClick={() => handleItemClick(n)}
                  >
                    <span className="notification-text">{TYPE_MESSAGES[n.type](n)}</span>
                    <span className="notification-time">{formatRelativeTime(n.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell

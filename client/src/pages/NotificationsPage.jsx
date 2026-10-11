import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCheck } from 'lucide-react'
import * as notificationService from '../services/notificationService'
import Pagination from '../components/Pagination'
import { formatRelativeTime } from '../utils/formatTime'
import './NotificationsPage.css'

// Giống TYPE_MESSAGES trong NotificationBell.jsx - tách riêng vì 2 nơi hiển thị khác bối cảnh
// (dropdown ngắn gọn vs trang đầy đủ có phân trang)
const TYPE_MESSAGES = {
  NEW_ANSWER: (n) => `${n.actor_username} đã trả lời câu hỏi "${n.question_title}" của bạn`,
  ANSWER_ACCEPTED: (n) => `${n.actor_username} đã chấp nhận câu trả lời của bạn cho "${n.question_title}"`,
  NEW_COMMENT: (n) => `${n.actor_username} đã bình luận vào "${n.question_title}"`,
}

function NotificationsPage() {
  const [notifications, setNotifications] = useState(null)
  const [error, setError] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [page, setPage] = useState(1)

  const fetchNotifications = useCallback(() => {
    setNotifications(null)
    setError(false)
    notificationService
      .getNotifications({ page, limit: 20 })
      .then((data) => {
        setNotifications(data.notifications)
        setPagination(data.pagination)
      })
      .catch(() => setError(true))
  }, [page])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  async function handleMarkAllRead() {
    await notificationService.markAllAsRead()
    setNotifications((prev) => (prev ? prev.map((n) => ({ ...n, is_read: 1 })) : prev))
  }

  async function handleItemClick(n) {
    if (n.is_read) return
    await notificationService.markAsRead(n.id)
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: 1 } : x)))
  }

  const hasUnread = notifications ? notifications.some((n) => !n.is_read) : false

  return (
    <div className="container notifications-page">
      <div className="notifications-page-header">
        <h1>Thông báo</h1>
        {hasUnread && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
            <CheckCheck size={14} /> Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {notifications === null && !error && (
        <div className="skeleton" style={{ height: 240, borderRadius: 8 }} />
      )}

      {error && (
        <div className="card state-box state-error">
          <p>Không tải được thông báo.</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={fetchNotifications}>
            Thử lại
          </button>
        </div>
      )}

      {notifications && notifications.length === 0 && (
        <div className="card state-box">
          <p>Bạn chưa có thông báo nào.</p>
        </div>
      )}

      {notifications && notifications.length > 0 && (
        <div className="card notifications-page-list">
          {notifications.map((n) => (
            <Link
              key={n.id}
              to={`/questions/${n.question_id}`}
              className={`notifications-page-item${n.is_read ? '' : ' is-unread'}`}
              onClick={() => handleItemClick(n)}
            >
              <span className="notifications-page-text">{TYPE_MESSAGES[n.type](n)}</span>
              <span className="notifications-page-time">{formatRelativeTime(n.created_at)}</span>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
    </div>
  )
}

export default NotificationsPage

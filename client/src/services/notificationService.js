import api from './api'

export function getNotifications(params) {
  return api.get('/notifications', { params }).then((res) => res.data)
}

export function getUnreadCount() {
  return api.get('/notifications/unread-count').then((res) => res.data.count)
}

export function markAsRead(id) {
  return api.put(`/notifications/${id}/read`).then((res) => res.data)
}

export function markAllAsRead() {
  return api.put('/notifications/read-all').then((res) => res.data)
}

import api from './api'

export function getStats() {
  return api.get('/admin/stats').then((res) => res.data)
}

export function getActivityStats() {
  return api.get('/admin/stats/activity').then((res) => res.data)
}

export function getUsers(params) {
  return api.get('/admin/users', { params }).then((res) => res.data)
}

export function updateUserStatus(id, status) {
  return api.put(`/admin/users/${id}/status`, { status }).then((res) => res.data)
}

export function deleteUser(id) {
  return api.delete(`/admin/users/${id}`).then((res) => res.data)
}

export function deleteQuestion(id) {
  return api.delete(`/admin/questions/${id}`).then((res) => res.data)
}

export function getAnswers(params) {
  return api.get('/admin/answers', { params }).then((res) => res.data)
}

export function deleteAnswer(id) {
  return api.delete(`/admin/answers/${id}`).then((res) => res.data)
}

export function getReports(params) {
  return api.get('/admin/reports', { params }).then((res) => res.data)
}

export function resolveReport(id, status, deleteTarget) {
  return api.put(`/admin/reports/${id}/status`, { status, deleteTarget }).then((res) => res.data)
}

// Tải file Excel: nhận về blob rồi tự tạo link download, không cần tab mới
// params có thể gồm search (bộ lọc đang áp dụng trên bảng) và dateFrom/dateTo (chọn trong hộp thoại xuất)
async function downloadFile(url, filename, params) {
  const res = await api.get(url, { params, responseType: 'blob' })
  const blobUrl = window.URL.createObjectURL(new Blob([res.data]))
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(blobUrl)
}

export function exportUsers(params) {
  return downloadFile('/admin/export/users', 'nguoi-dung.xlsx', params)
}

export function exportQuestions(params) {
  return downloadFile('/admin/export/questions', 'cau-hoi.xlsx', params)
}

export function exportAnswers(params) {
  return downloadFile('/admin/export/answers', 'cau-tra-loi.xlsx', params)
}

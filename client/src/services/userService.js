import api from './api'

export function getLeaderboard(limit = 10) {
  return api.get('/users/leaderboard', { params: { limit } }).then((res) => res.data.users)
}

export function getUserProfile(id) {
  return api.get(`/users/${id}`).then((res) => res.data.user)
}

export function getUserAnswers(id, params) {
  return api.get(`/users/${id}/answers`, { params }).then((res) => res.data)
}

export function updateProfile(id, data) {
  return api.put(`/users/${id}`, data).then((res) => res.data)
}

export function changePassword(id, data) {
  return api.put(`/users/${id}/password`, data).then((res) => res.data)
}

// Trang /leaderboard: 1 trang bảng xếp hạng kèm thông tin phân trang.
// search (tùy chọn): lọc theo username; mỗi user có rank_position = hạng thật trong toàn bảng
export function getLeaderboardPage(page = 1, limit = 20, search = '') {
  return api
    .get('/users/leaderboard', { params: { page, limit, search: search || undefined } })
    .then((res) => res.data)
}

// Đặt/đổi câu hỏi bảo mật (cần mật khẩu hiện tại) - dùng cho chức năng Quên mật khẩu
export function updateSecurityQuestion(id, data) {
  return api.put(`/users/${id}/security-question`, data).then((res) => res.data)
}

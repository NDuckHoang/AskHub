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

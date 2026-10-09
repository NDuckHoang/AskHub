import api from './api'

export function createComment(data) {
  return api.post('/comments', data).then((res) => res.data)
}

export function deleteComment(id) {
  return api.delete(`/comments/${id}`).then((res) => res.data)
}

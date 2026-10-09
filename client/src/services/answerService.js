import api from './api'

export function getAnswers(questionId) {
  return api.get(`/questions/${questionId}/answers`).then((res) => res.data.answers)
}

export function createAnswer(questionId, content) {
  return api.post(`/questions/${questionId}/answers`, { content }).then((res) => res.data)
}

export function updateContent(id, content) {
  return api.put(`/answers/${id}`, { content }).then((res) => res.data)
}

export function setAccepted(id, isAccepted) {
  return api.put(`/answers/${id}`, { is_accepted: isAccepted }).then((res) => res.data)
}

export function deleteAnswer(id) {
  return api.delete(`/answers/${id}`).then((res) => res.data)
}

export function voteAnswer(id, voteType) {
  return api.post(`/answers/${id}/vote`, { vote_type: voteType }).then((res) => res.data)
}

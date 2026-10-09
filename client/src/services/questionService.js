import api from './api'

export function getQuestions(params) {
  return api.get('/questions', { params }).then((res) => res.data)
}

export function getQuestionById(id) {
  return api.get(`/questions/${id}`).then((res) => res.data.question)
}

export function voteQuestion(id, voteType) {
  return api.post(`/questions/${id}/vote`, { vote_type: voteType }).then((res) => res.data)
}

export function deleteQuestion(id) {
  return api.delete(`/questions/${id}`).then((res) => res.data)
}

export function createQuestion(data) {
  return api.post('/questions', data).then((res) => res.data)
}

export function updateQuestion(id, data) {
  return api.put(`/questions/${id}`, data).then((res) => res.data)
}

export function toggleSaveQuestion(id) {
  return api.post(`/questions/${id}/save`).then((res) => res.data)
}

export function getSavedQuestions(params) {
  return api.get('/questions/saved', { params }).then((res) => res.data)
}

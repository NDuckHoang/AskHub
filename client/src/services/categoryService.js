import api from './api'

export function getCategories() {
  return api.get('/categories').then((res) => res.data.categories)
}

export function createCategory(data) {
  return api.post('/categories', data).then((res) => res.data)
}

export function updateCategory(id, data) {
  return api.put(`/categories/${id}`, data).then((res) => res.data)
}

export function deleteCategory(id) {
  return api.delete(`/categories/${id}`).then((res) => res.data)
}

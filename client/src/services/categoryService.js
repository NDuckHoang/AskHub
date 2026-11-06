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

// Chủ đề hot cho trang chủ: { days, categories: [...] } - xem categoryModel.findTrending ở backend
export function getTrendingCategories(limit = 6) {
  return api.get('/categories/trending', { params: { limit } }).then((res) => res.data)
}

import api from './api'

// Danh sách danh mục được nhiều khối dùng cùng lúc (Hero, hàng chip, Sidebar...).
// Giữ lại lời gọi API đầu tiên để các khối dùng chung, thay vì mỗi khối tự gọi 1 lần.
// Bộ nhớ tạm bị xóa khi admin thêm/sửa/xóa danh mục, hoặc khi lần gọi bị lỗi (để lần sau gọi lại).
const CACHE_MS = 60 * 1000
let categoriesCache = null // { promise, time }

export function getCategories() {
  const now = Date.now()
  if (categoriesCache && now - categoriesCache.time < CACHE_MS) {
    return categoriesCache.promise
  }
  const promise = api.get('/categories').then((res) => res.data.categories)
  categoriesCache = { promise, time: now }
  promise.catch(() => {
    categoriesCache = null
  })
  return promise
}

function clearCategoriesCache() {
  categoriesCache = null
}

export function createCategory(data) {
  return api.post('/categories', data).then((res) => {
    clearCategoriesCache()
    return res.data
  })
}

export function updateCategory(id, data) {
  return api.put(`/categories/${id}`, data).then((res) => {
    clearCategoriesCache()
    return res.data
  })
}

export function deleteCategory(id) {
  return api.delete(`/categories/${id}`).then((res) => {
    clearCategoriesCache()
    return res.data
  })
}

// Chủ đề hot cho trang chủ: { days, categories: [...] } - xem categoryModel.findTrending ở backend
export function getTrendingCategories(limit = 6) {
  return api.get('/categories/trending', { params: { limit } }).then((res) => res.data)
}

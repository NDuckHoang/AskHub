import api from './api'

export function getPopularTags(limit = 10) {
  return api.get('/tags/popular', { params: { limit } }).then((res) => res.data.tags)
}

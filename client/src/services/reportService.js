import api from './api'

export function createReport(targetType, targetId, reason) {
  return api
    .post('/reports', { target_type: targetType, target_id: targetId, reason })
    .then((res) => res.data)
}

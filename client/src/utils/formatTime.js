// Đổi ISO date string thành dạng "x phút/giờ/ngày trước" bằng tiếng Việt
const UNITS = [
  { limit: 60, divisor: 1, suffix: 'giây trước' },
  { limit: 3600, divisor: 60, suffix: 'phút trước' },
  { limit: 86400, divisor: 3600, suffix: 'giờ trước' },
  { limit: 2592000, divisor: 86400, suffix: 'ngày trước' },
  { limit: 31536000, divisor: 2592000, suffix: 'tháng trước' },
]

export function formatRelativeTime(dateString) {
  const diffSeconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)

  if (diffSeconds < 10) return 'vừa xong'

  for (const unit of UNITS) {
    if (diffSeconds < unit.limit) {
      return `${Math.floor(diffSeconds / unit.divisor)} ${unit.suffix}`
    }
  }

  return `${Math.floor(diffSeconds / 31536000)} năm trước`
}

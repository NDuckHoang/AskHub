import { useEffect, useState } from 'react'

// Đếm số từ 0 lên giá trị đích (hiệu ứng cho ô thống kê).
// target = null/undefined (chưa có dữ liệu) -> trả về null để component tự hiện "-".
// Người dùng bật "giảm chuyển động" -> hiện luôn giá trị cuối, không đếm.
export function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (target === null || target === undefined) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setValue(target)
      return undefined
    }
    const start = performance.now()
    let frameId
    function tick(now) {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      setValue(Math.round(target * eased))
      if (progress < 1) frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [target, duration])

  if (target === null || target === undefined) return null
  return value
}

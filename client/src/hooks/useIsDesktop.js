import { useEffect, useState } from 'react'

// Màn hình desktop (>= 769px) hay không - cùng mốc với CSS của AppRail/Navbar.
// Dùng để CHỈ tạo (mount) component ở nơi đang hiển thị: nếu chỉ ẩn bằng CSS thì component vẫn chạy
// và vẫn gọi API (vd chuông thông báo bị tạo 2 lần -> gọi API số thông báo 2 lần, hỏi lại 2 vòng).
const DESKTOP_QUERY = '(min-width: 769px)'

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(DESKTOP_QUERY).matches)

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY)
    const handleChange = (e) => setIsDesktop(e.matches)
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  return isDesktop
}

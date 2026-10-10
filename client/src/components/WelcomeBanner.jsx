import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import banner1 from '../assets/home-banner-2.png'
import banner2 from '../assets/home-banner-3.png'
import './WelcomeBanner.css'

const SLIDES = [banner1, banner2]
const SLIDE_INTERVAL_MS = 2000

// Banner quảng bá ở đầu trang chủ - ảnh do người dùng tự thiết kế, bấm vào để sang trang đăng ký.
// Tự động chuyển ảnh sau mỗi SLIDE_INTERVAL_MS, dừng lại khi tab không hiển thị (setInterval vẫn
// chạy ngầm nhưng không ai nhìn thấy nên không cần dừng thủ công).
function WelcomeBanner() {
  const [slideIndex, setSlideIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % SLIDES.length)
    }, SLIDE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  return (
    <Link to="/register" className="welcome-banner">
      <img
        key={slideIndex}
        src={SLIDES[slideIndex]}
        alt="AskHub - Cộng đồng hỏi đáp lập trình"
        className="animate-fade-in"
      />
    </Link>
  )
}

export default WelcomeBanner

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import banner1 from '../assets/home-banner-2.png'
import banner2 from '../assets/home-banner-3.png'
import './WelcomeBanner.css'

const SLIDES = [banner1, banner2]
const SLIDE_INTERVAL_MS = 5000

// Banner quảng bá ở đầu trang chủ - bấm vào để sang trang đăng ký.
// Các ảnh nằm cạnh nhau trong 1 "track" dài, mỗi 5 giây dịch track sang trái 1 ảnh
// (transform: translateX) để tạo hiệu ứng trượt ngang, quay vòng về ảnh đầu sau ảnh cuối.
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
      <div
        className="welcome-banner-track"
        style={{ transform: `translateX(-${slideIndex * 100}%)` }}
      >
        {SLIDES.map((src, i) => (
          <img key={i} src={src} alt="AskHub - Cộng đồng hỏi đáp lập trình" />
        ))}
      </div>
    </Link>
  )
}

export default WelcomeBanner

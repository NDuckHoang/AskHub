import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Compass } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useAskModal } from '../hooks/useAskModal'
import './Hero.css'

// Khối giới thiệu đầu trang chủ - thay cho banner ảnh tĩnh cũ, dùng đúng thương hiệu
// (gradient teal + coral) thay vì ảnh stock photo. totalQuestions lấy từ dữ liệu thật
// HomePage đã gọi API (không bịa số liệu).
function Hero({ totalQuestions }) {
  const { user } = useAuth()
  const { openAskModal } = useAskModal()
  const navigate = useNavigate()

  function handleAskClick() {
    if (user) {
      openAskModal()
    } else {
      navigate('/login')
    }
  }

  return (
    <section className="hero">
      {/* Họa tiết trừu tượng - các điểm nối bằng đường mảnh, gợi liên tưởng "mạng lưới tri
          thức"/sơ đồ code, không phải ảnh thật, độ mờ thấp nên không cạnh tranh với chữ */}
      <svg className="hero-pattern" viewBox="0 0 520 300" fill="none" aria-hidden="true">
        <path
          d="M300 40 L390 90 L470 60 M390 90 L410 170 M390 90 L320 160 M320 160 L250 220 M410 170 L480 230 M250 220 L180 190"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1.4"
        />
        <circle cx="300" cy="40" r="4" fill="rgba(255,255,255,0.35)" />
        <circle cx="390" cy="90" r="5" fill="rgba(255,255,255,0.4)" />
        <circle cx="470" cy="60" r="3.5" fill="rgba(255,255,255,0.3)" />
        <circle cx="410" cy="170" r="4" fill="rgba(255,255,255,0.3)" />
        <circle cx="320" cy="160" r="3" fill="rgba(255,255,255,0.25)" />
        <circle cx="250" cy="220" r="4.5" fill="rgba(255,255,255,0.3)" />
        <circle cx="480" cy="230" r="3" fill="rgba(255,255,255,0.25)" />
        <circle cx="180" cy="190" r="3" fill="rgba(255,255,255,0.22)" />
      </svg>

      <div className="hero-text">
        <span className="hero-eyebrow">Cộng đồng hỏi đáp lập trình</span>
        <h1 className="hero-title">Nơi câu hỏi lập trình của bạn có lời giải</h1>
        <p className="hero-subtitle">
          Đặt câu hỏi, chia sẻ kiến thức và cùng cộng đồng AskHub giải quyết vấn đề mỗi ngày.
        </p>
        <div className="hero-actions">
          <button type="button" className="btn btn-gradient" onClick={handleAskClick}>
            Đặt câu hỏi <ArrowRight size={16} />
          </button>
          <Link to="/categories" className="btn btn-secondary hero-secondary-btn">
            <Compass size={16} /> Khám phá danh mục
          </Link>
        </div>
      </div>

      {totalQuestions != null && (
        <div className="hero-stat">
          <span className="hero-stat-number stat-number">{totalQuestions.toLocaleString('vi-VN')}</span>
          <span className="hero-stat-label">
            câu hỏi
            <br />
            từ cộng đồng
          </span>
        </div>
      )}
    </section>
  )
}

export default Hero

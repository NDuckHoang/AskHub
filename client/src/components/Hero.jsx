import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useAskModal } from '../hooks/useAskModal'
import { useCountUp } from '../hooks/useCountUp'
import * as questionService from '../services/questionService'
import * as categoryService from '../services/categoryService'
import './Hero.css'

const ROTATE_MS = 2400 // thời gian giữa 2 lần đổi chữ trong tiêu đề

// Ô số liệu trong hero: số đếm từ 0 lên khi có dữ liệu thật
function HeroStat({ value, label }) {
  const shown = useCountUp(value)
  return (
    <div className="hero-stat-tile">
      <span className="hero-stat-number stat-number">{shown === null ? '-' : shown.toLocaleString('vi-VN')}</span>
      <span className="hero-stat-label">{label}</span>
    </div>
  )
}

// Khối giới thiệu đầu trang chủ (gradient teal + cam). Tất cả số liệu lấy từ API có sẵn:
// tổng câu hỏi (HomePage truyền vào), số danh mục, số câu hỏi đang chờ trả lời.
function Hero({ totalQuestions }) {
  const { user } = useAuth()
  const { openAskModal } = useAskModal()
  const navigate = useNavigate()
  const [categoryCount, setCategoryCount] = useState(null)
  const [unansweredCount, setUnansweredCount] = useState(null)
  const [topicNames, setTopicNames] = useState([])
  const [topicIndex, setTopicIndex] = useState(0)

  useEffect(() => {
    categoryService
      .getCategories()
      .then((list) => {
        setCategoryCount(list.length)
        // Chữ xoay vòng trong tiêu đề: tên danh mục thật, nhiều câu hỏi trước, bỏ mục "Khác"
        const names = [...list]
          .sort((a, b) => b.question_count - a.question_count)
          .map((c) => c.name)
          .filter((name) => name.toLowerCase() !== 'khác')
        setTopicNames(names)
      })
      .catch(() => {})
    questionService
      .getQuestions({ sort: 'unanswered', page: 1, limit: 1 })
      .then((data) => setUnansweredCount(data.pagination.total))
      .catch(() => {})
  }, [])

  // Đổi chữ trong tiêu đề mỗi ROTATE_MS. Người dùng bật "giảm chuyển động" thì giữ chữ đầu tiên đứng yên.
  useEffect(() => {
    if (topicNames.length < 2) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const timer = setInterval(() => {
      setTopicIndex((i) => (i + 1) % topicNames.length)
    }, ROTATE_MS)
    return () => clearInterval(timer)
  }, [topicNames])

  function handleAskClick() {
    if (user) {
      openAskModal()
    } else {
      navigate('/login')
    }
  }

  return (
    <section className="hero">
      <span className="hero-shape hero-shape-ring anim-float" aria-hidden="true" />
      <span className="hero-shape hero-shape-dot anim-float" aria-hidden="true" />

      <div className="hero-text">
        <span className="hero-eyebrow">
          <Check size={13} strokeWidth={2.6} /> Cộng đồng hỏi đáp lập trình cho sinh viên
        </span>
        {/* aria-label cố định để trình đọc màn hình không đọc lại mỗi lần chữ đổi */}
        <h1 className="hero-title" aria-label="Hỏi gì về lập trình cũng có người trả lời.">
          <span aria-hidden="true">
            Hỏi gì về{' '}
            <span className="hero-rotator">
              {/* key đổi -> phần tử mới được tạo -> chạy lại hiệu ứng trượt lên */}
              <span key={topicIndex} className="hero-rotator-word">
                {topicNames[topicIndex] || 'lập trình'}
              </span>
            </span>{' '}
            <br />
            cũng có người trả lời.
          </span>
        </h1>
        <p className="hero-subtitle">
          Đặt câu hỏi, chia sẻ lời giải và tích lũy uy tín từ những câu trả lời được cộng đồng bình chọn.
        </p>
        <div className="hero-actions">
          <button type="button" className="btn btn-accent hero-primary-btn" onClick={handleAskClick}>
            Đặt câu hỏi đầu tiên
          </button>
          <Link to="/categories" className="btn btn-secondary hero-secondary-btn">
            Khám phá chủ đề
          </Link>
        </div>
      </div>

      <div className="hero-stats">
        <HeroStat value={totalQuestions} label="Câu hỏi" />
        <HeroStat value={categoryCount} label="Danh mục" />
        <HeroStat value={unansweredCount} label="Chờ trả lời" />
      </div>
    </section>
  )
}

export default Hero

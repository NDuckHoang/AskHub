import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, ArrowUp } from 'lucide-react'
import * as questionService from '../services/questionService'
import './FeaturedQuestions.css'

// Top câu hỏi nhiều vote nhất - trình bày dạng carousel thẻ cuộn ngang, cố tình khác hẳn
// bố cục dòng-danh-sách của QuestionItem bên dưới để 2 khu vực không bị giống nhau.
function FeaturedQuestions() {
  const [questions, setQuestions] = useState([])

  useEffect(() => {
    questionService
      .getQuestions({ sort: 'votes', limit: 6, page: 1 })
      .then((data) => setQuestions(data.questions.filter((q) => q.vote_count > 0)))
      .catch(() => {})
  }, [])

  // Không có câu hỏi nào có vote dương thì ẩn hẳn khối này, không cần empty state riêng
  if (questions.length === 0) return null

  return (
    <section className="featured-questions">
      <div className="featured-heading">
        <span className="featured-heading-icon">
          <TrendingUp size={15} />
        </span>
        <div>
          <h2>Câu hỏi nổi bật</h2>
          <p>Được cộng đồng bình chọn nhiều nhất</p>
        </div>
      </div>

      <div className="featured-track">
        {questions.map((q, index) => (
          <Link key={q.id} to={`/questions/${q.id}`} className="featured-card card-hover">
            <span className={`featured-rank${index < 3 ? ` is-top-${index + 1}` : ''}`}>#{index + 1}</span>
            <p className="featured-card-title">{q.title}</p>
            <span className="featured-card-votes">
              <ArrowUp size={13} />
              <span className="stat-number">{q.vote_count}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default FeaturedQuestions

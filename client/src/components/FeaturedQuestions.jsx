import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'
import * as questionService from '../services/questionService'
import './FeaturedQuestions.css'

// Top câu hỏi nhiều vote nhất - khối nội dung riêng ở Home, khác với list "Mới nhất" bên dưới
function FeaturedQuestions() {
  const [questions, setQuestions] = useState([])

  useEffect(() => {
    questionService
      .getQuestions({ sort: 'votes', limit: 5, page: 1 })
      .then((data) => setQuestions(data.questions.filter((q) => q.vote_count > 0)))
      .catch(() => {})
  }, [])

  // Không có câu hỏi nào có vote dương thì ẩn hẳn khối này, không cần empty state riêng
  if (questions.length === 0) return null

  return (
    <section className="card featured-questions">
      <h2 className="featured-heading">
        <TrendingUp size={16} /> Câu hỏi nổi bật
      </h2>
      <ol className="featured-list">
        {questions.map((q, index) => (
          <li key={q.id}>
            <span className="featured-rank">{index + 1}</span>
            <Link to={`/questions/${q.id}`} className="featured-title">
              {q.title}
            </Link>
            <span className="featured-votes stat-number">{q.vote_count} vote</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default FeaturedQuestions

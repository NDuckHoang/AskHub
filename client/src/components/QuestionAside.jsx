import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Info, Link2 } from 'lucide-react'
import * as questionService from '../services/questionService'
import { formatRelativeTime } from '../utils/formatTime'
import './QuestionAside.css'

// Cột phải trang chi tiết: thông tin câu hỏi + câu hỏi liên quan (cùng danh mục, lấy từ API có sẵn)
function QuestionAside({ question, answerCount }) {
  const [related, setRelated] = useState(null)

  useEffect(() => {
    if (!question.category_id) {
      setRelated([])
      return
    }
    questionService
      .getQuestions({ category_id: question.category_id, sort: 'newest', page: 1, limit: 6 })
      .then((data) => setRelated(data.questions.filter((q) => q.id !== question.id).slice(0, 4)))
      .catch(() => setRelated([]))
  }, [question.id, question.category_id])

  return (
    <aside className="question-aside">
      <section className="card question-aside-section">
        <h3 className="question-aside-title">
          <Info size={14} /> Thông tin câu hỏi
        </h3>
        <dl className="question-aside-info">
          <dt>Đăng</dt>
          <dd>{formatRelativeTime(question.created_at)}</dd>
          <dt>Lượt xem</dt>
          <dd className="stat-number">{question.views}</dd>
          <dt>Câu trả lời</dt>
          <dd className="stat-number">{answerCount ?? '-'}</dd>
          {question.category_name && (
            <>
              <dt>Danh mục</dt>
              <dd>{question.category_name}</dd>
            </>
          )}
        </dl>
      </section>

      {related && related.length > 0 && (
        <section className="card question-aside-section">
          <h3 className="question-aside-title">
            <Link2 size={14} /> Câu hỏi liên quan
          </h3>
          <ul className="question-aside-related">
            {related.map((q) => (
              <li key={q.id}>
                <span className={`question-aside-votes stat-number${q.accepted_count > 0 ? ' is-solved' : ''}`}>
                  {q.vote_count}
                </span>
                <Link to={`/questions/${q.id}`}>{q.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  )
}

export default QuestionAside

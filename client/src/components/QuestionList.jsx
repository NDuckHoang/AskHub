import { Link } from 'react-router-dom'
import QuestionItem from './QuestionItem'
import './QuestionList.css'

function SkeletonItem() {
  return (
    <div className="question-item">
      <div className="skeleton" style={{ height: 13, width: 160 }} />
      <div className="skeleton" style={{ height: 20, width: '70%' }} />
      <div className="skeleton" style={{ height: 13, width: 200 }} />
    </div>
  )
}

// Danh sách câu hỏi dạng forum, tự xử lý 3 trạng thái: loading / error / empty
function QuestionList({
  questions,
  loading,
  error,
  onRetry,
  emptyMessage = 'Chưa có câu hỏi nào phù hợp. Hãy là người đầu tiên đặt câu hỏi!',
  emptyActionTo = '/ask',
  emptyActionLabel = 'Đặt câu hỏi',
}) {
  if (loading) {
    return (
      <div className="card question-list">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonItem key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="card state-box state-error">
        <p>Không tải được danh sách câu hỏi. Vui lòng kiểm tra kết nối và thử lại.</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
          Thử lại
        </button>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="card state-box">
        <p>{emptyMessage}</p>
        <Link to={emptyActionTo} className="btn btn-primary btn-sm">
          {emptyActionLabel}
        </Link>
      </div>
    )
  }

  return (
    <div className="card question-list">
      {questions.map((q) => (
        <QuestionItem key={q.id} question={q} />
      ))}
    </div>
  )
}

export default QuestionList

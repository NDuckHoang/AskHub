import './QuestionSortBar.css'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'votes', label: 'Nhiều vote' },
  { value: 'answers', label: 'Nhiều câu trả lời' },
  { value: 'unanswered', label: 'Chưa có câu trả lời' },
]

// Dòng công cụ dùng chung cho Home và Questions: số lượng + tab sort + dropdown danh mục
function QuestionSortBar({ total, loading, error, sort, onSortChange, categoryId, onCategoryChange, categories }) {
  return (
    <div className="question-toolbar">
      {!loading && !error && <span className="question-toolbar-count">{total} câu hỏi</span>}

      <div className="question-sort-tabs">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`question-sort-tab${sort === opt.value ? ' is-active' : ''}`}
            onClick={() => onSortChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <select className="select question-category-select" value={categoryId} onChange={onCategoryChange}>
        <option value="">Tất cả danh mục</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default QuestionSortBar

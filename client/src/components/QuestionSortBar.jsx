import Select from './Select'
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

      <Select
        className="question-category-select"
        ariaLabel="Lọc theo danh mục"
        value={String(categoryId ?? '')}
        onChange={(v) => onCategoryChange({ target: { value: v } })}
        options={[{ value: '', label: 'Tất cả danh mục' }, ...categories.map((c) => ({ value: String(c.id), label: c.name }))]}
      />
    </div>
  )
}

export default QuestionSortBar

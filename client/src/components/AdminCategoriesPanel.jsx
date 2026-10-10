import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight, Pencil, Trash2, Plus, X } from 'lucide-react'
import * as categoryService from '../services/categoryService'
import * as questionService from '../services/questionService'
import { useConfirm } from '../hooks/useConfirm'
import { useToast } from '../hooks/useToast'
import { formatRelativeTime } from '../utils/formatTime'
import './AdminCategoriesPanel.css'

// Form dùng chung cho cả "Thêm danh mục" và "Sửa danh mục"
function CategoryForm({ initialValues, onSubmit, onCancel, submitLabel }) {
  const [name, setName] = useState(initialValues?.name || '')
  const [description, setDescription] = useState(initialValues?.description || '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (name.trim().length < 2) {
      setError('Tên danh mục phải có ít nhất 2 ký tự')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({ name: name.trim(), description: description.trim() })
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
      setSubmitting(false)
    }
  }

  return (
    <form className="admin-category-form" onSubmit={handleSubmit}>
      <input
        className="input"
        placeholder="Tên danh mục"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="input"
        placeholder="Mô tả (không bắt buộc)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {error && <span className="field-error">{error}</span>}
      <div className="admin-category-form-actions">
        <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
            Hủy
          </button>
        )}
      </div>
    </form>
  )
}

function AdminCategoriesPanel() {
  const confirm = useConfirm()
  const showToast = useToast()
  const [categories, setCategories] = useState(null)
  const [error, setError] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [actionError, setActionError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  // { [categoryId]: question[] | null (đang tải) | 'error' }
  const [categoryQuestions, setCategoryQuestions] = useState({})

  function fetchCategories() {
    setCategories(null)
    setError(false)
    categoryService
      .getCategories()
      .then(setCategories)
      .catch(() => setError(true))
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  async function handleCreate(data) {
    await categoryService.createCategory(data)
    setShowAddForm(false)
    fetchCategories()
    showToast('Đã tạo danh mục')
  }

  async function handleUpdate(id, data) {
    await categoryService.updateCategory(id, data)
    setEditingId(null)
    fetchCategories()
    showToast('Đã lưu thay đổi')
  }

  function fetchCategoryQuestions(categoryId) {
    setCategoryQuestions((prev) => ({ ...prev, [categoryId]: null }))
    questionService
      .getQuestions({ category_id: categoryId, sort: 'newest', limit: 10 })
      .then((data) => setCategoryQuestions((prev) => ({ ...prev, [categoryId]: data.questions })))
      .catch(() => setCategoryQuestions((prev) => ({ ...prev, [categoryId]: 'error' })))
  }

  function toggleExpand(categoryId) {
    if (expandedId === categoryId) {
      setExpandedId(null)
      return
    }
    setExpandedId(categoryId)
    // Chỉ fetch lần đầu mở, các lần sau dùng lại kết quả đã có
    if (categoryQuestions[categoryId] === undefined) {
      fetchCategoryQuestions(categoryId)
    }
  }

  async function handleDelete(c) {
    const ok = await confirm({
      title: 'Xóa danh mục',
      message: `Xóa danh mục "${c.name}"? Câu hỏi trong danh mục này sẽ chuyển thành "chưa phân loại".`,
      danger: true,
    })
    if (!ok) return
    setActionError('')
    try {
      await categoryService.deleteCategory(c.id)
      fetchCategories()
      showToast(`Đã xóa danh mục "${c.name}"`)
    } catch (err) {
      setActionError(err.response?.data?.message || 'Xóa thất bại')
    }
  }

  return (
    <div>
      <div className="admin-categories-header">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowAddForm((v) => !v)}>
          {showAddForm ? (
            <>
              <X size={14} /> Đóng
            </>
          ) : (
            <>
              <Plus size={14} /> Thêm danh mục
            </>
          )}
        </button>
      </div>

      {showAddForm && (
        <div className="card admin-category-form-card">
          <CategoryForm onSubmit={handleCreate} submitLabel="Tạo danh mục" />
        </div>
      )}

      {actionError && <div className="auth-error">{actionError}</div>}

      {categories === null && !error && <div className="skeleton" style={{ height: 240, borderRadius: 8 }} />}

      {error && (
        <div className="card state-box state-error">
          <p>Không tải được danh sách danh mục.</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={fetchCategories}>
            Thử lại
          </button>
        </div>
      )}

      {categories && categories.length > 0 && (
        <div className="card admin-category-list">
          {categories.map((c) => {
            const questions = categoryQuestions[c.id]
            const isExpanded = expandedId === c.id

            return (
              <div key={c.id} className="admin-category-item">
                <div className="admin-category-row">
                  {editingId === c.id ? (
                    <CategoryForm
                      initialValues={c}
                      submitLabel="Lưu"
                      onSubmit={(data) => handleUpdate(c.id, data)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <>
                      <button
                        type="button"
                        className="admin-category-toggle"
                        onClick={() => toggleExpand(c.id)}
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <span className="admin-category-info">
                          <span className="admin-category-name">{c.name}</span>
                          {c.description && (
                            <span className="admin-category-description">{c.description}</span>
                          )}
                          <span className="admin-category-count stat-number">{c.question_count} câu hỏi</span>
                        </span>
                      </button>
                      <div className="admin-category-actions">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingId(c.id)}>
                          <Pencil size={14} /> Sửa
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(c)}>
                          <Trash2 size={14} /> Xóa
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {isExpanded && editingId !== c.id && (
                  <div className="admin-category-questions">
                    {questions === null && <div className="skeleton" style={{ height: 60, borderRadius: 8 }} />}

                    {questions === 'error' && (
                      <p className="admin-category-questions-empty">
                        Không tải được câu hỏi.{' '}
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => fetchCategoryQuestions(c.id)}>
                          Thử lại
                        </button>
                      </p>
                    )}

                    {Array.isArray(questions) && questions.length === 0 && (
                      <p className="admin-category-questions-empty">Danh mục này chưa có câu hỏi nào.</p>
                    )}

                    {Array.isArray(questions) && questions.length > 0 && (
                      <ul className="admin-category-questions-list">
                        {questions.map((q) => (
                          <li key={q.id}>
                            <Link to={`/questions/${q.id}`}>{q.title}</Link>
                            <span className="admin-category-question-meta">
                              {q.answer_count} trả lời · {formatRelativeTime(q.created_at)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminCategoriesPanel

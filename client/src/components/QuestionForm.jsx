import { useEffect, useState } from 'react'
import { X, CheckCircle2 } from 'lucide-react'
import * as categoryService from '../services/categoryService'
import Select from './Select'
import MarkdownEditor from './MarkdownEditor'
import './QuestionForm.css'

// Giới hạn độ dài - giống hệt rule bên backend
const TITLE_MIN = 10
const TITLE_MAX = 255
const CONTENT_MIN = 20

// Validate giống hệt rule bên backend để báo lỗi ngay, không cần đợi submit
function validate({ title, content, categoryId, tags }) {
  const errors = {}
  const trimmedTitle = title.trim()
  const trimmedContent = content.trim()

  if (trimmedTitle.length < TITLE_MIN || trimmedTitle.length > TITLE_MAX) {
    errors.title = `Tiêu đề phải có từ ${TITLE_MIN} đến ${TITLE_MAX} ký tự`
  }
  if (trimmedContent.length < CONTENT_MIN) {
    errors.content = `Nội dung phải có ít nhất ${CONTENT_MIN} ký tự`
  }
  if (!categoryId) {
    errors.categoryId = 'Vui lòng chọn danh mục'
  }
  if (tags.length === 0) {
    errors.tags = 'Vui lòng nhập ít nhất 1 tag'
  } else if (tags.length > 5) {
    errors.tags = 'Chỉ được nhập tối đa 5 tag'
  }

  return errors
}

// Dùng chung cho trang/modal Đặt câu hỏi (tạo mới) và Sửa câu hỏi
// editorRows: chiều cao ô nội dung (số dòng) - modal truyền nhỏ hơn để vừa màn hình
// actionsStart: nội dung tùy chọn đặt bên trái hàng nút gửi (modal dùng để hiện người đăng)
function QuestionForm({ initialValues, onSubmit, submitLabel, editorRows = 8, actionsStart }) {
  const [title, setTitle] = useState(initialValues?.title || '')
  const [content, setContent] = useState(initialValues?.content || '')
  const [categoryId, setCategoryId] = useState(initialValues?.category_id || '')
  const [tags, setTags] = useState(initialValues?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [categories, setCategories] = useState([])
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(() => {})
  }, [])

  function clearError(field) {
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function addTag(raw) {
    const name = raw.trim().toLowerCase()
    if (!name || tags.length >= 5 || tags.includes(name)) {
      setTagInput('')
      return
    }
    setTags([...tags, name])
    setTagInput('')
    clearError('tags')
  }

  function handleTagInputKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1))
    }
  }

  function removeTag(name) {
    setTags(tags.filter((t) => t !== name))
  }

  const titleLength = title.trim().length
  const titleValid = titleLength >= TITLE_MIN && titleLength <= TITLE_MAX

  function handleTitleChange(e) {
    setTitle(e.target.value)
    clearError('title')
  }

  function handleCategoryChange(e) {
    setCategoryId(e.target.value)
    clearError('categoryId')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')

    const validationErrors = validate({ title, content, categoryId, tags })
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        category_id: Number(categoryId),
        tags,
      })
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
      setSubmitting(false)
    }
  }

  return (
    <form className="question-form" onSubmit={handleSubmit} noValidate>
      {submitError && <div className="auth-error">{submitError}</div>}

      <div className="field">
        <label className="field-label" htmlFor="title">
          Tiêu đề
        </label>
        <span className="question-form-hint">Tóm tắt vấn đề trong một câu, nêu rõ công nghệ đang dùng.</span>
        <input
          id="title"
          className={`input${errors.title ? ' has-error' : ''}`}
          value={title}
          onChange={handleTitleChange}
          maxLength={TITLE_MAX}
          placeholder="Ví dụ: Làm thế nào để sử dụng useEffect trong React?"
        />
        <div className="question-form-meta">
          {errors.title ? (
            <span className="field-error">{errors.title}</span>
          ) : titleValid ? (
            <span className="question-form-ok">
              <CheckCircle2 size={13} /> Tiêu đề hợp lệ
            </span>
          ) : (
            <span>Tối thiểu {TITLE_MIN} ký tự</span>
          )}
          <span className="question-form-counter stat-number">
            {titleLength} / {TITLE_MAX}
          </span>
        </div>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="content">
          Nội dung
        </label>
        <span className="question-form-hint">
          Nêu những gì bạn đã thử, lỗi gặp phải và đoạn code liên quan (hỗ trợ Markdown).
        </span>
        <MarkdownEditor
          id="content"
          value={content}
          onChange={setContent}
          onErrorClear={() => clearError('content')}
          onUploadingChange={setUploadingImage}
          hasError={!!errors.content}
          placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải, bạn đã thử những gì..."
          rows={editorRows}
        />
        <div className="question-form-meta">
          {errors.content ? (
            <span className="field-error">{errors.content}</span>
          ) : (
            <span>Tối thiểu {CONTENT_MIN} ký tự</span>
          )}
          <span className="question-form-counter stat-number">{content.trim().length} ký tự</span>
        </div>
      </div>

      {/* Danh mục + Tags cạnh nhau trên màn rộng (như prototype), xếp dọc trên mobile */}
      <div className="question-form-row">
      <div className="field">
        <label className="field-label" htmlFor="category">
          Danh mục
        </label>
        <Select
          id="category"
          hasError={Boolean(errors.categoryId)}
          value={String(categoryId)}
          onChange={(v) => handleCategoryChange({ target: { value: v } })}
          placeholder="-- Chọn danh mục --"
          options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
        />
        {errors.categoryId && <span className="field-error">{errors.categoryId}</span>}
      </div>

      <div className="field">
        <label className="field-label" htmlFor="tags">
          Tags
        </label>
        <div className={`tag-input-box${errors.tags ? ' has-error' : ''}`}>
          {tags.map((t) => (
            <span key={t} className="tag-pill tag-pill-removable">
              {t}
              <button type="button" onClick={() => removeTag(t)} aria-label={`Xóa tag ${t}`}>
                <X size={12} />
              </button>
            </span>
          ))}
          <input
            id="tags"
            className="tag-input"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            onBlur={() => addTag(tagInput)}
            placeholder={tags.length === 0 ? 'Nhập tag rồi nhấn Enter (vd: reactjs)' : ''}
          />
        </div>
        {errors.tags && <span className="field-error">{errors.tags}</span>}
        <span className="field-hint">Tối đa 5 tag, nhấn Enter hoặc dấu phẩy để thêm</span>
      </div>
      </div>

      <div className="question-form-actions">
        {actionsStart}
        <button type="submit" className="btn btn-primary" disabled={submitting || uploadingImage}>
          {submitting ? 'Đang gửi...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default QuestionForm

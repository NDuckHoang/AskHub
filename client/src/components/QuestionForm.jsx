import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import * as categoryService from '../services/categoryService'
import MarkdownEditor from './MarkdownEditor'
import './QuestionForm.css'

// Validate giống hệt rule bên backend để báo lỗi ngay, không cần đợi submit
function validate({ title, content, categoryId, tags }) {
  const errors = {}
  const trimmedTitle = title.trim()
  const trimmedContent = content.trim()

  if (trimmedTitle.length < 10 || trimmedTitle.length > 255) {
    errors.title = 'Tiêu đề phải có từ 10 đến 255 ký tự'
  }
  if (trimmedContent.length < 20) {
    errors.content = 'Nội dung phải có ít nhất 20 ký tự'
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
function QuestionForm({ initialValues, onSubmit, submitLabel }) {
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
        <input
          id="title"
          className={`input${errors.title ? ' has-error' : ''}`}
          value={title}
          onChange={handleTitleChange}
          placeholder="Ví dụ: Làm thế nào để sử dụng useEffect trong React?"
        />
        {errors.title && <span className="field-error">{errors.title}</span>}
      </div>

      <div className="field">
        <label className="field-label" htmlFor="content">
          Nội dung
        </label>
        <MarkdownEditor
          id="content"
          value={content}
          onChange={setContent}
          onErrorClear={() => clearError('content')}
          onUploadingChange={setUploadingImage}
          hasError={!!errors.content}
          placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải, bạn đã thử những gì..."
          rows={8}
        />
        {errors.content && <span className="field-error">{errors.content}</span>}
      </div>

      <div className="field">
        <label className="field-label" htmlFor="category">
          Danh mục
        </label>
        <select
          id="category"
          className={`select${errors.categoryId ? ' has-error' : ''}`}
          value={categoryId}
          onChange={handleCategoryChange}
        >
          <option value="">-- Chọn danh mục --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
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

      <button type="submit" className="btn btn-primary" disabled={submitting || uploadingImage}>
        {submitting ? 'Đang gửi...' : submitLabel}
      </button>
    </form>
  )
}

export default QuestionForm

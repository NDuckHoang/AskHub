import { useRef, useState } from 'react'
import { Bold, Italic, Code, Link2, Quote, List, Image as ImageIcon, X } from 'lucide-react'
import * as uploadService from '../services/uploadService'
import MarkdownContent from './MarkdownContent'
import './MarkdownEditor.css'

// Tìm các ảnh ![mô tả](url) đã có sẵn trong nội dung (dùng khi sửa câu hỏi/trả lời cũ)
// để hiện lại thumbnail ngay từ đầu, không chỉ với ảnh mới upload trong phiên này
function extractImagesFromContent(text) {
  const regex = /\n?!\[[^\]]*\]\(([^)\s]+)\)\n?/g
  const found = []
  let match
  while ((match = regex.exec(text)) !== null) {
    found.push({ url: match[1], markdownText: match[0] })
  }
  return found
}

// Ô nhập nội dung dùng chung cho câu hỏi và câu trả lời:
// toolbar định dạng, upload ảnh (thumbnail + nút xóa), xem trước trực tiếp bên dưới.
function MarkdownEditor({ id, value, onChange, onErrorClear, placeholder, rows = 8, hasError, onUploadingChange }) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [images, setImages] = useState(() => extractImagesFromContent(value || ''))
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  // Chèn text vào đúng vị trí con trỏ (dùng cho toolbar định dạng).
  // Set value + con trỏ thẳng trên DOM trước (đồng bộ), rồi mới báo lên component cha -
  // tránh khoảng trễ 1 frame khiến ký tự gõ ngay sau đó bị lạc vị trí con trỏ.
  function insertAtCursor(before, after, placeholderText) {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const hasSelection = start !== end
    const selected = hasSelection ? value.slice(start, end) : placeholderText || ''
    const newValue = value.slice(0, start) + before + selected + after + value.slice(end)

    el.value = newValue
    el.focus()

    if (hasSelection) {
      const cursorPos = start + before.length + selected.length + after.length
      el.setSelectionRange(cursorPos, cursorPos)
    } else {
      // Chưa chọn chữ nào -> bôi đen sẵn phần chữ mẫu để gõ đè lên là thay thế đúng,
      // tránh trường hợp gõ tiếp bị lọt ra ngoài cặp ký hiệu định dạng
      const selStart = start + before.length
      el.setSelectionRange(selStart, selStart + selected.length)
    }

    onChange(newValue)
    onErrorClear?.()
  }

  // Thêm tiền tố vào đầu dòng hiện tại (dùng cho quote, list)
  function insertLinePrefix(prefix) {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const newValue = value.slice(0, lineStart) + prefix + value.slice(lineStart)
    const cursorPos = start + prefix.length

    el.value = newValue
    el.focus()
    el.setSelectionRange(cursorPos, cursorPos)
    onChange(newValue)
    onErrorClear?.()
  }

  function handleInsertLink() {
    const url = window.prompt('Nhập URL liên kết:')
    if (!url) return
    insertAtCursor('[', `](${url})`, 'mô tả liên kết')
  }

  function handleImageButtonClick() {
    fileInputRef.current?.click()
  }

  async function handleImageSelected(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Chỉ được upload file ảnh')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ảnh không được vượt quá 5MB')
      return
    }

    setUploadError('')
    setUploading(true)
    onUploadingChange?.(true)
    try {
      const url = await uploadService.uploadImage(file)
      const markdownText = `\n![mô tả ảnh](${url})\n`
      insertAtCursor(markdownText, '')
      setImages((prev) => [...prev, { url, markdownText }])
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload ảnh thất bại, vui lòng thử lại')
    } finally {
      setUploading(false)
      onUploadingChange?.(false)
    }
  }

  // Xóa ảnh khỏi dải xem trước lẫn khỏi nội dung (gỡ đúng đoạn markdown đã chèn)
  function handleRemoveImage(image) {
    onChange(value.replace(image.markdownText, '\n'))
    setImages((prev) => prev.filter((img) => img !== image))
  }

  return (
    <div className="markdown-editor">
      {images.length > 0 && (
        <div className="image-attachment-list">
          {images.map((image) => (
            <div key={image.url} className="image-attachment">
              <img src={image.url} alt="Ảnh đã tải lên" />
              <button
                type="button"
                className="image-attachment-remove"
                onClick={() => handleRemoveImage(image)}
                aria-label="Xóa ảnh"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="markdown-toolbar">
        <button type="button" title="In đậm" onClick={() => insertAtCursor('**', '**', 'chữ đậm')}>
          <Bold size={16} />
        </button>
        <button type="button" title="In nghiêng" onClick={() => insertAtCursor('*', '*', 'chữ nghiêng')}>
          <Italic size={16} />
        </button>
        <button type="button" title="Code" onClick={() => insertAtCursor('`', '`', 'code')}>
          <Code size={16} />
        </button>
        <button type="button" title="Trích dẫn" onClick={() => insertLinePrefix('> ')}>
          <Quote size={16} />
        </button>
        <button type="button" title="Danh sách" onClick={() => insertLinePrefix('- ')}>
          <List size={16} />
        </button>
        <button type="button" title="Chèn liên kết" onClick={handleInsertLink}>
          <Link2 size={16} />
        </button>
        <button type="button" title="Chèn ảnh" onClick={handleImageButtonClick} disabled={uploading}>
          <ImageIcon size={16} />
        </button>
        {uploading && <span className="markdown-toolbar-status">Đang tải ảnh lên...</span>}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="visually-hidden"
          onChange={handleImageSelected}
        />
      </div>

      <textarea
        id={id}
        ref={textareaRef}
        className={`textarea${hasError ? ' has-error' : ''}`}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          onErrorClear?.()
        }}
        placeholder={placeholder}
        rows={rows}
      />

      {uploadError && <span className="field-error">{uploadError}</span>}

      {value.trim() && (
        <div className="content-live-preview">
          <span className="content-live-preview-label">Xem trước</span>
          <MarkdownContent text={value} />
        </div>
      )}
    </div>
  )
}

export default MarkdownEditor

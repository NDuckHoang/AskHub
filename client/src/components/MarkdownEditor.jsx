import { useEffect, useRef, useState } from 'react'
import { Bold, Italic, Code, Link2, Quote, List, Image as ImageIcon } from 'lucide-react'
import * as uploadService from '../services/uploadService'
import { isSafeUrl } from '../utils/markdown'
import {
  markdownToEditableHtml,
  htmlToMarkdown,
  normalizeTopLevel,
  escapeHtmlAttr,
  escapeHtmlText,
} from '../utils/editorHtml'
import './MarkdownEditor.css'

// Xóa các thẻ inline rỗng (không có chữ, không có ảnh/br) còn sót lại sau khi tách
// dòng bằng Range.extractContents()
function stripEmptyInline(node) {
  Array.from(node.childNodes).forEach((child) => {
    if (child.nodeType !== Node.ELEMENT_NODE) return
    if (child.nodeName === 'IMG' || child.nodeName === 'BR') return
    stripEmptyInline(child)
    if (!child.textContent && !child.querySelector('img, br')) {
      child.remove()
    }
  })
}

// Ô nhập nội dung WYSIWYG dùng chung cho câu hỏi và câu trả lời: gõ/định dạng tới
// đâu thấy kết quả thật tới đó (đậm, nghiêng, code, quote, list, ảnh), không cần ô
// xem trước riêng bên dưới.
//
// DOM của vùng soạn thảo là "nguồn sự thật" trong lúc gõ - value/onChange chỉ đồng
// bộ khi value bị đổi từ BÊN NGOÀI editor (mount lần đầu, hoặc form cha tự reset sau
// khi submit). Nếu set lại innerHTML mỗi lần gõ thì con trỏ sẽ bị nhảy về đầu.
function MarkdownEditor({ id, value, onChange, onErrorClear, placeholder, rows = 8, hasError, onUploadingChange }) {
  const editorRef = useRef(null)
  const savedRangeRef = useRef(null)
  const lastEmittedRef = useRef(undefined)
  const fileInputRef = useRef(null)
  const linkPopoverRef = useRef(null)
  const linkInputRef = useRef(null)

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [isEmpty, setIsEmpty] = useState(!value?.trim())
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false)
  const [linkUrlInput, setLinkUrlInput] = useState('')
  const [linkError, setLinkError] = useState('')

  // Ép trình duyệt tạo <div> cho mỗi dòng mới (Enter) thay vì <p>/<br> tùy trình
  // duyệt, khớp với mô hình "mỗi dòng 1 khối" mà editorHtml.js giả định
  useEffect(() => {
    try {
      document.execCommand('defaultParagraphSeparator', false, 'div')
    } catch {
      // Trình duyệt không hỗ trợ lệnh này thì bỏ qua, vẫn hoạt động được ở mức cơ bản
    }
  }, [])

  // Focus ô nhập URL ngay khi hộp thoại chèn liên kết mở ra
  useEffect(() => {
    if (linkPopoverOpen) linkInputRef.current?.focus()
  }, [linkPopoverOpen])

  // Bấm ra ngoài hộp thoại chèn liên kết thì tự đóng lại
  useEffect(() => {
    function handleClickOutside(e) {
      if (linkPopoverRef.current && !linkPopoverRef.current.contains(e.target)) {
        closeLinkPopover()
      }
    }
    if (linkPopoverOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkPopoverOpen])

  // Chỉ đồng bộ DOM khi value đổi từ bên ngoài (không phải do chính editor vừa emit)
  useEffect(() => {
    if (value === lastEmittedRef.current) return
    lastEmittedRef.current = value
    if (editorRef.current) {
      editorRef.current.innerHTML = markdownToEditableHtml(value)
      setIsEmpty(!value?.trim())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  function syncChange() {
    if (!editorRef.current) return
    normalizeTopLevel(editorRef.current)
    const markdown = htmlToMarkdown(editorRef.current)
    lastEmittedRef.current = markdown
    onChange(markdown)
    onErrorClear?.()
    setIsEmpty(!editorRef.current.textContent.trim() && !editorRef.current.querySelector('img'))
  }

  function focusEditor() {
    editorRef.current?.focus()
  }

  function saveSelection() {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange()
    }
  }

  function restoreSelection() {
    const sel = window.getSelection()
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges()
      sel.addRange(savedRangeRef.current)
    }
  }

  function handleInput() {
    syncChange()
  }

  // Tự xử lý Enter thay vì để trình duyệt lo: trình duyệt có xu hướng cho dòng mới
  // "thừa hưởng" định dạng (đậm/nghiêng/code) của cuối dòng trước nếu dòng trước kết
  // thúc ngay sát 1 thẻ định dạng - tách thủ công bằng Range đảm bảo dòng mới luôn là
  // <div> trơn, không dính định dạng nào còn sót lại.
  function handleKeyDown(e) {
    if (e.key !== 'Enter') return
    if (document.queryCommandState('insertUnorderedList')) return // để trình duyệt tự lo trong danh sách

    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return

    const range = sel.getRangeAt(0)

    // Tìm khối (div/blockquote...) chứa con trỏ trước, nếu không xác định được thì
    // để trình duyệt tự xử lý Enter như bình thường (an toàn hơn là làm hỏng nội dung)
    let currentBlock = range.startContainer
    if (currentBlock.nodeType === Node.TEXT_NODE) currentBlock = currentBlock.parentElement
    while (currentBlock && currentBlock.parentElement !== editorRef.current) {
      currentBlock = currentBlock.parentElement
    }
    if (!currentBlock) return

    e.preventDefault()
    range.deleteContents()

    const newDiv = document.createElement('div')
    if (currentBlock.lastChild) {
      const afterRange = document.createRange()
      afterRange.setStart(range.startContainer, range.startOffset)
      afterRange.setEndAfter(currentBlock.lastChild)
      newDiv.appendChild(afterRange.extractContents())
    }
    // extractContents() trên 1 range bắt đầu TRONG 1 thẻ inline (vd <code>) và kết
    // thúc SAU thẻ đó sẽ để lại 1 bản sao rỗng của thẻ đó (vd <code></code>) - dọn đi
    // để dòng mới không bị dính định dạng "ma" từ dòng trước
    stripEmptyInline(newDiv)
    if (newDiv.childNodes.length === 0) newDiv.appendChild(document.createElement('br'))
    if (currentBlock.childNodes.length === 0) currentBlock.appendChild(document.createElement('br'))

    currentBlock.after(newDiv)

    const newRange = document.createRange()
    newRange.setStart(newDiv, 0)
    newRange.collapse(true)
    sel.removeAllRanges()
    sel.addRange(newRange)

    syncChange()
  }

  function handlePaste(e) {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
    syncChange()
  }

  // Dùng onMouseDown + preventDefault (thay vì onClick) để nút toolbar không cướp
  // focus khỏi vùng soạn thảo - nếu không, vùng bôi đen (selection) sẽ mất trước khi
  // lệnh định dạng kịp chạy
  function toolbarMouseDown(action) {
    return (e) => {
      e.preventDefault()
      action()
    }
  }

  function applyBold() {
    focusEditor()
    document.execCommand('bold')
    syncChange()
  }

  function applyItalic() {
    focusEditor()
    document.execCommand('italic')
    syncChange()
  }

  function applyCode() {
    focusEditor()
    const sel = window.getSelection()
    const text = sel && !sel.isCollapsed ? sel.toString() : 'code'
    document.execCommand('insertHTML', false, `<code>${escapeHtmlText(text)}</code>`)
    syncChange()
  }

  function applyQuote() {
    focusEditor()
    const sel = window.getSelection()
    const node = sel?.anchorNode
    const el = node?.nodeType === Node.TEXT_NODE ? node.parentElement : node
    const inBlockquote = el?.closest('blockquote')
    document.execCommand('formatBlock', false, inBlockquote ? 'div' : 'blockquote')
    syncChange()
  }

  function applyList() {
    focusEditor()
    // Chỉ bật danh sách, không dùng nút này để tắt - tắt qua execCommand (bấm nút lần
    // 2 khi đang ở trong danh sách) khiến trình duyệt lồng thẻ sai, làm hỏng nội dung.
    // Để thoát danh sách, nhấn Enter ở 1 mục rỗng (hành vi gốc của trình duyệt, an toàn).
    if (document.queryCommandState('insertUnorderedList')) return
    document.execCommand('insertUnorderedList')
    syncChange()
  }

  // Mở hộp thoại nhỏ (tự thiết kế) để nhập URL, thay cho window.prompt() mặc định
  // của trình duyệt (xấu, không đồng bộ giao diện)
  function openLinkPopover() {
    saveSelection()
    setLinkUrlInput('')
    setLinkError('')
    setLinkPopoverOpen(true)
  }

  function closeLinkPopover() {
    setLinkPopoverOpen(false)
    setLinkUrlInput('')
    setLinkError('')
  }

  function confirmInsertLink(e) {
    e.preventDefault()
    const url = linkUrlInput.trim()
    if (!url) return
    if (!isSafeUrl(url)) {
      setLinkError('URL không hợp lệ (chỉ chấp nhận http://, https:// hoặc đường dẫn nội bộ)')
      return
    }

    setLinkPopoverOpen(false)
    setLinkUrlInput('')
    setLinkError('')
    focusEditor()
    restoreSelection()

    const sel = window.getSelection()
    if (sel && !sel.isCollapsed) {
      document.execCommand('createLink', false, url)
      const anchor = sel.anchorNode?.parentElement?.closest('a') || sel.focusNode?.parentElement?.closest('a')
      if (anchor) {
        anchor.target = '_blank'
        anchor.rel = 'noopener noreferrer'
      }
    } else {
      document.execCommand(
        'insertHTML',
        false,
        `<a href="${escapeHtmlAttr(url)}" target="_blank" rel="noopener noreferrer">mô tả liên kết</a>`
      )
    }
    syncChange()
  }

  function handleImageButtonClick() {
    saveSelection()
    fileInputRef.current?.click()
  }

  async function handleImageSelected(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Chỉ được upload file ảnh')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ảnh không được vượt quá 5MB')
      return
    }

    setError('')
    setUploading(true)
    onUploadingChange?.(true)
    try {
      const url = await uploadService.uploadImage(file)
      focusEditor()
      restoreSelection()
      document.execCommand('insertHTML', false, `<img src="${escapeHtmlAttr(url)}" alt="mô tả ảnh" />`)
      syncChange()
    } catch (err) {
      setError(err.response?.data?.message || 'Upload ảnh thất bại, vui lòng thử lại')
    } finally {
      setUploading(false)
      onUploadingChange?.(false)
    }
  }

  return (
    <div className="markdown-editor">
      <div className="markdown-toolbar">
        <button className="markdown-toolbar-btn" type="button" title="In đậm" onMouseDown={toolbarMouseDown(applyBold)}>
          <Bold size={16} />
        </button>
        <button className="markdown-toolbar-btn" type="button" title="In nghiêng" onMouseDown={toolbarMouseDown(applyItalic)}>
          <Italic size={16} />
        </button>
        <button className="markdown-toolbar-btn" type="button" title="Code" onMouseDown={toolbarMouseDown(applyCode)}>
          <Code size={16} />
        </button>
        <button className="markdown-toolbar-btn" type="button" title="Trích dẫn" onMouseDown={toolbarMouseDown(applyQuote)}>
          <Quote size={16} />
        </button>
        <button className="markdown-toolbar-btn" type="button" title="Danh sách" onMouseDown={toolbarMouseDown(applyList)}>
          <List size={16} />
        </button>
        <div className="markdown-link-wrap" ref={linkPopoverRef}>
          <button
            className="markdown-toolbar-btn"
            type="button"
            title="Chèn liên kết"
            onMouseDown={toolbarMouseDown(openLinkPopover)}
          >
            <Link2 size={16} />
          </button>

          {linkPopoverOpen && (
            // Dùng <div> chứ không phải <form> - popover này nằm bên trong form đăng
            // câu hỏi/trả lời, lồng <form> trong <form> là HTML không hợp lệ và khiến
            // submit hoạt động sai (trình duyệt tự "tách" form lồng ra theo cách khó đoán)
            <div
              className="markdown-link-popover"
              onKeyDown={(e) => {
                if (e.key === 'Escape') closeLinkPopover()
              }}
            >
              <label className="field-label" htmlFor={`${id}-link-url`}>
                Nhập URL liên kết
              </label>
              <input
                id={`${id}-link-url`}
                ref={linkInputRef}
                type="text"
                className="input"
                placeholder="https://..."
                value={linkUrlInput}
                onChange={(e) => {
                  setLinkUrlInput(e.target.value)
                  setLinkError('')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmInsertLink(e)
                }}
              />
              {linkError && <span className="field-error">{linkError}</span>}
              <div className="markdown-link-popover-actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={closeLinkPopover}>
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={confirmInsertLink}
                  disabled={!linkUrlInput.trim()}
                >
                  Chèn liên kết
                </button>
              </div>
            </div>
          )}
        </div>
        <button
          className="markdown-toolbar-btn"
          type="button"
          title="Chèn ảnh"
          onMouseDown={toolbarMouseDown(handleImageButtonClick)}
          disabled={uploading}
        >
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

      <div
        id={id}
        ref={editorRef}
        className={`markdown-editable${hasError ? ' has-error' : ''}${isEmpty ? ' is-empty' : ''}`}
        style={{ minHeight: `${rows * 24 + 20}px` }}
        contentEditable
        data-placeholder={placeholder}
        onInput={handleInput}
        onBlur={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        suppressContentEditableWarning
      />

      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

export default MarkdownEditor

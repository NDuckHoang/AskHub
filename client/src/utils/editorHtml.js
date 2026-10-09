// Chuyển đổi 2 chiều giữa markdown (lưu ở server) và HTML hiển thị trong vùng soạn
// thảo WYSIWYG (MarkdownEditor). Chỉ hỗ trợ đúng tập cú pháp mà renderMarkdown hỗ trợ
// (xem utils/markdown.js) - không cố xử lý markdown/HTML tùy ý.
//
// Mô hình: mỗi dòng nội dung là 1 khối <div> con trực tiếp của vùng soạn thảo (khớp
// với cách trình duyệt tự tạo khối mới khi bấm Enter, sau khi đã ép
// defaultParagraphSeparator = 'div'). Quote/list vẫn là khối <blockquote>/<ul> như
// renderMarkdown vốn tạo ra.

import { renderMarkdown, isSafeUrl } from './markdown'

// markdown -> HTML để đổ vào vùng soạn thảo lúc mount (vd sửa câu hỏi có sẵn nội dung)
export function markdownToEditableHtml(markdown) {
  if (!markdown || !markdown.trim()) return '<div><br></div>'

  const source = document.createElement('div')
  source.innerHTML = renderMarkdown(markdown)

  const result = document.createElement('div')
  let currentLine = document.createElement('div')

  function flushLine() {
    if (currentLine.childNodes.length === 0) {
      currentLine.appendChild(document.createElement('br'))
    }
    result.appendChild(currentLine)
    currentLine = document.createElement('div')
  }

  Array.from(source.childNodes).forEach((node) => {
    if (node.nodeName === 'BR') {
      flushLine()
    } else if (node.nodeName === 'BLOCKQUOTE' || node.nodeName === 'UL') {
      if (currentLine.childNodes.length > 0) flushLine()
      result.appendChild(node.cloneNode(true))
    } else {
      currentLine.appendChild(node.cloneNode(true))
    }
  })
  if (currentLine.childNodes.length > 0) flushLine()

  return result.innerHTML || '<div><br></div>'
}

const TOP_BLOCK_TAGS = new Set(['DIV', 'P', 'BLOCKQUOTE', 'UL'])

// Phòng vệ: 1 vài lệnh execCommand (vd insertHTML đè lên toàn bộ nội dung 1 khối) có
// thể làm trình duyệt "rớt" mất thẻ <div> bọc ngoài, để lại text/thẻ inline nằm trực
// tiếp ở gốc vùng soạn thảo. Gom các node "mồ côi" liền kề đó vào lại 1 <div> để DOM
// luôn giữ đúng bất biến "mỗi dòng là 1 khối" mà phần còn lại của editor giả định.
export function normalizeTopLevel(root) {
  if (!root) return
  let pendingWrapper = null
  Array.from(root.childNodes).forEach((node) => {
    const isBlock = node.nodeType === Node.ELEMENT_NODE && TOP_BLOCK_TAGS.has(node.nodeName)
    if (isBlock) {
      pendingWrapper = null
      return
    }
    if (!pendingWrapper) {
      pendingWrapper = document.createElement('div')
      node.before(pendingWrapper)
    }
    pendingWrapper.appendChild(node)
  })
}

export function escapeHtmlAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

export function escapeHtmlText(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

// Chuyển nội dung bên trong 1 khối (dòng/ô danh sách) thành 1 đoạn markdown inline
function serializeInline(node) {
  let result = ''
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      result += child.textContent
      return
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return

    switch (child.nodeName) {
      case 'BR':
        break
      case 'STRONG':
      case 'B': {
        const inner = serializeInline(child)
        result += inner.trim() ? `**${inner}**` : inner
        break
      }
      case 'EM':
      case 'I': {
        const inner = serializeInline(child)
        result += inner.trim() ? `*${inner}*` : inner
        break
      }
      case 'CODE':
        result += `\`${child.textContent}\``
        break
      case 'A': {
        const href = child.getAttribute('href') || ''
        const label = serializeInline(child) || href
        result += isSafeUrl(href) ? `[${label}](${href})` : label
        break
      }
      case 'IMG': {
        const src = child.getAttribute('src') || ''
        const alt = child.getAttribute('alt') || 'mô tả ảnh'
        if (isSafeUrl(src)) result += `![${alt}](${src})`
        break
      }
      default:
        // Thẻ lạ do trình duyệt tự chèn (span, font... khi dán nội dung) - chỉ lấy chữ
        result += serializeInline(child)
    }
  })
  return result
}

const BLOCK_TAGS = new Set(['DIV', 'P', 'BLOCKQUOTE', 'UL'])

// Trình duyệt không phải lúc nào cũng tạo đúng cấu trúc phẳng mà markdownToEditableHtml
// chèn vào ban đầu - vd insertUnorderedList có thể lồng <ul> vào trong <div> dòng hiện
// tại thay vì thay thế nó. Vì vậy đệ quy "mở" các khối lồng nhau thay vì giả định
// chắc chắn mỗi dòng/khối chỉ nằm ở đúng 1 cấp.
function hasBlockChild(node) {
  return Array.from(node.children || []).some((child) => BLOCK_TAGS.has(child.nodeName))
}

function serializeBlock(node, lines) {
  if (node.nodeType === Node.TEXT_NODE) {
    if (node.textContent.trim()) lines.push(node.textContent)
    return
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return

  switch (node.nodeName) {
    case 'BLOCKQUOTE':
      if (hasBlockChild(node)) {
        Array.from(node.childNodes).forEach((child) => serializeBlock(child, lines))
      } else {
        lines.push(`> ${serializeInline(node)}`)
      }
      break
    case 'UL':
      Array.from(node.children).forEach((li) => {
        if (li.nodeName === 'LI') lines.push(`- ${serializeInline(li)}`)
      })
      break
    case 'DIV':
    case 'P':
      if (hasBlockChild(node)) {
        Array.from(node.childNodes).forEach((child) => serializeBlock(child, lines))
      } else {
        lines.push(serializeInline(node))
      }
      break
    case 'BR':
      lines.push('')
      break
    default:
      lines.push(serializeInline(node))
  }
}

// Đọc lại toàn bộ DOM của vùng soạn thảo, trả về chuỗi markdown để lưu/gửi lên server
export function htmlToMarkdown(root) {
  if (!root) return ''
  const lines = []
  root.childNodes.forEach((node) => serializeBlock(node, lines))
  return lines.join('\n').trim()
}

// Bộ render markdown "nhẹ" tự viết (không dùng thư viện ngoài) cho nội dung
// câu hỏi/trả lời. Chỉ hỗ trợ đúng những cú pháp mà MarkdownToolbar chèn vào:
// **đậm**, *nghiêng*, `code`, ```code block```, > quote, - list, [link](url), ![ảnh](url)
// Không cố xử lý mọi trường hợp markdown phức tạp (bảng, heading lồng nhau...)

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Chỉ cho phép link/ảnh trỏ tới http(s) hoặc đường dẫn nội bộ (/uploads/...),
// chặn javascript: và các scheme nguy hiểm khác
function isSafeUrl(url) {
  return /^(https?:\/\/|\/)/i.test(url.trim())
}

export function renderMarkdown(raw) {
  if (!raw) return ''

  // 1. Escape HTML trước tiên để chống XSS, mọi bước sau chỉ chèn thẻ HTML "an toàn"
  let text = escapeHtml(raw)

  // 2. Tách code block ra placeholder, xử lý riêng ở bước cuối để các bước
  //    bên dưới (đậm/nghiêng/xuống dòng...) không đụng vào nội dung code
  const codeBlocks = []
  text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
    codeBlocks.push(code.trim())
    return `@@CODEBLOCK${codeBlocks.length - 1}@@`
  })

  text = text.replace(/`([^`\n]+)`/g, '<code>$1</code>')

  text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (match, alt, url) =>
    isSafeUrl(url) ? `<img src="${url}" alt="${alt}" loading="lazy" />` : match
  )

  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, url) =>
    isSafeUrl(url) ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>` : match
  )

  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  text = text.replace(/^&gt; ?(.*)$/gm, '<blockquote>$1</blockquote>')

  // Gom các dòng "- item" liên tiếp thành 1 danh sách <ul>
  text = text.replace(/(^|\n)((?:- .+(?:\n|$))+)/g, (match, prefix, block) => {
    const items = block
      .trim()
      .split('\n')
      .map((line) => `<li>${line.replace(/^- /, '')}</li>`)
      .join('')
    return `${prefix}<ul>${items}</ul>`
  })

  text = text.replace(/\n/g, '<br />')

  // 3. Thay placeholder bằng code block thật (đã escape sẵn từ bước 1)
  text = text.replace(/@@CODEBLOCK(\d+)@@/g, (match, i) => `<pre><code>${codeBlocks[Number(i)]}</code></pre>`)

  return text
}

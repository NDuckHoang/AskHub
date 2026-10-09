import { renderMarkdown } from '../utils/markdown'
import './MarkdownContent.css'

// Hiển thị nội dung câu hỏi/trả lời đã qua renderMarkdown (đậm, nghiêng, code, ảnh...)
function MarkdownContent({ text }) {
  // eslint-disable-next-line react/no-danger
  return <div className="markdown-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }} />
}

export default MarkdownContent

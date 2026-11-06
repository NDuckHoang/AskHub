// Rút gọn nội dung Markdown thành 1 đoạn chữ thường để làm mô tả ngắn (excerpt) trong danh sách.
// Chỉ cần "đủ dùng" cho hiển thị, không cần parse Markdown đầy đủ.
export function toExcerpt(markdown, maxLength = 160) {
  if (!markdown) return ''
  const text = markdown
    .replace(/<[^>]*>/g, ' ') // thẻ HTML (nội dung từ editor có thể là HTML)
    .replace(/```[\s\S]*?```/g, ' ') // khối code
    .replace(/`([^`]*)`/g, '$1') // code inline
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // ảnh
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // liên kết -> chỉ giữ chữ
    .replace(/[#>*_~-]+/g, ' ') // ký hiệu định dạng
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text
}

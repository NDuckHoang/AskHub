import { Atom, Braces, Coffee, Cpu, Database, GitBranch, Palette, Server, Shapes, Terminal, Folder } from 'lucide-react'

// Icon + tông màu nhạt cho từng danh mục, dùng chung ở chip trang chủ, CategoryPill, trang Danh mục.
// Khớp theo tên danh mục (không phân biệt hoa thường). Thứ tự quan trọng: "javascript" phải xét trước "java".
// Danh mục mới do Admin thêm mà không khớp quy tắc nào sẽ dùng icon thư mục, tông xám.
const CATEGORY_RULES = [
  { match: 'react', Icon: Atom, tone: 'blue' },
  { match: 'javascript', Icon: Braces, tone: 'yellow' },
  { match: 'node', Icon: Server, tone: 'green' },
  { match: 'java', Icon: Coffee, tone: 'orange' },
  { match: 'python', Icon: Terminal, tone: 'indigo' },
  { match: 'c/c++', Icon: Cpu, tone: 'gray' },
  { match: 'database', Icon: Database, tone: 'teal' },
  { match: 'sql', Icon: Database, tone: 'teal' },
  { match: 'html', Icon: Palette, tone: 'pink' },
  { match: 'css', Icon: Palette, tone: 'pink' },
  { match: 'git', Icon: GitBranch, tone: 'orange' },
  { match: 'khác', Icon: Shapes, tone: 'gray' },
]

export function getCategoryStyle(name) {
  const lower = (name || '').toLowerCase()
  const rule = CATEGORY_RULES.find((r) => lower.includes(r.match))
  return rule || { Icon: Folder, tone: 'gray' }
}

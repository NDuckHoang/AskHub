import { LayoutDashboard, Users, HelpCircle, MessageSquare, Folder, Flag } from 'lucide-react'

// Danh sách điều hướng của nhóm "Quản trị" - dùng chung cho AdminNavGroup (rail desktop)
// và Navbar (menu mobile), tách riêng file để không phá React Fast Refresh (file chỉ
// export component thì mới hot-reload được, xem cảnh báo oxlint react/only-export-components).
export const ADMIN_ITEMS = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/admin/users', end: false, icon: Users, label: 'Người dùng' },
  { to: '/admin/questions', end: false, icon: HelpCircle, label: 'Câu hỏi' },
  { to: '/admin/answers', end: false, icon: MessageSquare, label: 'Câu trả lời' },
  { to: '/admin/categories', end: false, icon: Folder, label: 'Danh mục' },
  { to: '/admin/reports', end: false, icon: Flag, label: 'Báo cáo', badge: true },
]

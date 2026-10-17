import AdminStatsPanel from '../components/AdminStatsPanel'
import AdminChartsPanel from '../components/AdminChartsPanel'
import './AdminPage.css'

// Trang /admin chỉ còn phần tổng quan (số liệu + biểu đồ). Các mục quản lý chi tiết
// (Người dùng/Câu hỏi/Câu trả lời/Danh mục/Báo cáo) đã chuyển sang route riêng,
// điều hướng qua nhóm "Quản trị" ở AppRail (xem AdminNavGroup.jsx).
function AdminPage() {
  return (
    <div className="container admin-page">
      <h1>Tổng quan quản trị</h1>
      <p className="admin-page-subtitle">Số liệu tổng hợp toàn hệ thống AskHub.</p>

      <AdminStatsPanel />
      <AdminChartsPanel />
    </div>
  )
}

export default AdminPage

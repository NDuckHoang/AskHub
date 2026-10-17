import AdminReportsPanel from '../components/AdminReportsPanel'
import './AdminPage.css'

function AdminReportsPage() {
  return (
    <div className="container admin-page">
      <h1>Báo cáo vi phạm</h1>
      <p className="admin-page-subtitle">Xem và xử lý các báo cáo được gửi từ người dùng.</p>

      <AdminReportsPanel />
    </div>
  )
}

export default AdminReportsPage

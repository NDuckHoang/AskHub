import AdminUsersPanel from '../components/AdminUsersPanel'
import './AdminPage.css'

function AdminUsersPage() {
  return (
    <div className="container admin-page">
      <h1>Quản lý người dùng</h1>
      <p className="admin-page-subtitle">Tìm kiếm, khóa/mở khóa, thăng/hạ quyền Admin hoặc xóa tài khoản người dùng.</p>

      <AdminUsersPanel />
    </div>
  )
}

export default AdminUsersPage

import AdminCategoriesPanel from '../components/AdminCategoriesPanel'
import './AdminPage.css'

function AdminCategoriesPage() {
  return (
    <div className="container admin-page">
      <h1>Quản lý danh mục</h1>
      <p className="admin-page-subtitle">Thêm, sửa hoặc xóa danh mục câu hỏi.</p>

      <AdminCategoriesPanel />
    </div>
  )
}

export default AdminCategoriesPage

import AdminAnswersPanel from '../components/AdminAnswersPanel'
import './AdminPage.css'

function AdminAnswersPage() {
  return (
    <div className="container admin-page">
      <h1>Quản lý câu trả lời</h1>
      <p className="admin-page-subtitle">Tìm kiếm và xóa câu trả lời vi phạm hoặc không phù hợp.</p>

      <AdminAnswersPanel />
    </div>
  )
}

export default AdminAnswersPage

import AdminQuestionsPanel from '../components/AdminQuestionsPanel'
import './AdminPage.css'

function AdminQuestionsPage() {
  return (
    <div className="container admin-page">
      <h1>Quản lý câu hỏi</h1>
      <p className="admin-page-subtitle">Tìm kiếm và xóa câu hỏi vi phạm hoặc không phù hợp.</p>

      <AdminQuestionsPanel />
    </div>
  )
}

export default AdminQuestionsPage

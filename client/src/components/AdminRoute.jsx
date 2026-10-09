import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Giống ProtectedRoute nhưng bắt buộc thêm role ADMIN. Backend vẫn là nơi kiểm tra
// quyền thật sự (adminMiddleware) - cái này chỉ tránh cho user thường thấy trang vỡ giao diện.
function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />

  return children
}

export default AdminRoute

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Bọc quanh route cần đăng nhập. Chưa đăng nhập -> chuyển sang /login (theo mục 9 CLAUDE.md)
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  return children
}

export default ProtectedRoute

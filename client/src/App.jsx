import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import QuestionsPage from './pages/QuestionsPage'
import CategoriesPage from './pages/CategoriesPage'
import SearchPage from './pages/SearchPage'
import UserProfilePage from './pages/UserProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import AdminPage from './pages/AdminPage'
import QuestionDetailPage from './pages/QuestionDetailPage'
import AskPage from './pages/AskPage'
import EditQuestionPage from './pages/EditQuestionPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PagePlaceholder from './components/PagePlaceholder'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/questions/:id" element={<QuestionDetailPage />} />
        <Route
          path="/questions/:id/edit"
          element={
            <ProtectedRoute>
              <EditQuestionPage />
            </ProtectedRoute>
          }
        />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/users/:id" element={<UserProfilePage />} />
        <Route
          path="/users/:id/edit"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route
          path="/ask"
          element={
            <ProtectedRoute>
              <AskPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<PagePlaceholder title="Không tìm thấy trang" />} />
      </Route>
    </Routes>
  )
}

export default App

import { createContext, useEffect, useState } from 'react'
import * as authService from '../services/authService'
import { getToken, saveToken, clearToken } from '../utils/tokenStorage'

export const AuthContext = createContext(null)

// Quản lý trạng thái đăng nhập cho toàn bộ app.
// Token lưu ở localStorage hoặc sessionStorage tùy "Ghi nhớ đăng nhập" (xem utils/tokenStorage.js),
// user hiện tại lưu trong state (context).
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Khi app vừa load, nếu đã có token từ lần trước thì gọi /auth/me để lấy lại user
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }

    authService
      .getMe()
      .then((data) => setUser(data.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  // remember: true -> nhớ đăng nhập lâu dài; false -> chỉ trong phiên trình duyệt hiện tại
  async function login(email, password, remember) {
    const data = await authService.login({ email, password, remember })
    saveToken(data.token, remember)
    setUser(data.user)
    return data.user
  }

  async function register(username, email, password, securityQuestion, securityAnswer) {
    return authService.register({
      username,
      email,
      password,
      security_question: securityQuestion,
      security_answer: securityAnswer,
    })
  }

  function logout() {
    clearToken()
    setUser(null)
  }

  // Cập nhật user hiện tại trong state (vd sau khi sửa hồ sơ), không cần đăng nhập lại
  function updateUser(partialUser) {
    setUser((prev) => ({ ...prev, ...partialUser }))
  }

  const value = { user, loading, login, register, logout, updateUser }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

import { createContext, useEffect, useState } from 'react'
import * as authService from '../services/authService'

export const AuthContext = createContext(null)

// Quản lý trạng thái đăng nhập cho toàn bộ app.
// Token lưu ở localStorage, user hiện tại lưu trong state (context).
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Khi app vừa load, nếu đã có token từ lần trước thì gọi /auth/me để lấy lại user
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    authService
      .getMe()
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const data = await authService.login({ email, password })
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data.user
  }

  async function register(username, email, password) {
    return authService.register({ username, email, password })
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
  }

  // Cập nhật user hiện tại trong state (vd sau khi sửa hồ sơ), không cần đăng nhập lại
  function updateUser(partialUser) {
    setUser((prev) => ({ ...prev, ...partialUser }))
  }

  const value = { user, loading, login, register, logout, updateUser }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

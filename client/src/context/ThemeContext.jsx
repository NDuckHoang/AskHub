import { createContext, useEffect, useState } from 'react'

export const ThemeContext = createContext(null)

const STORAGE_KEY = 'askhub-theme'

function getInitialTheme() {
  // index.html đã đặt data-theme trước khi React chạy (tránh nháy sáng/tối),
  // đọc lại từ đó để state khớp với những gì đang hiển thị trên màn hình
  if (typeof document !== 'undefined') {
    const current = document.documentElement.getAttribute('data-theme')
    if (current === 'dark' || current === 'light') return current
  }
  return 'light'
}

// Quản lý theme sáng/tối cho toàn bộ app, lưu lựa chọn vào localStorage
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // localStorage có thể bị chặn (chế độ ẩn danh...), bỏ qua lặng lẽ
    }
  }, [theme])

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

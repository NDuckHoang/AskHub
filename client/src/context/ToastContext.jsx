import { createContext, useCallback, useState } from 'react'

export const ToastContext = createContext(null)

let nextToastId = 1

// Thông báo nhỏ góc màn hình (vd "Đăng câu hỏi thành công") - tự biến mất sau vài giây,
// thay cho window.alert(). type: 'success' | 'error'
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message, type = 'success') => {
      const id = nextToastId++
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => removeToast(id), 3000)
    },
    [removeToast]
  )

  const value = { toasts, showToast, removeToast }

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

import { useContext } from 'react'
import { ToastContext } from '../context/ToastContext'

// Trả về hàm showToast(message, type) để gọi ở bất kỳ component nào
export function useToast() {
  return useContext(ToastContext).showToast
}

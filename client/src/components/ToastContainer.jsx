import { useContext } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { ToastContext } from '../context/ToastContext'
import './ToastContainer.css'

// Render 1 lần duy nhất ở App.jsx - hiển thị toàn bộ toast đang có từ ToastContext
function ToastContainer() {
  const { toasts, removeToast } = useContext(ToastContext)

  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type} animate-fade-in-up`}
          onClick={() => removeToast(t.id)}
        >
          {t.type === 'error' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}

export default ToastContainer

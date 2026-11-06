import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import './Modal.css'

// Dialog popup dùng chung: nền mờ phía sau, đóng khi bấm X / click nền / nhấn Esc.
// Vẽ qua portal vào <body> để luôn căn giữa theo viewport - nếu nằm trong 1 phần tử cha có
// transform/animation (card nâng khi hover, hiệu ứng xuất hiện...), position: fixed sẽ bị neo theo cha đó.
// Tùy chọn: icon (đặt trong vòng tròn cạnh tiêu đề), subtitle (1 dòng mô tả), size="lg" (rộng hơn) | "sm" (hẹp, cho popup đơn giản).
function Modal({ title, subtitle, icon, size, onClose, children }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return createPortal(
    <div
      className="modal-overlay animate-fade-in"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`modal-panel card animate-scale-in${size ? ` modal-panel-${size}` : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-header">
          {icon && <span className="modal-header-icon">{icon}</span>}
          <div className="modal-header-text">
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

export default Modal

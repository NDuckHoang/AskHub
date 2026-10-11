import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import './PasswordInput.css'

// Input mật khẩu dùng chung, có nút con mắt để hiện/ẩn mật khẩu đang gõ
function PasswordInput({ id, className = '', ...rest }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="password-input-wrap">
      <input id={id} type={visible ? 'text' : 'password'} className={`input ${className}`} {...rest} />
      <button
        type="button"
        className="password-input-toggle"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}

export default PasswordInput

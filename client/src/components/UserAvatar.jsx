import { useState } from 'react'
import './UserAvatar.css'

// Hiển thị ảnh avatar nếu có, không thì hiển thị chữ cái đầu của username.
// Ảnh tải lỗi (vd file trong /uploads đã bị xóa) cũng quay về chữ cái đầu,
// thay vì hiện icon ảnh vỡ + chữ alt tràn ra ngoài.
function UserAvatar({ username, avatar, size = 28 }) {
  const [failedSrc, setFailedSrc] = useState(null)
  const style = { width: size, height: size, fontSize: Math.round(size * 0.45) }

  if (avatar && failedSrc !== avatar) {
    return (
      <img
        className="user-avatar"
        style={style}
        src={avatar}
        alt={username}
        onError={() => setFailedSrc(avatar)}
      />
    )
  }

  const initial = username ? username.trim().charAt(0).toUpperCase() : '?'
  return (
    <span className="user-avatar user-avatar-fallback" style={style}>
      {initial}
    </span>
  )
}

export default UserAvatar

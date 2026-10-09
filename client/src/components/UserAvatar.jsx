import './UserAvatar.css'

// Hiển thị ảnh avatar nếu có, không thì hiển thị chữ cái đầu của username
function UserAvatar({ username, avatar, size = 28 }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.45) }

  if (avatar) {
    return <img className="user-avatar" style={style} src={avatar} alt={username} />
  }

  const initial = username ? username.trim().charAt(0).toUpperCase() : '?'
  return (
    <span className="user-avatar user-avatar-fallback" style={style}>
      {initial}
    </span>
  )
}

export default UserAvatar

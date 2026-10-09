const { verifyToken } = require('../utils/jwt');
const { findById } = require('../models/userModel');

// Kiểm tra JWT trong header "Authorization: Bearer <token>"
// Nếu hợp lệ, gắn thông tin user (không có password) vào req.user
async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = verifyToken(token);
    const user = await findById(payload.id);

    if (!user) {
      return res.status(401).json({ message: 'Người dùng không còn tồn tại' });
    }
    if (user.status === 'BLOCKED') {
      return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

module.exports = authMiddleware;

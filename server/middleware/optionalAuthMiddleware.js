const { verifyToken } = require('../utils/jwt');
const { findById } = require('../models/userModel');

// Giống authMiddleware nhưng KHÔNG chặn request nếu chưa đăng nhập/token sai.
// Dùng cho các route public nhưng muốn biết thêm "user hiện tại là ai" nếu có
// (ví dụ: biết user đã vote câu hỏi này chưa để hiển thị đúng trạng thái nút vote).
async function optionalAuthMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next();
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = verifyToken(token);
    const user = await findById(payload.id);
    if (user && user.status !== 'BLOCKED') {
      req.user = user;
    }
  } catch (error) {
    // Token không hợp lệ -> coi như chưa đăng nhập, không chặn request
  }

  next();
}

module.exports = optionalAuthMiddleware;

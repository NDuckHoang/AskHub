const jwt = require('jsonwebtoken');

// Tạo JWT chứa id và role của user, dùng để xác thực ở các request sau.
// expiresIn: thời hạn token (vd '30d' khi chọn "Ghi nhớ đăng nhập"), mặc định lấy JWT_EXPIRES_IN trong .env
function signToken(user, expiresIn = process.env.JWT_EXPIRES_IN) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signToken, verifyToken };

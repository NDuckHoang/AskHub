// Phải dùng SAU authMiddleware, vì cần req.user đã được gắn sẵn
function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Chỉ Admin mới có quyền thực hiện hành động này' });
  }
  next();
}

module.exports = adminMiddleware;

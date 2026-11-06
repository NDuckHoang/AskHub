// Tài khoản quản trị gốc (root admin): quyền cao nhất, KHÔNG ai được khóa, xóa hay hạ quyền.
// Nhận diện bằng email, cấu hình qua biến ROOT_ADMIN_EMAIL trong .env
// (mặc định là tài khoản admin có sẵn trong dữ liệu mẫu schema.sql).
// Các Admin được thăng quyền sau này KHÔNG phải admin gốc - vẫn có thể bị khóa/xóa/hạ quyền.
const ROOT_ADMIN_EMAIL = (process.env.ROOT_ADMIN_EMAIL || 'admin@askhub.vn').trim().toLowerCase();

function isRootAdmin(user) {
  return Boolean(user && user.email && user.email.trim().toLowerCase() === ROOT_ADMIN_EMAIL);
}

module.exports = { isRootAdmin };

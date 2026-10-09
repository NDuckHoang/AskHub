const multer = require('multer');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Lưu file vào RAM (req.file.buffer) thay vì ổ đĩa - cần thiết vì Vercel serverless
// không có ổ đĩa ghi được lâu dài. File sẽ được đẩy lên Vercel Blob ở controller.
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, gif, webp)'));
  }
  cb(null, true);
}

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });

module.exports = upload;

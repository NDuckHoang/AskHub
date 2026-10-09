const { put } = require('@vercel/blob');
const crypto = require('crypto');
const path = require('path');

async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'Vui lòng chọn file ảnh' });
  }
  try {
    // Backend chạy serverless (Vercel) không có ổ đĩa lưu lâu dài -> đẩy file lên
    // Vercel Blob, trả về URL tuyệt đối công khai để frontend hiển thị trực tiếp
    const randomName = crypto.randomBytes(16).toString('hex');
    const blob = await put(`${randomName}${path.extname(req.file.originalname)}`, req.file.buffer, {
      access: 'public',
      contentType: req.file.mimetype,
    });
    res.status(201).json({ url: blob.url });
  } catch (error) {
    console.error('Upload ảnh lên Vercel Blob thất bại:', error);
    res.status(500).json({ message: 'Upload ảnh thất bại, vui lòng thử lại' });
  }
}

module.exports = { uploadImage };

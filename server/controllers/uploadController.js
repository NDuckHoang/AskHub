function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'Vui lòng chọn file ảnh' });
  }
  // File đã được lưu vào server/uploads, serve tĩnh qua /uploads/<tên file>
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
}

module.exports = { uploadImage };

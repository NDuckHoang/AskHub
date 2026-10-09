function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'Vui lòng chọn file ảnh' });
  }
  // Trả về URL tuyệt đối (không phải "/uploads/...") vì khi deploy, frontend (Vercel)
  // và backend (Railway...) nằm ở 2 domain khác nhau - URL tương đối sẽ bị trình duyệt
  // hiểu nhầm là thuộc domain của frontend và báo lỗi 404
  res.status(201).json({ url: `${process.env.SERVER_URL}/uploads/${req.file.filename}` });
}

module.exports = { uploadImage };

const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadImage } = require('../controllers/uploadController');

const router = express.Router();

// Bọc multer để trả lỗi dễ hiểu (sai định dạng, quá dung lượng) thay vì rơi vào error handler chung
function handleUpload(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Upload ảnh thất bại' });
    }
    next();
  });
}

router.post('/image', authMiddleware, handleUpload, uploadImage);

module.exports = router;

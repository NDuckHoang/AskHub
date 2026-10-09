const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { createReport } = require('../controllers/reportController');

const router = express.Router();

// Phải đăng nhập mới được báo cáo nội dung
router.post('/', authMiddleware, createReport);

module.exports = router;

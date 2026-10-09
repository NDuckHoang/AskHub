const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const answerRoutes = require('./routes/answerRoutes');
const commentRoutes = require('./routes/commentRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const tagRoutes = require('./routes/tagRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// ===== Middleware chung =====
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json()); // đọc body dạng JSON

// ===== Route kiểm tra tình trạng server + database =====
app.get('/api/health', async (req, res) => {
  try {
    await testConnection();
    res.json({ server: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ server: 'ok', database: 'error', message: error.message });
  }
});

// ===== Route auth: register, login, me =====
app.use('/api/auth', authRoutes);

// ===== Route questions (kèm answers/vote lồng trong /api/questions/:id) =====
app.use('/api/questions', questionRoutes);

// ===== Route answers (sửa/xóa/vote theo id câu trả lời) =====
app.use('/api/answers', answerRoutes);

// ===== Route comments =====
app.use('/api/comments', commentRoutes);

// ===== Route categories (search dùng chung GET /api/questions?q=...) =====
app.use('/api/categories', categoryRoutes);

// ===== Route tags (hiện tại chỉ dùng cho sidebar "Tag phổ biến") =====
app.use('/api/tags', tagRoutes);

// ===== Route upload ảnh (dùng trong form đăng câu hỏi) =====
app.use('/api/uploads', uploadRoutes);

// ===== Route users (trang hồ sơ) =====
app.use('/api/users', userRoutes);

// ===== Route admin (chỉ ADMIN, tự kiểm tra quyền trong adminRoutes) =====
app.use('/api/admin', adminRoutes);

// ===== Route report (user đã đăng nhập báo cáo nội dung vi phạm) =====
app.use('/api/reports', reportRoutes);

// ===== Route notifications (thông báo trả lời mới, chấp nhận, bình luận mới) =====
app.use('/api/notifications', notificationRoutes);

// ===== Route không tồn tại =====
app.use((req, res) => {
  res.status(404).json({ message: 'Không tìm thấy API' });
});

// ===== Xử lý lỗi chung =====
// Nếu controller ném lỗi mà không tự xử lý, Express sẽ chuyển xuống đây
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau' });
});

module.exports = app;

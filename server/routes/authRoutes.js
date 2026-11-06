const express = require('express');
const {
  register,
  login,
  me,
  getSecurityQuestions,
  getRecoveryQuestion,
  resetPasswordWithAnswer,
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);

// Quên mật khẩu bằng câu hỏi bảo mật (công khai, không cần đăng nhập)
router.get('/security-questions', getSecurityQuestions);
router.post('/forgot-password/question', getRecoveryQuestion);
router.post('/forgot-password/reset', resetPasswordWithAnswer);

module.exports = router;

const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getStats,
  getActivityStats,
  getUsers,
  updateUserStatus,
  deleteUser,
  deleteQuestion,
  getAnswers,
  deleteAnswer,
  getReports,
  resolveReport,
  exportUsers,
  exportQuestions,
  exportAnswers,
} = require('../controllers/adminController');

const router = express.Router();

// Mọi route trong file này đều bắt buộc: đã đăng nhập VÀ có role ADMIN
router.use(authMiddleware, adminMiddleware);

router.get('/stats', getStats);
router.get('/stats/activity', getActivityStats);

router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

router.delete('/questions/:id', deleteQuestion);

router.get('/answers', getAnswers);
router.delete('/answers/:id', deleteAnswer);

router.get('/reports', getReports);
router.put('/reports/:id/status', resolveReport);

router.get('/export/users', exportUsers);
router.get('/export/questions', exportQuestions);
router.get('/export/answers', exportAnswers);

module.exports = router;

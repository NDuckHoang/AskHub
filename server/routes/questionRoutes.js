const express = require('express');
const {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  toggleSaveQuestion,
  getSavedQuestions,
} = require('../controllers/questionController');
const { getAnswersForQuestion, createAnswer } = require('../controllers/answerController');
const { voteQuestion } = require('../controllers/voteController');
const authMiddleware = require('../middleware/authMiddleware');
const optionalAuthMiddleware = require('../middleware/optionalAuthMiddleware');

const router = express.Router();

router.get('/', getQuestions);
// Phải đặt trước "/:id" (route này chỉ khớp 1 đoạn), nếu không "saved" sẽ bị hiểu nhầm là 1 id
router.get('/saved', authMiddleware, getSavedQuestions);
router.get('/:id', optionalAuthMiddleware, getQuestionById);
router.post('/', authMiddleware, createQuestion);
router.put('/:id', authMiddleware, updateQuestion);
router.delete('/:id', authMiddleware, deleteQuestion);

router.get('/:id/answers', optionalAuthMiddleware, getAnswersForQuestion);
router.post('/:id/answers', authMiddleware, createAnswer);
router.post('/:id/vote', authMiddleware, voteQuestion);
router.post('/:id/save', authMiddleware, toggleSaveQuestion);

module.exports = router;

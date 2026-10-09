const express = require('express');
const { updateAnswer, deleteAnswer } = require('../controllers/answerController');
const { voteAnswer } = require('../controllers/voteController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.put('/:id', authMiddleware, updateAnswer);
router.delete('/:id', authMiddleware, deleteAnswer);
router.post('/:id/vote', authMiddleware, voteAnswer);

module.exports = router;

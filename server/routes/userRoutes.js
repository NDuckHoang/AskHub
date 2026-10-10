const express = require('express');
const { getLeaderboard, getUserProfile, getUserAnswers, updateProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Phải đứng trước "/:id" để không bị route :id "nuốt" mất (vd id="leaderboard")
router.get('/leaderboard', getLeaderboard);
router.get('/:id', getUserProfile);
router.get('/:id/answers', getUserAnswers);
router.put('/:id', authMiddleware, updateProfile);

module.exports = router;

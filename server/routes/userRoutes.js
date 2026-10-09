const express = require('express');
const { getUserProfile, getUserAnswers, updateProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:id', getUserProfile);
router.get('/:id/answers', getUserAnswers);
router.put('/:id', authMiddleware, updateProfile);

module.exports = router;

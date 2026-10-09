const express = require('express');
const { createComment, deleteComment } = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createComment);
router.delete('/:id', authMiddleware, deleteComment);

module.exports = router;

const express = require('express');
const { getPopularTags } = require('../controllers/tagController');

const router = express.Router();

router.get('/popular', getPopularTags);

module.exports = router;

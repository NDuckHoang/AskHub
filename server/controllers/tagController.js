const tagModel = require('../models/tagModel');

async function getPopularTags(req, res) {
  const limit = Number(req.query.limit) || 10;
  const tags = await tagModel.findPopular(limit);
  res.json({ tags });
}

module.exports = { getPopularTags };

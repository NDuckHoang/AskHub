const questionModel = require('../models/questionModel');
const categoryModel = require('../models/categoryModel');
const tagModel = require('../models/tagModel');
const commentModel = require('../models/commentModel');
const voteModel = require('../models/voteModel');
const savedQuestionModel = require('../models/savedQuestionModel');

const SORT_VALUES = ['newest', 'votes', 'answers', 'unanswered'];
const MAX_LIMIT = 50;

function parsePagination(query) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);
  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = 10;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;
  return { page, limit };
}

function parseId(rawId) {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function attachTags(questions, tagsMap) {
  return questions.map((q) => ({ ...q, tags: tagsMap[q.id] || [] }));
}

// Kiểm tra dữ liệu đầu vào khi tạo/sửa câu hỏi, trả về chuỗi lỗi hoặc null nếu hợp lệ
function validateQuestionInput(body) {
  const { title, content, category_id, tags } = body;

  if (!title || title.trim().length < 10 || title.trim().length > 255) {
    return 'Tiêu đề phải có từ 10 đến 255 ký tự';
  }
  if (!content || content.trim().length < 20) {
    return 'Nội dung phải có ít nhất 20 ký tự';
  }
  if (!category_id) {
    return 'Vui lòng chọn danh mục';
  }
  if (!Array.isArray(tags) || tags.length === 0) {
    return 'Vui lòng nhập ít nhất 1 tag';
  }
  if (tags.length > 5) {
    return 'Chỉ được nhập tối đa 5 tag';
  }
  for (const tag of tags) {
    if (typeof tag !== 'string' || tag.trim().length === 0 || tag.trim().length > 30) {
      return 'Tag không hợp lệ';
    }
  }
  return null;
}

async function getQuestions(req, res) {
  const { category_id, tag_id, user_id, sort } = req.query;
  const { page, limit } = parsePagination(req.query);
  const sortValue = SORT_VALUES.includes(sort) ? sort : 'newest';

  const categoryId = category_id ? Number(category_id) : undefined;
  const tagId = tag_id ? Number(tag_id) : undefined;
  const userId = user_id ? Number(user_id) : undefined;
  const keyword = req.query.q ? req.query.q.trim() : undefined;
  const daysAgo = req.query.days ? Number(req.query.days) : undefined;

  const { questions, total } = await questionModel.findAll({
    categoryId,
    tagId,
    userId,
    sort: sortValue,
    page,
    limit,
    keyword,
    daysAgo,
  });

  const tagsMap = await tagModel.getTagsForQuestions(questions.map((q) => q.id));

  res.json({
    questions: attachTags(questions, tagsMap),
    keyword: keyword || null,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
}

async function getQuestionById(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'id không hợp lệ' });
  }

  const question = await questionModel.findById(id);
  if (!question) {
    return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
  }

  await questionModel.incrementViews(id);
  const tagsMap = await tagModel.getTagsForQuestions([id]);
  const commentsMap = await commentModel.getForQuestions([id]);
  const myVote = req.user ? await voteModel.getUserVoteForQuestion(req.user.id, id) : 0;
  const isSaved = req.user ? await savedQuestionModel.isSaved(req.user.id, id) : false;

  res.json({
    question: {
      ...question,
      views: question.views + 1,
      tags: tagsMap[id] || [],
      comments: commentsMap[id] || [],
      my_vote: myVote,
      is_saved: isSaved,
    },
  });
}

async function createQuestion(req, res) {
  const error = validateQuestionInput(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const { title, content, category_id, tags } = req.body;

  const category = await categoryModel.findById(category_id);
  if (!category) {
    return res.status(400).json({ message: 'Danh mục không tồn tại' });
  }

  const questionId = await questionModel.create({
    userId: req.user.id,
    categoryId: category_id,
    title: title.trim(),
    content: content.trim(),
  });

  const tagIds = await tagModel.findOrCreateByNames(tags);
  await questionModel.setTags(questionId, tagIds);

  const question = await questionModel.findById(questionId);
  const tagsMap = await tagModel.getTagsForQuestions([questionId]);

  res.status(201).json({
    message: 'Đăng câu hỏi thành công',
    question: { ...question, tags: tagsMap[questionId] || [] },
  });
}

async function updateQuestion(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'id không hợp lệ' });
  }

  const question = await questionModel.findById(id);
  if (!question) {
    return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
  }
  if (question.user_id !== req.user.id) {
    return res.status(403).json({ message: 'Bạn không có quyền sửa câu hỏi này' });
  }

  const error = validateQuestionInput(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const { title, content, category_id, tags } = req.body;
  const category = await categoryModel.findById(category_id);
  if (!category) {
    return res.status(400).json({ message: 'Danh mục không tồn tại' });
  }

  await questionModel.update(id, {
    categoryId: category_id,
    title: title.trim(),
    content: content.trim(),
  });

  const tagIds = await tagModel.findOrCreateByNames(tags);
  await questionModel.setTags(id, tagIds);

  const updated = await questionModel.findById(id);
  const tagsMap = await tagModel.getTagsForQuestions([id]);

  res.json({
    message: 'Cập nhật câu hỏi thành công',
    question: { ...updated, tags: tagsMap[id] || [] },
  });
}

async function deleteQuestion(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'id không hợp lệ' });
  }

  const question = await questionModel.findById(id);
  if (!question) {
    return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
  }

  const isOwner = question.user_id === req.user.id;
  const isAdmin = req.user.role === 'ADMIN';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Bạn không có quyền xóa câu hỏi này' });
  }

  await questionModel.remove(id);
  res.json({ message: 'Đã xóa câu hỏi' });
}

// Bật/tắt lưu câu hỏi cho user hiện tại
async function toggleSaveQuestion(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'id không hợp lệ' });
  }

  const question = await questionModel.findById(id);
  if (!question) {
    return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
  }

  const saved = await savedQuestionModel.toggle(req.user.id, id);
  res.json({ message: saved ? 'Đã lưu câu hỏi' : 'Đã bỏ lưu câu hỏi', saved });
}

// Danh sách câu hỏi user hiện tại đã lưu
async function getSavedQuestions(req, res) {
  const { page, limit } = parsePagination(req.query);
  const { questions, total } = await savedQuestionModel.findByUserId(req.user.id, { page, limit });
  const tagsMap = await tagModel.getTagsForQuestions(questions.map((q) => q.id));

  res.json({
    questions: attachTags(questions, tagsMap),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  });
}

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  toggleSaveQuestion,
  getSavedQuestions,
};

const commentModel = require('../models/commentModel');
const questionModel = require('../models/questionModel');
const answerModel = require('../models/answerModel');
const notificationModel = require('../models/notificationModel');

function validateContent(content) {
  if (!content || content.trim().length === 0 || content.trim().length > 1000) {
    return 'Bình luận phải có từ 1 đến 1000 ký tự';
  }
  return null;
}

async function createComment(req, res) {
  const { question_id, answer_id, content } = req.body;

  if (!question_id && !answer_id) {
    return res.status(400).json({ message: 'Phải chọn question_id hoặc answer_id' });
  }
  if (question_id && answer_id) {
    return res.status(400).json({ message: 'Chỉ được chọn question_id hoặc answer_id, không phải cả hai' });
  }

  const error = validateContent(content);
  if (error) {
    return res.status(400).json({ message: error });
  }

  let targetOwnerId;
  let questionIdForNotif;

  if (question_id) {
    const question = await questionModel.findById(question_id);
    if (!question) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
    }
    targetOwnerId = question.user_id;
    questionIdForNotif = question.id;
  } else {
    const answer = await answerModel.findById(answer_id);
    if (!answer) {
      return res.status(404).json({ message: 'Không tìm thấy câu trả lời' });
    }
    targetOwnerId = answer.user_id;
    questionIdForNotif = answer.question_id;
  }

  const commentId = await commentModel.create({
    userId: req.user.id,
    questionId: question_id || null,
    answerId: answer_id || null,
    content: content.trim(),
  });

  await notificationModel.create({
    userId: targetOwnerId,
    actorId: req.user.id,
    type: 'NEW_COMMENT',
    questionId: questionIdForNotif,
  });

  const comment = await commentModel.findById(commentId);
  res.status(201).json({ message: 'Đã bình luận', comment });
}

async function deleteComment(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'id không hợp lệ' });
  }

  const comment = await commentModel.findById(id);
  if (!comment) {
    return res.status(404).json({ message: 'Không tìm thấy bình luận' });
  }

  const isOwner = comment.user_id === req.user.id;
  const isAdmin = req.user.role === 'ADMIN';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Bạn không có quyền xóa bình luận này' });
  }

  await commentModel.remove(id);
  res.json({ message: 'Đã xóa bình luận' });
}

module.exports = { createComment, deleteComment };

const answerModel = require('../models/answerModel');
const questionModel = require('../models/questionModel');
const commentModel = require('../models/commentModel');
const voteModel = require('../models/voteModel');
const notificationModel = require('../models/notificationModel');
const userModel = require('../models/userModel');
const { REPUTATION } = require('../utils/reputationPoints');

function parseId(rawId) {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateContent(content) {
  if (!content || content.trim().length < 10) {
    return 'Nội dung câu trả lời phải có ít nhất 10 ký tự';
  }
  return null;
}

async function attachComments(answers) {
  const commentsMap = await commentModel.getForAnswers(answers.map((a) => a.id));
  return answers.map((a) => ({ ...a, comments: commentsMap[a.id] || [] }));
}

async function getAnswersForQuestion(req, res) {
  const questionId = parseId(req.params.id);
  if (!questionId) {
    return res.status(400).json({ message: 'id câu hỏi không hợp lệ' });
  }

  const question = await questionModel.findById(questionId);
  if (!question) {
    return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
  }

  const answers = await answerModel.findByQuestionId(questionId);
  const withComments = await attachComments(answers);

  const voteMap = req.user
    ? await voteModel.getUserVotesForAnswers(req.user.id, answers.map((a) => a.id))
    : {};
  const withVotes = withComments.map((a) => ({ ...a, my_vote: voteMap[a.id] || 0 }));

  res.json({ answers: withVotes });
}

async function createAnswer(req, res) {
  const questionId = parseId(req.params.id);
  if (!questionId) {
    return res.status(400).json({ message: 'id câu hỏi không hợp lệ' });
  }

  const question = await questionModel.findById(questionId);
  if (!question) {
    return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
  }

  const error = validateContent(req.body.content);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const answerId = await answerModel.create({
    questionId,
    userId: req.user.id,
    content: req.body.content.trim(),
  });

  await notificationModel.create({
    userId: question.user_id,
    actorId: req.user.id,
    type: 'NEW_ANSWER',
    questionId,
  });

  const answer = await answerModel.findById(answerId);
  res.status(201).json({ message: 'Trả lời thành công', answer: { ...answer, comments: [] } });
}

// PUT /api/answers/:id dùng chung cho 2 việc (tùy body gửi lên):
// - { content }     -> chủ câu trả lời sửa nội dung
// - { is_accepted } -> chủ câu hỏi đánh dấu/bỏ đánh dấu câu trả lời đúng
async function updateAnswer(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'id không hợp lệ' });
  }

  const answer = await answerModel.findById(id);
  if (!answer) {
    return res.status(404).json({ message: 'Không tìm thấy câu trả lời' });
  }

  const { content, is_accepted } = req.body;
  if (content === undefined && is_accepted === undefined) {
    return res.status(400).json({ message: 'Không có dữ liệu để cập nhật' });
  }

  if (content !== undefined) {
    if (answer.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền sửa câu trả lời này' });
    }
    const error = validateContent(content);
    if (error) {
      return res.status(400).json({ message: error });
    }
    await answerModel.updateContent(id, content.trim());
  }

  if (is_accepted !== undefined) {
    const questionOwnerId = await questionModel.getOwnerId(answer.question_id);
    if (questionOwnerId !== req.user.id) {
      return res.status(403).json({ message: 'Chỉ chủ câu hỏi mới có quyền chấp nhận câu trả lời' });
    }

    const wasAccepted = Boolean(answer.is_accepted);
    const willAccept = Boolean(is_accepted);

    if (willAccept && !wasAccepted) {
      // Nếu câu hỏi đang có câu trả lời khác được chấp nhận, đổi sang câu này
      // thì phải trừ lại điểm của câu trả lời cũ trước
      const previousAccepted = await answerModel.findAcceptedByQuestionId(answer.question_id);
      if (previousAccepted && previousAccepted.id !== id) {
        await userModel.adjustReputation(previousAccepted.user_id, -REPUTATION.ANSWER_ACCEPTED);
      }
      await userModel.adjustReputation(answer.user_id, REPUTATION.ANSWER_ACCEPTED);
    } else if (!willAccept && wasAccepted) {
      await userModel.adjustReputation(answer.user_id, -REPUTATION.ANSWER_ACCEPTED);
    }

    await answerModel.setAccepted(id, answer.question_id, willAccept);

    if (willAccept) {
      await notificationModel.create({
        userId: answer.user_id,
        actorId: req.user.id,
        type: 'ANSWER_ACCEPTED',
        questionId: answer.question_id,
      });
    }
  }

  const updated = await answerModel.findById(id);
  res.json({ message: 'Cập nhật câu trả lời thành công', answer: updated });
}

async function deleteAnswer(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'id không hợp lệ' });
  }

  const answer = await answerModel.findById(id);
  if (!answer) {
    return res.status(404).json({ message: 'Không tìm thấy câu trả lời' });
  }

  const isOwner = answer.user_id === req.user.id;
  const isAdmin = req.user.role === 'ADMIN';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Bạn không có quyền xóa câu trả lời này' });
  }

  await answerModel.remove(id);
  res.json({ message: 'Đã xóa câu trả lời' });
}

module.exports = { getAnswersForQuestion, createAnswer, updateAnswer, deleteAnswer };

const voteModel = require('../models/voteModel');
const questionModel = require('../models/questionModel');
const answerModel = require('../models/answerModel');

function parseId(rawId) {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseVoteType(value) {
  const voteType = Number(value);
  return voteType === 1 || voteType === -1 ? voteType : null;
}

// Bấm vote lần đầu -> tạo vote mới
// Bấm lại đúng loại vote cũ -> hủy vote (toggle off)
// Bấm loại vote khác -> đổi chiều vote
async function castVote({ userId, questionId, answerId, voteType }) {
  const existing = await voteModel.findVote({ userId, questionId, answerId });

  let myVote = voteType;
  if (!existing) {
    await voteModel.insertVote({ userId, questionId, answerId, voteType });
  } else if (existing.vote_type === voteType) {
    await voteModel.removeVote(existing.id);
    myVote = 0;
  } else {
    await voteModel.updateVoteType(existing.id, voteType);
  }

  const voteCount = await voteModel.getVoteCount({ questionId, answerId });
  return { voteCount, myVote };
}

async function voteQuestion(req, res) {
  const questionId = parseId(req.params.id);
  if (!questionId) {
    return res.status(400).json({ message: 'id không hợp lệ' });
  }

  const voteType = parseVoteType(req.body.vote_type);
  if (!voteType) {
    return res.status(400).json({ message: 'vote_type phải là 1 (upvote) hoặc -1 (downvote)' });
  }

  const question = await questionModel.findById(questionId);
  if (!question) {
    return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
  }

  const result = await castVote({ userId: req.user.id, questionId, answerId: null, voteType });
  res.json({ message: 'Đã ghi nhận vote', ...result });
}

async function voteAnswer(req, res) {
  const answerId = parseId(req.params.id);
  if (!answerId) {
    return res.status(400).json({ message: 'id không hợp lệ' });
  }

  const voteType = parseVoteType(req.body.vote_type);
  if (!voteType) {
    return res.status(400).json({ message: 'vote_type phải là 1 (upvote) hoặc -1 (downvote)' });
  }

  const answer = await answerModel.findById(answerId);
  if (!answer) {
    return res.status(404).json({ message: 'Không tìm thấy câu trả lời' });
  }

  const result = await castVote({ userId: req.user.id, questionId: null, answerId, voteType });
  res.json({ message: 'Đã ghi nhận vote', ...result });
}

module.exports = { voteQuestion, voteAnswer };

const voteModel = require('../models/voteModel');
const questionModel = require('../models/questionModel');
const answerModel = require('../models/answerModel');
const userModel = require('../models/userModel');
const { REPUTATION, pointsForVoteType } = require('../utils/reputationPoints');

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
// ownerId + pointsConfig: dùng để cộng/trừ điểm uy tín cho người đăng nội dung
// theo đúng CHÊNH LỆCH giữa vote cũ và vote mới (vd đổi từ downvote sang upvote
// phải cộng đủ cả phần bù trừ downvote lẫn phần thưởng upvote)
async function castVote({ userId, questionId, answerId, voteType, ownerId, pointsConfig }) {
  const existing = await voteModel.findVote({ userId, questionId, answerId });
  const oldVoteType = existing ? existing.vote_type : 0;

  let myVote = voteType;
  if (!existing) {
    await voteModel.insertVote({ userId, questionId, answerId, voteType });
  } else if (existing.vote_type === voteType) {
    await voteModel.removeVote(existing.id);
    myVote = 0;
  } else {
    await voteModel.updateVoteType(existing.id, voteType);
  }

  const delta = pointsForVoteType(myVote, pointsConfig) - pointsForVoteType(oldVoteType, pointsConfig);
  await userModel.adjustReputation(ownerId, delta);

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
  if (question.user_id === req.user.id) {
    return res.status(400).json({ message: 'Không thể vote cho câu hỏi của chính mình' });
  }

  const result = await castVote({
    userId: req.user.id,
    questionId,
    answerId: null,
    voteType,
    ownerId: question.user_id,
    pointsConfig: { upvote: REPUTATION.QUESTION_UPVOTE, downvote: REPUTATION.QUESTION_DOWNVOTE },
  });
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
  if (answer.user_id === req.user.id) {
    return res.status(400).json({ message: 'Không thể vote cho câu trả lời của chính mình' });
  }

  const result = await castVote({
    userId: req.user.id,
    questionId: null,
    answerId,
    voteType,
    ownerId: answer.user_id,
    pointsConfig: { upvote: REPUTATION.ANSWER_UPVOTE, downvote: REPUTATION.ANSWER_DOWNVOTE },
  });
  res.json({ message: 'Đã ghi nhận vote', ...result });
}

module.exports = { voteQuestion, voteAnswer };

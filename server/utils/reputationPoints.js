// Quy tắc cộng/trừ điểm uy tín (reputation) cho AskHub.
// Điểm được cộng cho NGƯỜI ĐĂNG nội dung, không phải người bấm vote.
const REPUTATION = {
  QUESTION_UPVOTE: 5,
  QUESTION_DOWNVOTE: -2,
  ANSWER_UPVOTE: 10,
  ANSWER_DOWNVOTE: -2,
  ANSWER_ACCEPTED: 15,
};

// Quy đổi 1 vote_type (1 / -1 / 0) sang số điểm tương ứng, dùng để tính
// chênh lệch điểm khi user đổi vote (vd từ upvote sang downvote)
function pointsForVoteType(voteType, { upvote, downvote }) {
  if (voteType === 1) return upvote;
  if (voteType === -1) return downvote;
  return 0;
}

module.exports = { REPUTATION, pointsForVoteType };

const { pool } = require('../config/db');

// questionId và answerId: luôn chỉ truyền đúng 1 trong 2, còn lại là null/undefined
async function findVote({ userId, questionId, answerId }) {
  const column = questionId ? 'question_id' : 'answer_id';
  const targetId = questionId || answerId;
  const [rows] = await pool.query(
    `SELECT * FROM votes WHERE user_id = ? AND ${column} = ?`,
    [userId, targetId]
  );
  return rows[0];
}

async function insertVote({ userId, questionId, answerId, voteType }) {
  await pool.query(
    'INSERT INTO votes (user_id, question_id, answer_id, vote_type) VALUES (?, ?, ?, ?)',
    [userId, questionId || null, answerId || null, voteType]
  );
}

async function updateVoteType(id, voteType) {
  await pool.query('UPDATE votes SET vote_type = ? WHERE id = ?', [voteType, id]);
}

async function removeVote(id) {
  await pool.query('DELETE FROM votes WHERE id = ?', [id]);
}

async function getVoteCount({ questionId, answerId }) {
  const column = questionId ? 'question_id' : 'answer_id';
  const targetId = questionId || answerId;
  const [rows] = await pool.query(
    `SELECT CAST(COALESCE(SUM(vote_type), 0) AS SIGNED) AS total FROM votes WHERE ${column} = ?`,
    [targetId]
  );
  return rows[0].total;
}

// Vote của user hiện tại cho 1 câu hỏi, dùng để hiển thị đúng trạng thái nút vote
async function getUserVoteForQuestion(userId, questionId) {
  const vote = await findVote({ userId, questionId, answerId: null });
  return vote ? vote.vote_type : 0;
}

// Vote của user hiện tại cho nhiều câu trả lời 1 lần, trả về map { answer_id: vote_type }
async function getUserVotesForAnswers(userId, answerIds) {
  if (answerIds.length === 0) return {};
  const [rows] = await pool.query(
    'SELECT answer_id, vote_type FROM votes WHERE user_id = ? AND answer_id IN (?)',
    [userId, answerIds]
  );
  const map = {};
  for (const row of rows) {
    map[row.answer_id] = row.vote_type;
  }
  return map;
}

module.exports = {
  findVote,
  insertVote,
  updateVoteType,
  removeVote,
  getVoteCount,
  getUserVoteForQuestion,
  getUserVotesForAnswers,
};

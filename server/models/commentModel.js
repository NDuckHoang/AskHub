const { pool } = require('../config/db');

const BASE_SELECT = `
  SELECT
    c.id, c.user_id, u.username AS author_username, u.avatar AS author_avatar,
    c.question_id, c.answer_id, c.content, c.created_at
  FROM comments c
  JOIN users u ON u.id = c.user_id
`;

async function findById(id) {
  const [rows] = await pool.query(`${BASE_SELECT} WHERE c.id = ?`, [id]);
  return rows[0];
}

async function create({ userId, questionId, answerId, content }) {
  const [result] = await pool.query(
    'INSERT INTO comments (user_id, question_id, answer_id, content) VALUES (?, ?, ?, ?)',
    [userId, questionId, answerId, content]
  );
  return result.insertId;
}

async function remove(id) {
  await pool.query('DELETE FROM comments WHERE id = ?', [id]);
}

// Lấy comment của nhiều câu hỏi 1 lần, trả về map { question_id: [comment, ...] }
async function getForQuestions(questionIds) {
  if (questionIds.length === 0) return {};
  const [rows] = await pool.query(
    `${BASE_SELECT} WHERE c.question_id IN (?) ORDER BY c.created_at ASC`,
    [questionIds]
  );
  const map = {};
  for (const row of rows) {
    if (!map[row.question_id]) map[row.question_id] = [];
    map[row.question_id].push(row);
  }
  return map;
}

// Lấy comment của nhiều câu trả lời 1 lần, trả về map { answer_id: [comment, ...] }
async function getForAnswers(answerIds) {
  if (answerIds.length === 0) return {};
  const [rows] = await pool.query(
    `${BASE_SELECT} WHERE c.answer_id IN (?) ORDER BY c.created_at ASC`,
    [answerIds]
  );
  const map = {};
  for (const row of rows) {
    if (!map[row.answer_id]) map[row.answer_id] = [];
    map[row.answer_id].push(row);
  }
  return map;
}

module.exports = { findById, create, remove, getForQuestions, getForAnswers };

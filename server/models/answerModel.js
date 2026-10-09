const { pool } = require('../config/db');

const BASE_SELECT = `
  SELECT
    a.id, a.question_id, a.user_id, u.username AS author_username, u.avatar AS author_avatar,
    a.content, a.is_accepted, a.created_at, a.updated_at,
    (SELECT CAST(COALESCE(SUM(v.vote_type), 0) AS SIGNED) FROM votes v WHERE v.answer_id = a.id) AS vote_count
  FROM answers a
  JOIN users u ON u.id = a.user_id
`;

// Câu trả lời được accept hiện đầu, sau đó theo vote cao, cũ -> mới
async function findByQuestionId(questionId) {
  const [rows] = await pool.query(
    `${BASE_SELECT} WHERE a.question_id = ? ORDER BY a.is_accepted DESC, vote_count DESC, a.created_at ASC`,
    [questionId]
  );
  return rows;
}

// Câu trả lời của 1 user (dùng cho tab "Câu trả lời" ở trang hồ sơ), kèm tiêu đề câu hỏi gốc
async function findByUserId(userId, { page = 1, limit = 10 } = {}) {
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT
       a.id, a.question_id, a.content, a.is_accepted, a.created_at,
       q.title AS question_title,
       (SELECT CAST(COALESCE(SUM(v.vote_type), 0) AS SIGNED) FROM votes v WHERE v.answer_id = a.id) AS vote_count
     FROM answers a
     JOIN questions q ON q.id = a.question_id
     WHERE a.user_id = ?
     ORDER BY a.created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );

  const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM answers WHERE user_id = ?', [userId]);

  return { answers: rows, total: countRows[0].total };
}

// Toàn bộ câu trả lời trong hệ thống, dùng cho trang Admin.
// search: tìm theo nội dung câu trả lời, tiêu đề câu hỏi gốc, hoặc username người trả lời
async function findAllForAdmin({ page = 1, limit = 20, search } = {}) {
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push('(a.content LIKE ? OR q.title LIKE ? OR u.username LIKE ?)');
    const likeValue = `%${search}%`;
    params.push(likeValue, likeValue, likeValue);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT
       a.id, a.question_id, a.content, a.is_accepted, a.created_at,
       a.user_id, u.username AS author_username,
       q.title AS question_title
     FROM answers a
     JOIN users u ON u.id = a.user_id
     JOIN questions q ON q.id = a.question_id
     ${whereClause}
     ORDER BY a.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM answers a
     JOIN users u ON u.id = a.user_id
     JOIN questions q ON q.id = a.question_id
     ${whereClause}`,
    params
  );

  return { answers: rows, total: countRows[0].total };
}

async function findById(id) {
  const [rows] = await pool.query(`${BASE_SELECT} WHERE a.id = ?`, [id]);
  return rows[0];
}

async function create({ questionId, userId, content }) {
  const [result] = await pool.query(
    'INSERT INTO answers (question_id, user_id, content) VALUES (?, ?, ?)',
    [questionId, userId, content]
  );
  return result.insertId;
}

async function updateContent(id, content) {
  await pool.query('UPDATE answers SET content = ? WHERE id = ?', [content, id]);
}

// Mỗi câu hỏi chỉ được có 1 câu trả lời accepted tại một thời điểm
async function setAccepted(id, questionId, accepted) {
  if (accepted) {
    await pool.query('UPDATE answers SET is_accepted = 0 WHERE question_id = ?', [questionId]);
    await pool.query('UPDATE answers SET is_accepted = 1 WHERE id = ?', [id]);
  } else {
    await pool.query('UPDATE answers SET is_accepted = 0 WHERE id = ?', [id]);
  }
}

async function remove(id) {
  await pool.query('DELETE FROM answers WHERE id = ?', [id]);
}

module.exports = {
  findByQuestionId,
  findByUserId,
  findAllForAdmin,
  findById,
  create,
  updateContent,
  setAccepted,
  remove,
};

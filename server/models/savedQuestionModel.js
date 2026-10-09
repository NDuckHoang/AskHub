const { pool } = require('../config/db');

async function isSaved(userId, questionId) {
  const [rows] = await pool.query(
    'SELECT 1 FROM saved_questions WHERE user_id = ? AND question_id = ?',
    [userId, questionId]
  );
  return rows.length > 0;
}

// Bật/tắt lưu câu hỏi, trả về trạng thái mới (true = vừa lưu, false = vừa bỏ lưu)
async function toggle(userId, questionId) {
  const saved = await isSaved(userId, questionId);
  if (saved) {
    await pool.query('DELETE FROM saved_questions WHERE user_id = ? AND question_id = ?', [userId, questionId]);
    return false;
  }
  await pool.query('INSERT INTO saved_questions (user_id, question_id) VALUES (?, ?)', [userId, questionId]);
  return true;
}

// Danh sách câu hỏi đã lưu của 1 user, câu lưu gần nhất lên trước
async function findByUserId(userId, { page = 1, limit = 10 } = {}) {
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT
       q.id, q.title, q.content, q.views, q.created_at,
       q.user_id, u.username AS author_username, u.avatar AS author_avatar,
       q.category_id, c.name AS category_name,
       (SELECT CAST(COALESCE(SUM(v.vote_type), 0) AS SIGNED) FROM votes v WHERE v.question_id = q.id) AS vote_count,
       (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id) AS answer_count,
       (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id AND a.is_accepted = 1) AS accepted_count
     FROM saved_questions sq
     JOIN questions q ON q.id = sq.question_id
     JOIN users u ON u.id = q.user_id
     LEFT JOIN categories c ON c.id = q.category_id
     WHERE sq.user_id = ?
     ORDER BY sq.created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );

  const [countRows] = await pool.query(
    'SELECT COUNT(*) AS total FROM saved_questions WHERE user_id = ?',
    [userId]
  );

  return { questions: rows, total: countRows[0].total };
}

module.exports = { isSaved, toggle, findByUserId };

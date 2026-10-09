const { pool } = require('../config/db');

const BASE_SELECT = `
  SELECT
    n.id, n.type, n.is_read, n.created_at,
    n.question_id, q.title AS question_title,
    n.actor_id, u.username AS actor_username
  FROM notifications n
  JOIN users u ON u.id = n.actor_id
  JOIN questions q ON q.id = n.question_id
`;

// Không tự thông báo cho chính mình (vd tự trả lời/bình luận câu hỏi của mình)
async function create({ userId, actorId, type, questionId }) {
  if (userId === actorId) return;
  await pool.query(
    'INSERT INTO notifications (user_id, actor_id, type, question_id) VALUES (?, ?, ?, ?)',
    [userId, actorId, type, questionId]
  );
}

async function findByUserId(userId, { page = 1, limit = 10 } = {}) {
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `${BASE_SELECT} WHERE n.user_id = ? ORDER BY n.created_at DESC LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );

  const [countRows] = await pool.query(
    'SELECT COUNT(*) AS total FROM notifications WHERE user_id = ?',
    [userId]
  );

  return { notifications: rows, total: countRows[0].total };
}

async function countUnread(userId) {
  const [[row]] = await pool.query(
    'SELECT COUNT(*) AS total FROM notifications WHERE user_id = ? AND is_read = 0',
    [userId]
  );
  return row.total;
}

// WHERE có cả user_id để đảm bảo user chỉ đánh dấu đọc được thông báo của chính mình
async function markAsRead(id, userId) {
  await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, userId]);
}

async function markAllAsRead(userId) {
  await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0', [userId]);
}

module.exports = { create, findByUserId, countUnread, markAsRead, markAllAsRead };

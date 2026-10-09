const { pool } = require('../config/db');

const TARGET_TABLES = { QUESTION: 'questions', ANSWER: 'answers', COMMENT: 'comments' };

async function targetExists(targetType, targetId) {
  const table = TARGET_TABLES[targetType];
  if (!table) return false;
  const [rows] = await pool.query(`SELECT id FROM ${table} WHERE id = ?`, [targetId]);
  return rows.length > 0;
}

async function create({ reporterId, targetType, targetId, reason }) {
  const [result] = await pool.query(
    'INSERT INTO reports (reporter_id, target_type, target_id, reason) VALUES (?, ?, ?, ?)',
    [reporterId, targetType, targetId, reason]
  );
  return result.insertId;
}

// Danh sách báo cáo cho Admin, kèm đoạn trích nội dung bị báo cáo và question_id
// để Admin có thể bấm xem lại ngữ cảnh gốc
async function findAllForAdmin({ status, page = 1, limit = 20 }) {
  const conditions = [];
  const params = [];
  if (status) {
    conditions.push('r.status = ?');
    params.push(status);
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT
       r.id, r.target_type, r.target_id, r.reason, r.status, r.created_at, r.resolved_at,
       r.reporter_id, ru.username AS reporter_username,
       CASE r.target_type
         WHEN 'QUESTION' THEN (SELECT title FROM questions WHERE id = r.target_id)
         WHEN 'ANSWER' THEN (SELECT content FROM answers WHERE id = r.target_id)
         WHEN 'COMMENT' THEN (SELECT content FROM comments WHERE id = r.target_id)
       END AS target_preview,
       CASE r.target_type
         WHEN 'QUESTION' THEN r.target_id
         WHEN 'ANSWER' THEN (SELECT question_id FROM answers WHERE id = r.target_id)
         WHEN 'COMMENT' THEN (
           SELECT COALESCE(c.question_id, (SELECT a.question_id FROM answers a WHERE a.id = c.answer_id))
           FROM comments c WHERE c.id = r.target_id
         )
       END AS question_id
     FROM reports r
     JOIN users ru ON ru.id = r.reporter_id
     ${whereClause}
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM reports r ${whereClause}`, params);
  return { reports: rows, total: countRows[0].total };
}

async function countPending() {
  const [[row]] = await pool.query("SELECT COUNT(*) AS total FROM reports WHERE status = 'PENDING'");
  return row.total;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM reports WHERE id = ?', [id]);
  return rows[0];
}

async function updateStatus(id, status, resolvedBy) {
  await pool.query(
    'UPDATE reports SET status = ?, resolved_at = NOW(), resolved_by = ? WHERE id = ?',
    [status, resolvedBy, id]
  );
}

// Xóa nội dung bị báo cáo (dùng khi Admin xác nhận vi phạm)
async function removeTarget(targetType, targetId) {
  const table = TARGET_TABLES[targetType];
  await pool.query(`DELETE FROM ${table} WHERE id = ?`, [targetId]);
}

module.exports = {
  targetExists,
  create,
  findAllForAdmin,
  countPending,
  findById,
  updateStatus,
  removeTarget,
};

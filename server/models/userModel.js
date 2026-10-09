const { pool } = require('../config/db');

// Các cột được phép trả về client, không bao giờ trả cột password
const PUBLIC_FIELDS = 'id, username, email, role, avatar, bio, gender, contact, reputation, status, created_at';

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
}

async function findByUsername(username) {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  return rows[0];
}

async function findById(id) {
  const [rows] = await pool.query(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`, [id]);
  return rows[0];
}

async function createUser({ username, email, passwordHash }) {
  const [result] = await pool.query(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, passwordHash]
  );
  return findById(result.insertId);
}

// Hồ sơ công khai (ai cũng xem được) - không trả email, kèm số câu hỏi/câu trả lời
async function findPublicProfile(id) {
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.avatar, u.bio, u.gender, u.contact, u.reputation, u.role, u.created_at,
       (SELECT COUNT(*) FROM questions q WHERE q.user_id = u.id) AS question_count,
       (SELECT COUNT(*) FROM answers a WHERE a.user_id = u.id) AS answer_count
     FROM users u
     WHERE u.id = ?`,
    [id]
  );
  return rows[0];
}

// Cập nhật hồ sơ cá nhân - controller chịu trách nhiệm gộp giá trị cũ/mới và validate trước khi gọi
async function updateProfile(id, { avatar, bio, gender, contact, email }) {
  await pool.query(
    'UPDATE users SET avatar = ?, bio = ?, gender = ?, contact = ?, email = ? WHERE id = ?',
    [avatar, bio, gender, contact, email, id]
  );
  return findById(id);
}

// Danh sách user cho trang Admin, có tìm kiếm theo username/email
async function findAllForAdmin({ search, page = 1, limit = 20 }) {
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push('(username LIKE ? OR email LIKE ?)');
    const likeValue = `%${search}%`;
    params.push(likeValue, likeValue);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT id, username, email, role, status, reputation, created_at
     FROM users
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM users ${whereClause}`, params);

  return { users: rows, total: countRows[0].total };
}

async function updateStatus(id, status) {
  await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
}

async function remove(id) {
  await pool.query('DELETE FROM users WHERE id = ?', [id]);
}

module.exports = {
  findByEmail,
  findByUsername,
  findById,
  createUser,
  findPublicProfile,
  updateProfile,
  findAllForAdmin,
  updateStatus,
  remove,
};

const { pool } = require('../config/db');

// Các cột được phép trả về client, không bao giờ trả cột password
// security_question (chỉ câu hỏi, KHÔNG có câu trả lời) để trang Chỉnh sửa hồ sơ biết đã thiết lập hay chưa
const PUBLIC_FIELDS =
  'id, username, email, role, avatar, bio, gender, contact, reputation, status, security_question, created_at';

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

async function createUser({ username, email, passwordHash, securityQuestion, securityAnswerHash }) {
  const [result] = await pool.query(
    'INSERT INTO users (username, email, password, security_question, security_answer) VALUES (?, ?, ?, ?, ?)',
    [username, email, passwordHash, securityQuestion, securityAnswerHash]
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

// Đổi quyền USER <-> ADMIN (chỉ Admin gọi được, xem adminController.updateUserRole)
async function updateRole(id, role) {
  await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
}

// Cộng/trừ điểm uy tín (delta âm để trừ). Dùng khi vote câu hỏi/câu trả lời
// hoặc khi câu trả lời được/bị bỏ đánh dấu đúng - xem reputationPoints.js
async function adjustReputation(id, delta) {
  if (!delta) return;
  await pool.query('UPDATE users SET reputation = reputation + ? WHERE id = ?', [delta, id]);
}

// Top N user theo điểm uy tín, dùng cho bảng xếp hạng ở sidebar
// - chỉ tính user còn hoạt động, không tính Admin (Admin không tham gia xếp hạng)
// Bảng xếp hạng theo điểm uy tín (tổng từ trước tới nay), có phân trang.
// Kèm số câu hỏi / câu trả lời / câu trả lời được chấp nhận để hiển thị ở trang /leaderboard.
// Chỉ tính thành viên đang hoạt động, không tính Admin.
async function findTopByReputation(limit = 10, offset = 0) {
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.avatar, u.reputation,
       (SELECT COUNT(*) FROM questions q WHERE q.user_id = u.id) AS question_count,
       (SELECT COUNT(*) FROM answers a WHERE a.user_id = u.id) AS answer_count,
       (SELECT COUNT(*) FROM answers a WHERE a.user_id = u.id AND a.is_accepted = 1) AS accepted_count
     FROM users u
     WHERE u.status = 'ACTIVE' AND u.role != 'ADMIN'
     ORDER BY u.reputation DESC, u.created_at ASC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return rows;
}

async function countLeaderboard() {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS total FROM users WHERE status = 'ACTIVE' AND role != 'ADMIN'"
  );
  return rows[0].total;
}

async function remove(id) {
  await pool.query('DELETE FROM users WHERE id = ?', [id]);
}

// Lấy hash mật khẩu hiện tại để so sánh khi đổi mật khẩu (findById không trả
// cột password vì dùng PUBLIC_FIELDS)
async function findPasswordHashById(id) {
  const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [id]);
  return rows[0]?.password;
}

// Đổi mật khẩu (dùng cho tính năng "Đổi mật khẩu" trong hồ sơ cá nhân -
// controller đã kiểm tra mật khẩu cũ đúng trước khi gọi hàm này)
async function updatePassword(id, passwordHash) {
  await pool.query('UPDATE users SET password = ? WHERE id = ?', [passwordHash, id]);
}

// Đặt/đổi câu hỏi bảo mật (answerHash: hash bcrypt của câu trả lời đã chuẩn hóa)
async function updateSecurityQuestion(id, question, answerHash) {
  await pool.query('UPDATE users SET security_question = ?, security_answer = ? WHERE id = ?', [
    question,
    answerHash,
    id,
  ]);
}

module.exports = {
  updateSecurityQuestion,
  findByEmail,
  findByUsername,
  findById,
  createUser,
  findPublicProfile,
  updateProfile,
  findAllForAdmin,
  updateStatus,
  updateRole,
  remove,
  adjustReputation,
  findTopByReputation,
  countLeaderboard,
  findPasswordHashById,
  updatePassword,
};

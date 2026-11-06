const { pool } = require('../config/db');

async function findAll() {
  const [rows] = await pool.query(`
    SELECT c.id, c.name, c.description, c.created_at,
      (SELECT COUNT(*) FROM questions q WHERE q.category_id = c.id) AS question_count
    FROM categories c
    ORDER BY c.name ASC
  `);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
  return rows[0];
}

async function findByName(name) {
  const [rows] = await pool.query('SELECT * FROM categories WHERE name = ?', [name]);
  return rows[0];
}

async function create({ name, description }) {
  const [result] = await pool.query(
    'INSERT INTO categories (name, description) VALUES (?, ?)',
    [name, description || null]
  );
  return result.insertId;
}

async function update(id, { name, description }) {
  await pool.query(
    'UPDATE categories SET name = ?, description = ? WHERE id = ?',
    [name, description || null, id]
  );
}

async function remove(id) {
  await pool.query('DELETE FROM categories WHERE id = ?', [id]);
}

// Thống kê cho khối "Chủ đề hot" ở trang chủ (chỉ đọc, không đổi database).
// Với mỗi danh mục có câu hỏi:
//  - question_count / answer_count / comment_count: tổng từ trước tới nay
//  - recent_questions: số câu hỏi trong `days` ngày gần nhất
//  - previous_questions: số câu hỏi trong `days` ngày liền trước đó (để so xu hướng tăng/giảm)
//  - recent_answers: số câu trả lời mới trong `days` ngày gần nhất
// Xếp hạng: hoạt động gần đây (câu hỏi + trả lời mới) trước, hòa thì xét tổng tương tác.
async function findTrending(days = 30, limit = 6) {
  const [rows] = await pool.query(
    `SELECT c.id, c.name,
       (SELECT COUNT(*) FROM questions q WHERE q.category_id = c.id) AS question_count,
       (SELECT COUNT(*) FROM answers a JOIN questions q ON q.id = a.question_id
         WHERE q.category_id = c.id) AS answer_count,
       (SELECT COUNT(*) FROM comments cm JOIN questions q ON q.id = cm.question_id
         WHERE q.category_id = c.id)
       + (SELECT COUNT(*) FROM comments cm JOIN answers a ON a.id = cm.answer_id
           JOIN questions q ON q.id = a.question_id WHERE q.category_id = c.id) AS comment_count,
       (SELECT COUNT(*) FROM questions q WHERE q.category_id = c.id
         AND q.created_at >= NOW() - INTERVAL ? DAY) AS recent_questions,
       (SELECT COUNT(*) FROM questions q WHERE q.category_id = c.id
         AND q.created_at < NOW() - INTERVAL ? DAY
         AND q.created_at >= NOW() - INTERVAL ? DAY) AS previous_questions,
       (SELECT COUNT(*) FROM answers a JOIN questions q ON q.id = a.question_id
         WHERE q.category_id = c.id AND a.created_at >= NOW() - INTERVAL ? DAY) AS recent_answers
     FROM categories c
     HAVING question_count > 0
     ORDER BY (recent_questions + recent_answers) DESC,
       (question_count + answer_count + comment_count) DESC, c.name ASC
     LIMIT ?`,
    [days, days, days * 2, days, limit]
  );
  return rows;
}

module.exports = { findTrending, findAll, findById, findByName, create, update, remove };

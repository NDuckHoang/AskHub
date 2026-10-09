const { pool } = require('../config/db');

// Tìm tag theo tên, nếu chưa có thì tạo mới. Trả về mảng id tag.
async function findOrCreateByNames(names) {
  const tagIds = [];
  for (const rawName of names) {
    const name = rawName.trim().toLowerCase();
    const [rows] = await pool.query('SELECT id FROM tags WHERE name = ?', [name]);
    if (rows[0]) {
      tagIds.push(rows[0].id);
    } else {
      const [result] = await pool.query('INSERT INTO tags (name) VALUES (?)', [name]);
      tagIds.push(result.insertId);
    }
  }
  return tagIds;
}

// Lấy tag của nhiều câu hỏi một lần, trả về map { question_id: [{id, name}, ...] }
async function getTagsForQuestions(questionIds) {
  if (questionIds.length === 0) return {};

  const [rows] = await pool.query(
    `SELECT qt.question_id, t.id, t.name
     FROM question_tags qt
     JOIN tags t ON t.id = qt.tag_id
     WHERE qt.question_id IN (?)`,
    [questionIds]
  );

  const map = {};
  for (const row of rows) {
    if (!map[row.question_id]) map[row.question_id] = [];
    map[row.question_id].push({ id: row.id, name: row.name });
  }
  return map;
}

// Lấy các tag được dùng nhiều nhất (để hiển thị ở sidebar "Tag phổ biến")
async function findPopular(limit = 10) {
  const [rows] = await pool.query(
    `SELECT t.id, t.name, COUNT(qt.question_id) AS question_count
     FROM tags t
     JOIN question_tags qt ON qt.tag_id = t.id
     GROUP BY t.id, t.name
     ORDER BY question_count DESC, t.name ASC
     LIMIT ?`,
    [limit]
  );
  return rows;
}

module.exports = { findOrCreateByNames, getTagsForQuestions, findPopular };

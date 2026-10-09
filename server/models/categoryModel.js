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

module.exports = { findAll, findById, findByName, create, update, remove };

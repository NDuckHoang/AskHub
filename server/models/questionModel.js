const { pool } = require('../config/db');

// Map giá trị sort từ query string sang mệnh đề ORDER BY
const SORT_MAP = {
  newest: 'q.created_at DESC',
  votes: 'vote_count DESC, q.created_at DESC',
  answers: 'answer_count DESC, q.created_at DESC',
  unanswered: 'q.created_at DESC',
};

// vote_count và answer_count dùng subquery thay vì JOIN + GROUP BY cho dễ đọc
// và tránh nhân dòng khi phân trang
const BASE_SELECT = `
  SELECT
    q.id, q.title, q.content, q.views, q.created_at, q.updated_at,
    q.user_id, u.username AS author_username, u.avatar AS author_avatar,
    q.category_id, c.name AS category_name,
    (SELECT CAST(COALESCE(SUM(v.vote_type), 0) AS SIGNED) FROM votes v WHERE v.question_id = q.id) AS vote_count,
    (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id) AS answer_count,
    (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id AND a.is_accepted = 1) AS accepted_count
  FROM questions q
  JOIN users u ON u.id = q.user_id
  LEFT JOIN categories c ON c.id = q.category_id
`;

function buildFilter({ categoryId, tagId, userId, unansweredOnly, keyword, daysAgo }) {
  const conditions = [];
  const params = [];

  if (categoryId) {
    conditions.push('q.category_id = ?');
    params.push(categoryId);
  }
  if (userId) {
    conditions.push('q.user_id = ?');
    params.push(userId);
  }
  if (tagId) {
    conditions.push('q.id IN (SELECT question_id FROM question_tags WHERE tag_id = ?)');
    params.push(tagId);
  }
  if (unansweredOnly) {
    conditions.push('(SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id) = 0');
  }
  if (daysAgo) {
    conditions.push('q.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)');
    params.push(daysAgo);
  }
  if (keyword) {
    // Tìm theo tiêu đề, nội dung hoặc tên tag
    conditions.push(`(
      q.title LIKE ? OR q.content LIKE ? OR q.id IN (
        SELECT qt.question_id FROM question_tags qt
        JOIN tags t ON t.id = qt.tag_id
        WHERE t.name LIKE ?
      )
    )`);
    const likeValue = `%${keyword}%`;
    params.push(likeValue, likeValue, likeValue);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereClause, params };
}

async function findAll({ categoryId, tagId, userId, sort = 'newest', page = 1, limit = 10, keyword, daysAgo }) {
  const unansweredOnly = sort === 'unanswered';
  const { whereClause, params } = buildFilter({ categoryId, tagId, userId, unansweredOnly, keyword, daysAgo });
  const orderBy = SORT_MAP[sort] || SORT_MAP.newest;
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `${BASE_SELECT} ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM questions q ${whereClause}`,
    params
  );

  return { questions: rows, total: countRows[0].total };
}

async function findById(id) {
  const [rows] = await pool.query(`${BASE_SELECT} WHERE q.id = ?`, [id]);
  return rows[0];
}

async function getOwnerId(id) {
  const [rows] = await pool.query('SELECT user_id FROM questions WHERE id = ?', [id]);
  return rows[0]?.user_id;
}

async function incrementViews(id) {
  await pool.query('UPDATE questions SET views = views + 1 WHERE id = ?', [id]);
}

async function create({ userId, categoryId, title, content }) {
  const [result] = await pool.query(
    'INSERT INTO questions (user_id, category_id, title, content) VALUES (?, ?, ?, ?)',
    [userId, categoryId, title, content]
  );
  return result.insertId;
}

async function update(id, { categoryId, title, content }) {
  await pool.query(
    'UPDATE questions SET category_id = ?, title = ?, content = ? WHERE id = ?',
    [categoryId, title, content, id]
  );
}

async function remove(id) {
  await pool.query('DELETE FROM questions WHERE id = ?', [id]);
}

async function setTags(questionId, tagIds) {
  await pool.query('DELETE FROM question_tags WHERE question_id = ?', [questionId]);
  if (tagIds.length > 0) {
    const values = tagIds.map((tagId) => [questionId, tagId]);
    await pool.query('INSERT INTO question_tags (question_id, tag_id) VALUES ?', [values]);
  }
}

module.exports = { findAll, findById, getOwnerId, incrementViews, create, update, remove, setTags };

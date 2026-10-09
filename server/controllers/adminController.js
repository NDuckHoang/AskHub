const ExcelJS = require('exceljs');
const { pool } = require('../config/db');
const userModel = require('../models/userModel');
const questionModel = require('../models/questionModel');
const answerModel = require('../models/answerModel');
const reportModel = require('../models/reportModel');

function parseId(rawId) {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parsePagination(query) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);
  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = 20;
  return { page, limit };
}

// Thống kê tổng quan hiển thị ở đầu trang Admin
async function getStats(req, res) {
  const [[usersRow]] = await pool.query('SELECT COUNT(*) AS total FROM users');
  const [[questionsRow]] = await pool.query('SELECT COUNT(*) AS total FROM questions');
  const [[answersRow]] = await pool.query('SELECT COUNT(*) AS total FROM answers');
  const [[commentsRow]] = await pool.query('SELECT COUNT(*) AS total FROM comments');
  const pendingReports = await reportModel.countPending();

  res.json({
    totalUsers: usersRow.total,
    totalQuestions: questionsRow.total,
    totalAnswers: answersRow.total,
    totalComments: commentsRow.total,
    pendingReports,
  });
}

// Số câu hỏi + câu trả lời tạo mới mỗi ngày trong 7 ngày gần nhất, dùng cho biểu đồ hoạt động
async function getActivityStats(req, res) {
  const [questionRows] = await pool.query(
    `SELECT DATE(created_at) AS day, COUNT(*) AS total
     FROM questions
     WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     GROUP BY DATE(created_at)`
  );
  const [answerRows] = await pool.query(
    `SELECT DATE(created_at) AS day, COUNT(*) AS total
     FROM answers
     WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     GROUP BY DATE(created_at)`
  );

  const questionMap = new Map(questionRows.map((r) => [formatDay(r.day), r.total]));
  const answerMap = new Map(answerRows.map((r) => [formatDay(r.day), r.total]));

  // Đảm bảo đủ 7 ngày liên tiếp, kể cả ngày không có dữ liệu (total = 0)
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = formatDay(d);
    days.push({
      day: key,
      questions: questionMap.get(key) || 0,
      answers: answerMap.get(key) || 0,
    });
  }

  res.json({ days });
}

function formatDay(value) {
  const d = new Date(value);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

async function getUsers(req, res) {
  const { page, limit } = parsePagination(req.query);
  const search = req.query.search ? req.query.search.trim() : undefined;

  const { users, total } = await userModel.findAllForAdmin({ search, page, limit });

  res.json({
    users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  });
}

async function updateUserStatus(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'id không hợp lệ' });
  }
  if (id === req.user.id) {
    return res.status(400).json({ message: 'Không thể tự khóa/mở khóa chính mình' });
  }

  const { status } = req.body;
  if (!['ACTIVE', 'BLOCKED'].includes(status)) {
    return res.status(400).json({ message: 'status phải là ACTIVE hoặc BLOCKED' });
  }

  const user = await userModel.findById(id);
  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }

  await userModel.updateStatus(id, status);
  res.json({ message: status === 'BLOCKED' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản' });
}

async function deleteUser(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'id không hợp lệ' });
  }
  if (id === req.user.id) {
    return res.status(400).json({ message: 'Không thể tự xóa chính mình' });
  }

  const user = await userModel.findById(id);
  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }

  // FK trong schema.sql đã đặt ON DELETE CASCADE nên câu hỏi/trả lời/bình luận/vote
  // của user này cũng tự động bị xóa theo
  await userModel.remove(id);
  res.json({ message: 'Đã xóa người dùng' });
}

async function deleteQuestion(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'id không hợp lệ' });
  }

  const question = await questionModel.findById(id);
  if (!question) {
    return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
  }

  await questionModel.remove(id);
  res.json({ message: 'Đã xóa câu hỏi' });
}

async function getAnswers(req, res) {
  const { page, limit } = parsePagination(req.query);
  const search = req.query.search ? req.query.search.trim() : undefined;
  const { answers, total } = await answerModel.findAllForAdmin({ page, limit, search });

  res.json({
    answers,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  });
}

async function deleteAnswer(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'id không hợp lệ' });
  }

  const answer = await answerModel.findById(id);
  if (!answer) {
    return res.status(404).json({ message: 'Không tìm thấy câu trả lời' });
  }

  await answerModel.remove(id);
  res.json({ message: 'Đã xóa câu trả lời' });
}

// ===== Báo cáo vi phạm (reports) =====

async function getReports(req, res) {
  const { page, limit } = parsePagination(req.query);
  const status = ['PENDING', 'RESOLVED', 'DISMISSED'].includes(req.query.status)
    ? req.query.status
    : undefined;

  const { reports, total } = await reportModel.findAllForAdmin({ status, page, limit });

  res.json({
    reports,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  });
}

// Admin xử lý 1 báo cáo: xóa nội dung vi phạm (RESOLVED) hoặc bỏ qua (DISMISSED)
async function resolveReport(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'id không hợp lệ' });
  }

  const { status, deleteTarget } = req.body;
  if (!['RESOLVED', 'DISMISSED'].includes(status)) {
    return res.status(400).json({ message: 'status phải là RESOLVED hoặc DISMISSED' });
  }

  const report = await reportModel.findById(id);
  if (!report) {
    return res.status(404).json({ message: 'Không tìm thấy báo cáo' });
  }

  if (status === 'RESOLVED' && deleteTarget) {
    await reportModel.removeTarget(report.target_type, report.target_id);
  }

  await reportModel.updateStatus(id, status, req.user.id);
  res.json({ message: 'Đã xử lý báo cáo' });
}

// ===== Xuất Excel =====

// Thêm điều kiện lọc theo khoảng ngày (nếu có) vào mảng conditions/params dùng chung
function applyDateRange(column, { dateFrom, dateTo }, conditions, params) {
  if (dateFrom) {
    conditions.push(`${column} >= ?`);
    params.push(`${dateFrom} 00:00:00`);
  }
  if (dateTo) {
    conditions.push(`${column} <= ?`);
    params.push(`${dateTo} 23:59:59`);
  }
}

async function sendWorkbook(res, filename, columns, rows) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Data');
  sheet.columns = columns;
  sheet.getRow(1).font = { bold: true };
  rows.forEach((row) => sheet.addRow(row));

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  await workbook.xlsx.write(res);
  res.end();
}

async function exportUsers(req, res) {
  const { search, dateFrom, dateTo, role, status } = req.query;
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push('(username LIKE ? OR email LIKE ?)');
    const likeValue = `%${search}%`;
    params.push(likeValue, likeValue);
  }
  if (['USER', 'ADMIN'].includes(role)) {
    conditions.push('role = ?');
    params.push(role);
  }
  if (['ACTIVE', 'BLOCKED'].includes(status)) {
    conditions.push('status = ?');
    params.push(status);
  }
  applyDateRange('created_at', { dateFrom, dateTo }, conditions, params);

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT id, username, email, role, status, reputation, created_at
     FROM users
     ${whereClause}
     ORDER BY id ASC`,
    params
  );

  await sendWorkbook(
    res,
    'nguoi-dung.xlsx',
    [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Username', key: 'username', width: 22 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Vai trò', key: 'role', width: 12 },
      { header: 'Trạng thái', key: 'status', width: 12 },
      { header: 'Điểm uy tín', key: 'reputation', width: 12 },
      { header: 'Ngày tham gia', key: 'created_at', width: 20 },
    ],
    rows
  );
}

async function exportQuestions(req, res) {
  const { search, dateFrom, dateTo, category_id: categoryId } = req.query;
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push(`(
      q.title LIKE ? OR q.content LIKE ? OR q.id IN (
        SELECT qt.question_id FROM question_tags qt
        JOIN tags t ON t.id = qt.tag_id
        WHERE t.name LIKE ?
      )
    )`);
    const likeValue = `%${search}%`;
    params.push(likeValue, likeValue, likeValue);
  }
  const parsedCategoryId = parseId(categoryId);
  if (parsedCategoryId) {
    conditions.push('q.category_id = ?');
    params.push(parsedCategoryId);
  }
  applyDateRange('q.created_at', { dateFrom, dateTo }, conditions, params);

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT
       q.id, q.title, u.username AS author, c.name AS category, q.views,
       (SELECT CAST(COALESCE(SUM(v.vote_type), 0) AS SIGNED) FROM votes v WHERE v.question_id = q.id) AS votes,
       (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id) AS answers,
       q.created_at
     FROM questions q
     JOIN users u ON u.id = q.user_id
     LEFT JOIN categories c ON c.id = q.category_id
     ${whereClause}
     ORDER BY q.id ASC`,
    params
  );

  await sendWorkbook(
    res,
    'cau-hoi.xlsx',
    [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Tiêu đề', key: 'title', width: 50 },
      { header: 'Người đăng', key: 'author', width: 20 },
      { header: 'Danh mục', key: 'category', width: 16 },
      { header: 'Lượt xem', key: 'views', width: 10 },
      { header: 'Vote', key: 'votes', width: 8 },
      { header: 'Trả lời', key: 'answers', width: 10 },
      { header: 'Ngày tạo', key: 'created_at', width: 20 },
    ],
    rows
  );
}

async function exportAnswers(req, res) {
  const { search, dateFrom, dateTo, accepted } = req.query;
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push('(a.content LIKE ? OR q.title LIKE ? OR u.username LIKE ?)');
    const likeValue = `%${search}%`;
    params.push(likeValue, likeValue, likeValue);
  }
  if (accepted === '1' || accepted === '0') {
    conditions.push('a.is_accepted = ?');
    params.push(accepted);
  }
  applyDateRange('a.created_at', { dateFrom, dateTo }, conditions, params);

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT
       a.id, q.title AS question_title, u.username AS author, a.content,
       a.is_accepted,
       (SELECT CAST(COALESCE(SUM(v.vote_type), 0) AS SIGNED) FROM votes v WHERE v.answer_id = a.id) AS votes,
       a.created_at
     FROM answers a
     JOIN users u ON u.id = a.user_id
     JOIN questions q ON q.id = a.question_id
     ${whereClause}
     ORDER BY a.id ASC`,
    params
  );

  // Content có thể dài và chứa markdown, giới hạn độ dài khi xuất excel cho dễ đọc
  const trimmedRows = rows.map((row) => ({
    ...row,
    content: row.content.length > 300 ? `${row.content.slice(0, 300)}...` : row.content,
    is_accepted: row.is_accepted ? 'Có' : 'Không',
  }));

  await sendWorkbook(
    res,
    'cau-tra-loi.xlsx',
    [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Câu hỏi', key: 'question_title', width: 40 },
      { header: 'Người trả lời', key: 'author', width: 20 },
      { header: 'Nội dung', key: 'content', width: 50 },
      { header: 'Được chấp nhận', key: 'is_accepted', width: 14 },
      { header: 'Vote', key: 'votes', width: 8 },
      { header: 'Ngày tạo', key: 'created_at', width: 20 },
    ],
    trimmedRows
  );
}

module.exports = {
  getStats,
  getActivityStats,
  getUsers,
  updateUserStatus,
  deleteUser,
  deleteQuestion,
  getAnswers,
  deleteAnswer,
  getReports,
  resolveReport,
  exportUsers,
  exportQuestions,
  exportAnswers,
};

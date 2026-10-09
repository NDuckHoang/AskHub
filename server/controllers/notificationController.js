const notificationModel = require('../models/notificationModel');

function parseId(rawId) {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parsePagination(query) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);
  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = 10;
  return { page, limit };
}

async function getNotifications(req, res) {
  const { page, limit } = parsePagination(req.query);
  const { notifications, total } = await notificationModel.findByUserId(req.user.id, { page, limit });

  res.json({
    notifications,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  });
}

async function getUnreadCount(req, res) {
  const count = await notificationModel.countUnread(req.user.id);
  res.json({ count });
}

async function markAsRead(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'id không hợp lệ' });
  }
  await notificationModel.markAsRead(id, req.user.id);
  res.json({ message: 'Đã đánh dấu đã đọc' });
}

async function markAllAsRead(req, res) {
  await notificationModel.markAllAsRead(req.user.id);
  res.json({ message: 'Đã đánh dấu tất cả đã đọc' });
}

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead };

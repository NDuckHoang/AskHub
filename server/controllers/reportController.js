const reportModel = require('../models/reportModel');

const TARGET_TYPES = ['QUESTION', 'ANSWER', 'COMMENT'];

// Bất kỳ user đã đăng nhập đều có thể báo cáo 1 câu hỏi/câu trả lời/bình luận vi phạm
async function createReport(req, res) {
  const { target_type, target_id, reason } = req.body;

  if (!TARGET_TYPES.includes(target_type)) {
    return res.status(400).json({ message: 'target_type phải là QUESTION, ANSWER hoặc COMMENT' });
  }

  const targetId = Number(target_id);
  if (!Number.isInteger(targetId) || targetId <= 0) {
    return res.status(400).json({ message: 'target_id không hợp lệ' });
  }

  if (!reason || !reason.trim() || reason.trim().length > 500) {
    return res.status(400).json({ message: 'Lý do báo cáo phải có từ 1 đến 500 ký tự' });
  }

  const exists = await reportModel.targetExists(target_type, targetId);
  if (!exists) {
    return res.status(404).json({ message: 'Nội dung bị báo cáo không còn tồn tại' });
  }

  const id = await reportModel.create({
    reporterId: req.user.id,
    targetType: target_type,
    targetId,
    reason: reason.trim(),
  });

  res.status(201).json({ message: 'Đã gửi báo cáo, cảm ơn bạn', id });
}

module.exports = { createReport };

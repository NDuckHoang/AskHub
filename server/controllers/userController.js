const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const answerModel = require('../models/answerModel');
const { normalizeAnswer, validateSecurityQuestion } = require('../utils/securityQuestions');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENDER_VALUES = ['MALE', 'FEMALE', 'OTHER'];

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

// GET /api/users/leaderboard?page=1&limit=20 (công khai)
// Sidebar trang chủ chỉ gửi limit và chỉ đọc `users`; trang /leaderboard dùng thêm page + pagination.
async function getLeaderboard(req, res) {
  const { page } = parsePagination(req.query);
  let limit = parseInt(req.query.limit, 10);
  if (!Number.isInteger(limit) || limit < 1) limit = 10;
  if (limit > 20) limit = 20;

  const [users, total] = await Promise.all([
    userModel.findTopByReputation(limit, (page - 1) * limit),
    userModel.countLeaderboard(),
  ]);

  res.json({
    users,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
}

async function getUserProfile(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'id không hợp lệ' });
  }

  const user = await userModel.findPublicProfile(id);
  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }

  res.json({ user });
}

async function getUserAnswers(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'id không hợp lệ' });
  }

  const user = await userModel.findPublicProfile(id);
  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }

  const { page, limit } = parsePagination(req.query);
  const { answers, total } = await answerModel.findByUserId(id, { page, limit });

  res.json({
    answers,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  });
}

// Sửa hồ sơ cá nhân - chỉ chủ tài khoản mới có quyền, admin không được sửa hộ qua route này
async function updateProfile(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'id không hợp lệ' });
  }
  if (req.user.id !== id) {
    return res.status(403).json({ message: 'Bạn không có quyền sửa hồ sơ này' });
  }

  const current = await userModel.findById(id);
  if (!current) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }

  const { avatar, bio, gender, contact, email } = req.body;

  let finalEmail = current.email;
  if (email !== undefined && email.trim() !== current.email) {
    if (!EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ message: 'Email không đúng định dạng' });
    }
    const existing = await userModel.findByEmail(email.trim());
    if (existing && existing.id !== id) {
      return res.status(409).json({ message: 'Email đã được sử dụng' });
    }
    finalEmail = email.trim();
  }

  if (bio !== undefined && bio.length > 500) {
    return res.status(400).json({ message: 'Giới thiệu bản thân tối đa 500 ký tự' });
  }
  if (gender !== undefined && gender !== null && gender !== '' && !GENDER_VALUES.includes(gender)) {
    return res.status(400).json({ message: 'Giới tính không hợp lệ' });
  }
  if (contact !== undefined && contact.length > 255) {
    return res.status(400).json({ message: 'Thông tin liên hệ tối đa 255 ký tự' });
  }

  const updated = await userModel.updateProfile(id, {
    avatar: avatar !== undefined ? avatar || null : current.avatar,
    bio: bio !== undefined ? bio.trim() || null : current.bio,
    gender: gender !== undefined ? gender || null : current.gender,
    contact: contact !== undefined ? contact.trim() || null : current.contact,
    email: finalEmail,
  });

  res.json({ message: 'Cập nhật hồ sơ thành công', user: updated });
}

// Đổi mật khẩu - chỉ chủ tài khoản, phải nhập đúng mật khẩu hiện tại
async function changePassword(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'id không hợp lệ' });
  }
  if (req.user.id !== id) {
    return res.status(403).json({ message: 'Bạn không có quyền đổi mật khẩu của tài khoản này' });
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
  }

  const currentHash = await userModel.findPasswordHashById(id);
  const isMatch = await bcrypt.compare(currentPassword, currentHash);
  if (!isMatch) {
    return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await userModel.updatePassword(id, newHash);

  res.json({ message: 'Đổi mật khẩu thành công' });
}

// PUT /api/users/:id/security-question { currentPassword, securityQuestion, securityAnswer }
// Đặt/đổi câu hỏi bảo mật (dùng cho chức năng Quên mật khẩu). Giống đổi mật khẩu: chỉ chủ tài khoản,
// phải nhập đúng mật khẩu hiện tại - tránh người khác dùng máy đang đăng nhập sẵn để đổi câu hỏi.
async function updateSecurityQuestion(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'id không hợp lệ' });
  }
  if (req.user.id !== id) {
    return res.status(403).json({ message: 'Bạn không có quyền đổi câu hỏi bảo mật của tài khoản này' });
  }

  const { currentPassword, securityQuestion, securityAnswer } = req.body;
  if (!currentPassword) {
    return res.status(400).json({ message: 'Vui lòng nhập mật khẩu hiện tại' });
  }
  const questionError = validateSecurityQuestion(securityQuestion, securityAnswer);
  if (questionError) {
    return res.status(400).json({ message: questionError });
  }

  const currentHash = await userModel.findPasswordHashById(id);
  const isMatch = await bcrypt.compare(currentPassword, currentHash);
  if (!isMatch) {
    return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
  }

  const answerHash = await bcrypt.hash(normalizeAnswer(securityAnswer), 10);
  await userModel.updateSecurityQuestion(id, securityQuestion, answerHash);

  res.json({ message: 'Đã lưu câu hỏi bảo mật', securityQuestion });
}

module.exports = {
  getLeaderboard,
  getUserProfile,
  getUserAnswers,
  updateProfile,
  changePassword,
  updateSecurityQuestion,
};

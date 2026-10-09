const userModel = require('../models/userModel');
const answerModel = require('../models/answerModel');

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

module.exports = { getUserProfile, getUserAnswers, updateProfile };

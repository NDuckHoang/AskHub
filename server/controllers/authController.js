const bcrypt = require('bcryptjs');
const { signToken } = require('../utils/jwt');
const { findByEmail, findByUsername, createUser, findById } = require('../models/userModel');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Loại bỏ password trước khi trả user về client
function toPublicUser(user) {
  const { password, ...publicUser } = user;
  return publicUser;
}

async function register(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ username, email và password' });
  }
  if (username.trim().length < 3 || username.trim().length > 30) {
    return res.status(400).json({ message: 'Username phải có từ 3 đến 30 ký tự' });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: 'Email không đúng định dạng' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password phải có ít nhất 6 ký tự' });
  }

  const existingEmail = await findByEmail(email);
  if (existingEmail) {
    return res.status(409).json({ message: 'Email đã được sử dụng' });
  }
  const existingUsername = await findByUsername(username);
  if (existingUsername) {
    return res.status(409).json({ message: 'Username đã được sử dụng' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({ username: username.trim(), email: email.trim(), passwordHash });

  res.status(201).json({ message: 'Đăng ký thành công', user: toPublicUser(user) });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập email và password' });
  }

  const user = await findByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  }
  if (user.status === 'BLOCKED') {
    return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  }

  const token = signToken(user);
  res.json({ message: 'Đăng nhập thành công', token, user: toPublicUser(user) });
}

async function me(req, res) {
  // req.user.id lấy từ authMiddleware, truy vấn lại để có dữ liệu mới nhất
  const user = await findById(req.user.id);
  res.json({ user });
}

module.exports = { register, login, me };

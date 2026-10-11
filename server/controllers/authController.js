const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { signToken } = require('../utils/jwt');
const { sendResetPasswordEmail } = require('../utils/mailer');
const {
  findByEmail,
  findByUsername,
  createUser,
  findById,
  setResetToken,
  findByResetTokenHash,
  updatePasswordAndClearToken,
} = require('../models/userModel');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // link đặt lại mật khẩu có hiệu lực 1 giờ

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

// Yêu cầu gửi link đặt lại mật khẩu qua email
async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: 'Email không đúng định dạng' });
  }

  const user = await findByEmail(email.trim());

  // Chỉ thật sự gửi email nếu tài khoản tồn tại, NHƯNG luôn trả về cùng 1 thông điệp
  // cho client dù có hay không - tránh lộ thông tin "email này đã đăng ký chưa"
  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await setResetToken(user.id, tokenHash, expiresAt);

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;
    // In ra console server để tự test được khi máy local chưa cấu hình GMAIL_APP_PASSWORD
    // (không lộ ra ngoài, chỉ người chạy server nhìn thấy)
    console.log(`[forgot-password] Link đặt lại mật khẩu cho ${user.email}: ${resetLink}`);
    try {
      await sendResetPasswordEmail(user.email, resetLink);
    } catch (error) {
      // Lỗi gửi email không nên lộ ra cho client (vẫn trả message chung ở dưới),
      // chỉ log lại để debug phía server
      console.error('Gửi email đặt lại mật khẩu thất bại:', error.message);
    }
  }

  res.json({ message: 'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu' });
}

// Đặt mật khẩu mới bằng token nhận được qua email
async function resetPassword(req, res) {
  const { token, password } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Thiếu token đặt lại mật khẩu' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await findByResetTokenHash(tokenHash);
  if (!user) {
    return res.status(400).json({ message: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await updatePasswordAndClearToken(user.id, passwordHash);

  res.json({ message: 'Đặt lại mật khẩu thành công, hãy đăng nhập bằng mật khẩu mới' });
}

module.exports = { register, login, me, forgotPassword, resetPassword };

const bcrypt = require('bcryptjs');
const { signToken } = require('../utils/jwt');
const {
  findByEmail,
  findByUsername,
  createUser,
  findById,
  updatePassword,
} = require('../models/userModel');
const {
  SECURITY_QUESTIONS,
  normalizeAnswer,
  validateSecurityQuestion,
} = require('../utils/securityQuestions');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Thời hạn token: chọn "Ghi nhớ đăng nhập" thì dài, không chọn thì ngắn
const REMEMBER_EXPIRES_IN = '30d';
const SESSION_EXPIRES_IN = '1d';

// Loại bỏ password + hash câu trả lời bảo mật trước khi trả user về client
function toPublicUser(user) {
  const { password, security_answer, ...publicUser } = user;
  return publicUser;
}

async function register(req, res) {
  const { username, email, password, security_question, security_answer } = req.body;

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
  const questionError = validateSecurityQuestion(security_question, security_answer);
  if (questionError) {
    return res.status(400).json({ message: questionError });
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
  const securityAnswerHash = await bcrypt.hash(normalizeAnswer(security_answer), 10);
  const user = await createUser({
    username: username.trim(),
    email: email.trim(),
    passwordHash,
    securityQuestion: security_question,
    securityAnswerHash,
  });

  res.status(201).json({ message: 'Đăng ký thành công', user: toPublicUser(user) });
}

async function login(req, res) {
  // remember: người dùng tick "Ghi nhớ đăng nhập" -> token sống lâu hơn
  const { email, password, remember } = req.body;

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

  const token = signToken(user, remember ? REMEMBER_EXPIRES_IN : SESSION_EXPIRES_IN);
  res.json({ message: 'Đăng nhập thành công', token, user: toPublicUser(user) });
}

async function me(req, res) {
  // req.user.id lấy từ authMiddleware, truy vấn lại để có dữ liệu mới nhất
  const user = await findById(req.user.id);
  res.json({ user });
}

// GET /api/auth/security-questions - danh sách câu hỏi để chọn (form đăng ký, chỉnh sửa hồ sơ)
function getSecurityQuestions(req, res) {
  res.json({ questions: SECURITY_QUESTIONS });
}

// ===== Quên mật khẩu (2 bước, không cần email) =====
// Thông báo chung cho mọi trường hợp không lấy lại được: không nói rõ là sai email
// hay chưa có câu hỏi, để người ngoài khó dò xem email nào đã đăng ký
const CANNOT_RECOVER_MESSAGE =
  'Không thể khôi phục bằng email này. Email chưa đăng ký hoặc tài khoản chưa thiết lập câu hỏi bảo mật.';

// Bước 1 - POST /api/auth/forgot-password/question { email } -> trả về câu hỏi bảo mật của tài khoản
async function getRecoveryQuestion(req, res) {
  const { email } = req.body;
  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: 'Email không đúng định dạng' });
  }

  const user = await findByEmail(email.trim());
  if (!user || !user.security_question || !user.security_answer || user.status === 'BLOCKED') {
    return res.status(404).json({ message: CANNOT_RECOVER_MESSAGE });
  }

  res.json({ question: user.security_question });
}

// Bước 2 - POST /api/auth/forgot-password/reset { email, answer, new_password }
// Trả lời đúng câu hỏi bảo mật thì được đặt mật khẩu mới (hash bằng bcrypt như lúc đăng ký)
async function resetPasswordWithAnswer(req, res) {
  const { email, answer, new_password } = req.body;
  if (!email || !answer || !new_password) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
  }
  if (new_password.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
  }

  const user = await findByEmail(String(email).trim());
  if (!user || !user.security_answer || user.status === 'BLOCKED') {
    return res.status(404).json({ message: CANNOT_RECOVER_MESSAGE });
  }

  const isCorrect = await bcrypt.compare(normalizeAnswer(answer), user.security_answer);
  if (!isCorrect) {
    return res.status(400).json({ message: 'Câu trả lời bảo mật không đúng' });
  }

  const passwordHash = await bcrypt.hash(new_password, 10);
  await updatePassword(user.id, passwordHash);
  res.json({ message: 'Đặt lại mật khẩu thành công, hãy đăng nhập bằng mật khẩu mới' });
}

module.exports = { register, login, me, getSecurityQuestions, getRecoveryQuestion, resetPasswordWithAnswer };

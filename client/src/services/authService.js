import api from './api'

export function register(data) {
  return api.post('/auth/register', data).then((res) => res.data)
}

export function login(data) {
  return api.post('/auth/login', data).then((res) => res.data)
}

export function getMe() {
  return api.get('/auth/me').then((res) => res.data)
}

// ===== Quên mật khẩu bằng câu hỏi bảo mật =====
export function getSecurityQuestions() {
  return api.get('/auth/security-questions').then((res) => res.data.questions)
}

// Bước 1: lấy câu hỏi bảo mật của tài khoản theo email
export function getRecoveryQuestion(email) {
  return api.post('/auth/forgot-password/question', { email }).then((res) => res.data.question)
}

// Bước 2: trả lời đúng thì đặt mật khẩu mới
export function resetPassword({ email, answer, newPassword }) {
  return api
    .post('/auth/forgot-password/reset', { email, answer, new_password: newPassword })
    .then((res) => res.data)
}

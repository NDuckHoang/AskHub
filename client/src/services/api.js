import axios from 'axios'

// Một instance axios dùng chung cho toàn bộ app.
// baseURL là "/api" -> Vite proxy sẽ chuyển sang http://localhost:5000/api
const api = axios.create({
  baseURL: '/api',
})

// Tự động gắn JWT vào header nếu đã đăng nhập (dùng từ Giai đoạn 3)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api

import axios from 'axios'

// Một instance axios dùng chung cho toàn bộ app.
// Dev: không đặt VITE_API_URL -> dùng "/api", Vite proxy chuyển sang http://localhost:5000/api
// Production (deploy): đặt VITE_API_URL = URL đầy đủ của backend (vd: https://ten-app.up.railway.app/api),
// vì frontend (Vercel) và backend không còn chung domain để proxy được nữa
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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

import axios from 'axios'
import { getToken } from '../utils/tokenStorage'

// Một instance axios dùng chung cho toàn bộ app.
// Dev: không đặt VITE_API_URL -> dùng "/api", Vite proxy chuyển sang http://localhost:5000/api
// Production (deploy): đặt VITE_API_URL = URL đầy đủ của backend (vd: https://ten-app.up.railway.app/api),
// vì frontend (Vercel) và backend không còn chung domain để proxy được nữa
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

// Tự động gắn JWT vào header nếu đã đăng nhập (dùng từ Giai đoạn 3)
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Gọi lại 1 lần cho request GET bị lỗi server (5xx), sau RETRY_DELAY_MS.
// Backend trên Vercel đôi khi lỗi thoáng qua khi nhiều request tới database cùng lúc;
// gọi lại GET là an toàn vì chỉ đọc dữ liệu. POST/PUT/DELETE KHÔNG gọi lại để tránh thao tác 2 lần.
const RETRY_DELAY_MS = 400

api.interceptors.response.use(undefined, async (error) => {
  const { config, response } = error
  const isServerError = response && response.status >= 500
  if (config && config.method === 'get' && isServerError && !config._retried) {
    config._retried = true
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
    return api(config)
  }
  return Promise.reject(error)
})

export default api

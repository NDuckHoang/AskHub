import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Chuyển các request /api và /uploads sang backend Express (cổng 5000)
    // nhờ vậy frontend gọi "/api/..." hoặc hiển thị ảnh "/uploads/..." mà không bị lỗi CORS khi dev
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
})

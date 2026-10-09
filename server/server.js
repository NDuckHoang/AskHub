// Đọc biến môi trường từ file .env trước khi load các file khác
require('dotenv').config({ quiet: true });

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await testConnection();
    console.log('Đã kết nối MySQL thành công');
  } catch (error) {
    // Vẫn cho server chạy để dễ debug, nhưng báo lỗi rõ ràng
    console.error('Không kết nối được MySQL:', error.message);
  }

  app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
  });
}

startServer();

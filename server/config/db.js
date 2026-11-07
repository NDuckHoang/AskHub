const mysql = require('mysql2/promise');

// Aiven (và nhiều MySQL cloud khác) yêu cầu kết nối qua SSL.
// DB_SSL=true -> bật SSL. rejectUnauthorized: false để đơn giản (không cần quản lý file CA cert),
// vẫn mã hóa đường truyền, phù hợp với mức độ dự án sinh viên.
const useSSL = process.env.DB_SSL === 'true';

// Số kết nối tối đa của pool.
// Trên Vercel (serverless), mỗi lúc đông request Vercel bật NHIỀU bản backend chạy song song và mỗi bản
// có pool riêng -> 10 kết nối/bản sẽ nhanh chóng vượt giới hạn kết nối của gói MySQL Aiven miễn phí,
// làm request bị lỗi 500 ngẫu nhiên. Vì vậy trên Vercel chỉ giữ 2 kết nối/bản (request dư sẽ xếp hàng chờ).
// Vercel tự đặt biến môi trường VERCEL=1, không cần cấu hình thêm. Chạy ở máy cá nhân vẫn dùng 10.
const isServerless = Boolean(process.env.VERCEL);
const CONNECTION_LIMIT = isServerless ? 2 : 10;

// Tạo connection pool tới MySQL.
// Pool giữ sẵn một vài kết nối và tái sử dụng chúng, nhanh hơn mở kết nối mới mỗi request.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: CONNECTION_LIMIT,
  maxIdle: CONNECTION_LIMIT,
  // Đóng kết nối rảnh sau 5 giây trên Vercel để trả lại "suất" kết nối cho các bản backend khác
  idleTimeout: isServerless ? 5000 : 60000,
  charset: 'utf8mb4', // hỗ trợ tiếng Việt đầy đủ
  dateStrings: false,
  ssl: useSSL ? { rejectUnauthorized: false } : undefined,
});

// Hàm kiểm tra kết nối, dùng khi khởi động server và trong /api/health
async function testConnection() {
  const connection = await pool.getConnection();
  await connection.query('SELECT 1');
  connection.release();
}

module.exports = { pool, testConnection };

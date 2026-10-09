const mysql = require('mysql2/promise');

// Tạo connection pool tới MySQL.
// Pool giữ sẵn một vài kết nối và tái sử dụng chúng, nhanh hơn mở kết nối mới mỗi request.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4', // hỗ trợ tiếng Việt đầy đủ
  dateStrings: false,
});

// Hàm kiểm tra kết nối, dùng khi khởi động server và trong /api/health
async function testConnection() {
  const connection = await pool.getConnection();
  await connection.query('SELECT 1');
  connection.release();
}

module.exports = { pool, testConnection };

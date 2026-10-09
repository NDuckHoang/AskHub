# AskHub – Hệ thống hỏi đáp trực tuyến

Diễn đàn hỏi đáp lập trình (ReactJS + Node.js/Express + MySQL).

> README đầy đủ sẽ được hoàn thiện ở Giai đoạn 12.

## Cài đặt nhanh

Yêu cầu: Node.js 18+, MySQL 8 (hoặc MariaDB 10.6+).

```bash
# 1. Tạo database
mysql -u root -p < database/schema.sql

# 2. Backend
cd server
cp .env.example .env      # sửa DB_USER, DB_PASSWORD cho đúng máy
npm install
npm run dev               # http://localhost:5000

# 3. Frontend (mở terminal khác)
cd client
npm install
npm run dev               # http://localhost:5173
```

Kiểm tra: mở http://localhost:5173 – trang sẽ báo backend và MySQL đã kết nối.

-- ============================================================
-- Cập nhật database ĐANG CÓ DỮ LIỆU để hỗ trợ "Quên mật khẩu" bằng câu hỏi bảo mật.
-- Chỉ thêm 2 cột (cho phép NULL), không xóa/sửa dữ liệu cũ.
-- (Nếu tạo database mới từ schema.sql thì KHÔNG cần chạy file này - schema.sql đã có 2 cột.)
--
-- Cách chạy: mysql -u root -p qa_forum -e "source database/add_security_question.sql"
-- ============================================================

ALTER TABLE users
  ADD COLUMN security_question VARCHAR(255) DEFAULT NULL AFTER password,
  ADD COLUMN security_answer   VARCHAR(255) DEFAULT NULL AFTER security_question;

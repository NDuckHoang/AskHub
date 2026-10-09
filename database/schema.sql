-- ============================================================
-- Schema database cho AskHub (Giai đoạn 2)
-- Chạy file này để tạo lại toàn bộ database + dữ liệu mẫu:
--   mysql -u root -p < database/schema.sql
-- ============================================================

DROP DATABASE IF EXISTS qa_forum;

CREATE DATABASE qa_forum
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE qa_forum;

-- ============================================================
-- BẢNG users
-- ============================================================
CREATE TABLE users (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(30)  NOT NULL UNIQUE,
  email       VARCHAR(190) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,          -- lưu hash bcrypt, không lưu plaintext
  role        ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
  avatar      VARCHAR(500) DEFAULT NULL,
  bio         VARCHAR(500) DEFAULT NULL,       -- giới thiệu bản thân / tiểu sử
  gender      ENUM('MALE', 'FEMALE', 'OTHER') DEFAULT NULL,
  contact     VARCHAR(255) DEFAULT NULL,       -- số điện thoại, link liên hệ...
  reputation  INT NOT NULL DEFAULT 0,
  status      ENUM('ACTIVE', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- BẢNG categories
-- ============================================================
CREATE TABLE categories (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) DEFAULT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- BẢNG questions
-- ============================================================
CREATE TABLE questions (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED DEFAULT NULL,
  title       VARCHAR(255) NOT NULL,
  content     TEXT NOT NULL,
  views       INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_questions_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_questions_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,

  FULLTEXT INDEX ft_questions_title_content (title, content),
  INDEX idx_questions_category (category_id),
  INDEX idx_questions_user (user_id),
  INDEX idx_questions_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================
-- BẢNG tags
-- ============================================================
CREATE TABLE tags (
  id   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ============================================================
-- BẢNG question_tags (bảng trung gian n-n)
-- ============================================================
CREATE TABLE question_tags (
  question_id BIGINT UNSIGNED NOT NULL,
  tag_id      BIGINT UNSIGNED NOT NULL,

  PRIMARY KEY (question_id, tag_id),
  CONSTRAINT fk_question_tags_question
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  CONSTRAINT fk_question_tags_tag
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- BẢNG answers
-- ============================================================
CREATE TABLE answers (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question_id BIGINT UNSIGNED NOT NULL,
  user_id     BIGINT UNSIGNED NOT NULL,
  content     TEXT NOT NULL,
  is_accepted TINYINT(1) NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_answers_question
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  CONSTRAINT fk_answers_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_answers_question (question_id),
  INDEX idx_answers_user (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- BẢNG comments
-- Một comment thuộc về MỘT question HOẶC MỘT answer (không phải cả hai)
-- ============================================================
CREATE TABLE comments (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  question_id BIGINT UNSIGNED DEFAULT NULL,
  answer_id   BIGINT UNSIGNED DEFAULT NULL,
  content     VARCHAR(1000) NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_comments_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_question
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_answer
    FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE,
  CONSTRAINT chk_comments_target
    CHECK (
      (question_id IS NOT NULL AND answer_id IS NULL) OR
      (question_id IS NULL AND answer_id IS NOT NULL)
    ),

  INDEX idx_comments_question (question_id),
  INDEX idx_comments_answer (answer_id)
) ENGINE=InnoDB;

-- ============================================================
-- BẢNG votes
-- Một vote thuộc về MỘT question HOẶC MỘT answer (không phải cả hai)
-- Mỗi user chỉ được vote 1 lần cho 1 question/answer (unique key)
-- ============================================================
CREATE TABLE votes (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  question_id BIGINT UNSIGNED DEFAULT NULL,
  answer_id   BIGINT UNSIGNED DEFAULT NULL,
  vote_type   TINYINT NOT NULL,                -- 1 = upvote, -1 = downvote
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_votes_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_votes_question
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  CONSTRAINT fk_votes_answer
    FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE,
  CONSTRAINT chk_votes_target
    CHECK (
      (question_id IS NOT NULL AND answer_id IS NULL) OR
      (question_id IS NULL AND answer_id IS NOT NULL)
    ),
  CONSTRAINT chk_votes_type
    CHECK (vote_type IN (1, -1)),

  -- Một user chỉ vote 1 lần cho 1 question (MySQL coi nhiều NULL là khác nhau
  -- nên các dòng vote cho answer, có question_id = NULL, không bị chặn ở đây)
  UNIQUE KEY uniq_user_question (user_id, question_id),
  UNIQUE KEY uniq_user_answer (user_id, answer_id)
) ENGINE=InnoDB;

-- ============================================================
-- BẢNG reports
-- Báo cáo vi phạm cho câu hỏi/trả lời/bình luận. target_id tham chiếu tới
-- 1 trong 3 bảng tùy target_type (không đặt FK trực tiếp vì là tham chiếu
-- đa hình - kiểm tra tồn tại ở tầng ứng dụng khi tạo report)
-- ============================================================
CREATE TABLE reports (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reporter_id   BIGINT UNSIGNED NOT NULL,
  target_type   ENUM('QUESTION', 'ANSWER', 'COMMENT') NOT NULL,
  target_id     BIGINT UNSIGNED NOT NULL,
  reason        VARCHAR(500) NOT NULL,
  status        ENUM('PENDING', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'PENDING',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at   TIMESTAMP NULL DEFAULT NULL,
  resolved_by   BIGINT UNSIGNED NULL DEFAULT NULL,

  CONSTRAINT fk_reports_reporter
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_resolved_by
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_reports_status (status),
  INDEX idx_reports_target (target_type, target_id)
) ENGINE=InnoDB;

-- ============================================================
-- BẢNG saved_questions
-- Câu hỏi user đánh dấu lưu lại để xem sau (không phải vote, không ảnh hưởng reputation)
-- ============================================================
CREATE TABLE saved_questions (
  user_id       BIGINT UNSIGNED NOT NULL,
  question_id   BIGINT UNSIGNED NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id, question_id),
  CONSTRAINT fk_saved_questions_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_saved_questions_question
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- BẢNG notifications
-- Thông báo đơn giản: trả lời mới, câu trả lời được chấp nhận, bình luận mới.
-- Không gửi email, không realtime (frontend tự poll định kỳ).
-- ============================================================
CREATE TABLE notifications (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL COMMENT 'Người nhận thông báo',
  actor_id      BIGINT UNSIGNED NOT NULL COMMENT 'Người gây ra hành động',
  type          ENUM('NEW_ANSWER', 'ANSWER_ACCEPTED', 'NEW_COMMENT') NOT NULL,
  question_id   BIGINT UNSIGNED NOT NULL COMMENT 'Câu hỏi liên quan, dùng để điều hướng',
  is_read       TINYINT(1) NOT NULL DEFAULT 0,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_actor
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_question
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,

  INDEX idx_notifications_user (user_id, is_read, created_at)
) ENGINE=InnoDB;

-- ============================================================
-- DỮ LIỆU MẪU
-- ============================================================

-- ----- users -----
-- Mật khẩu demo cho tất cả tài khoản mẫu: password123
-- (hash bcrypt, cost = 10)
INSERT INTO users (username, email, password, role, reputation, status) VALUES
('admin',      'admin@askhub.vn',       '$2b$10$naCTHzouzDsqg58E2X591uROtKgwxAq1lpdkFtWEi.hyYvzMyF8iu', 'ADMIN', 500, 'ACTIVE'),
('nguyenvana', 'nguyenvana@gmail.com',  '$2b$10$naCTHzouzDsqg58E2X591uROtKgwxAq1lpdkFtWEi.hyYvzMyF8iu', 'USER',  120, 'ACTIVE'),
('tranthib',   'tranthib@gmail.com',    '$2b$10$naCTHzouzDsqg58E2X591uROtKgwxAq1lpdkFtWEi.hyYvzMyF8iu', 'USER',  85,  'ACTIVE'),
('levanc',     'levanc@gmail.com',      '$2b$10$naCTHzouzDsqg58E2X591uROtKgwxAq1lpdkFtWEi.hyYvzMyF8iu', 'USER',  64,  'ACTIVE'),
('phamthid',   'phamthid@gmail.com',    '$2b$10$naCTHzouzDsqg58E2X591uROtKgwxAq1lpdkFtWEi.hyYvzMyF8iu', 'USER',  210, 'ACTIVE'),
('hoangvane',  'hoangvane@gmail.com',   '$2b$10$naCTHzouzDsqg58E2X591uROtKgwxAq1lpdkFtWEi.hyYvzMyF8iu', 'USER',  45,  'ACTIVE'),
('dothif',     'dothif@gmail.com',      '$2b$10$naCTHzouzDsqg58E2X591uROtKgwxAq1lpdkFtWEi.hyYvzMyF8iu', 'USER',  30,  'BLOCKED'),
('buiminhg',   'buiminhg@gmail.com',    '$2b$10$naCTHzouzDsqg58E2X591uROtKgwxAq1lpdkFtWEi.hyYvzMyF8iu', 'USER',  98,  'ACTIVE');

-- id: 1 admin, 2 nguyenvana, 3 tranthib, 4 levanc, 5 phamthid, 6 hoangvane, 7 dothif, 8 buiminhg

-- ----- categories -----
INSERT INTO categories (name, description) VALUES
('Java',       'Hỏi đáp về ngôn ngữ Java, hướng đối tượng, Spring, JVM'),
('JavaScript', 'Hỏi đáp về JavaScript, ES6+, DOM, các thư viện phía trình duyệt'),
('ReactJS',    'Thư viện xây dựng giao diện người dùng, component, hooks'),
('NodeJS',     'JavaScript phía server, Express, npm, xử lý bất đồng bộ'),
('C/C++',      'Ngôn ngữ lập trình hệ thống, con trỏ, cấu trúc dữ liệu & giải thuật'),
('Python',     'Ngôn ngữ lập trình đa dụng, scripting, xử lý dữ liệu'),
('Database',   'Thiết kế cơ sở dữ liệu, SQL, MySQL, tối ưu truy vấn'),
('HTML/CSS',   'Markup, CSS, layout, responsive design'),
('Git/GitHub', 'Quản lý phiên bản mã nguồn, quy trình làm việc nhóm'),
('Khác',       'Các câu hỏi không thuộc danh mục cụ thể nào ở trên');

-- id: 1 Java, 2 JavaScript, 3 ReactJS, 4 NodeJS, 5 C/C++, 6 Python, 7 Database, 8 HTML/CSS, 9 Git/GitHub, 10 Khác

-- ----- tags -----
INSERT INTO tags (name) VALUES
('javascript'), ('reactjs'), ('nodejs'), ('express'), ('jwt'), ('mysql'),
('java'), ('python'), ('cpp'), ('c'), ('css'), ('html'),
('git'), ('github'), ('hooks'), ('async-await'), ('sql'), ('oop');

-- id: 1 javascript, 2 reactjs, 3 nodejs, 4 express, 5 jwt, 6 mysql,
--     7 java, 8 python, 9 cpp, 10 c, 11 css, 12 html,
--     13 git, 14 github, 15 hooks, 16 async-await, 17 sql, 18 oop

-- ----- questions -----
INSERT INTO questions (user_id, category_id, title, content, views, created_at) VALUES
(3, 3, 'Làm thế nào để sử dụng useEffect trong React?',
 'Mình mới học React và chưa hiểu rõ khi nào useEffect sẽ chạy lại. Mình có một component gọi API trong useEffect nhưng nó bị gọi lại liên tục mỗi khi component render. Có ai giải thích giúp mình về dependency array và cách tránh vòng lặp vô hạn này không?',
 145, '2026-09-20 09:15:00'),

(4, 4, 'Tại sao Node.js sử dụng Event Loop?',
 'Mình nghe nói Node.js là single-thread nhưng vẫn xử lý được nhiều request đồng thời nhờ Event Loop. Cơ chế này hoạt động cụ thể như thế nào, và tại sao code bất đồng bộ (như đọc file, gọi database) không làm block toàn bộ server?',
 98, '2026-09-20 14:30:00'),

(5, 7, 'Sự khác nhau giữa INNER JOIN và LEFT JOIN?',
 'Mình đang làm báo cáo thống kê, cần join hai bảng orders và customers. Dùng INNER JOIN thì mất một số khách hàng chưa có đơn hàng nào. Vậy LEFT JOIN khác INNER JOIN ở điểm nào và khi nào nên dùng loại nào cho đúng?',
 210, '2026-09-21 08:05:00'),

(6, 3, 'Làm thế nào để kết nối React với Express?',
 'Mình làm frontend bằng React (Vite) và backend bằng Express chạy ở port riêng. Khi gọi axios từ React sang Express thì bị lỗi CORS. Mình nên cấu hình proxy trong Vite hay bật CORS ở Express, cách nào hợp lý hơn cho dự án thật?',
 176, '2026-09-21 19:40:00'),

(7, 4, 'JWT hoạt động như thế nào?',
 'Mình hiểu JWT dùng để xác thực người dùng sau khi login, nhưng không rõ bên trong token chứa gì và tại sao server không cần lưu session mà vẫn biết user đó là ai. Có ai giải thích cấu trúc 3 phần của JWT giúp mình không?',
 302, '2026-09-22 10:12:00'),

(8, 2, 'Sự khác nhau giữa var, let và const trong JavaScript?',
 'Mình thấy code cũ toàn dùng var, code mới thì dùng let và const. Ngoài phạm vi block scope thì chúng còn khác nhau ở điểm nào về hoisting và khả năng gán lại giá trị?',
 89, '2026-09-22 15:50:00'),

(2, 2, 'Cách xử lý bất đồng bộ với async/await trong JavaScript?',
 'Mình đang quen dùng .then().catch() nhưng thấy code của đồng nghiệp toàn viết async/await trông gọn hơn nhiều. Cú pháp này thực chất là gì, có thay thế hoàn toàn Promise không và lỗi thì bắt bằng try/catch đúng không?',
 134, '2026-09-23 09:00:00'),

(3, 3, 'useState và useReducer khác nhau như thế nào?',
 'Component của mình có khá nhiều state liên quan đến nhau (loading, data, error). Mình nên tiếp tục dùng nhiều useState hay chuyển sang useReducer? Khi nào thì useReducer thực sự cần thiết?',
 72, '2026-09-23 20:25:00'),

(4, 3, 'Làm sao để tránh re-render thừa trong React?',
 'App của mình có một list khá dài, mỗi lần component cha re-render thì toàn bộ list con cũng render lại dù props không đổi, gây giật khi gõ vào ô tìm kiếm. Mình nên dùng React.memo, useMemo hay useCallback ở trường hợp này?',
 118, '2026-09-24 11:35:00'),

(5, 4, 'Middleware trong Express hoạt động như thế nào?',
 'Mình thấy trong Express hay viết app.use(middleware) trước khi khai báo route. Middleware này được gọi theo thứ tự nào, và làm sao để viết một middleware kiểm tra JWT trước khi cho vào route cần đăng nhập?',
 156, '2026-09-24 16:45:00'),

(6, 1, 'Sự khác nhau giữa ArrayList và LinkedList trong Java?',
 'Thầy mình nói ArrayList và LinkedList đều implement interface List nhưng hiệu năng khác nhau tùy thao tác. Cụ thể thao tác thêm/xóa ở giữa danh sách và truy cập theo index thì loại nào nhanh hơn và tại sao?',
 61, '2026-09-25 08:50:00'),

(7, 1, 'Khi nào nên dùng interface, khi nào nên dùng abstract class trong Java?',
 'Mình học OOP thấy cả interface và abstract class đều không thể tạo instance trực tiếp. Vậy trong thiết kế thực tế, khi nào nên chọn interface, khi nào nên chọn abstract class cho hợp lý?',
 54, '2026-09-25 13:20:00'),

(8, 6, 'Cách quản lý virtual environment trong Python?',
 'Mình làm nhiều project Python trên cùng một máy, mỗi project lại cần version thư viện khác nhau nên hay bị xung đột. venv và virtualenv khác nhau thế nào, và quy trình tạo/kích hoạt môi trường ảo đúng cách là gì?',
 43, '2026-09-26 09:10:00'),

(2, 6, 'List comprehension trong Python hoạt động như thế nào?',
 'Mình thấy code Python hay viết [x*2 for x in range(10)] thay vì for loop thông thường. Cú pháp list comprehension này hoạt động ra sao và có nên dùng cho mọi trường hợp lọc/biến đổi danh sách không?',
 37, '2026-09-26 17:55:00'),

(3, 5, 'Con trỏ (pointer) trong C hoạt động như thế nào?',
 'Mình học C và bị rối với khái niệm con trỏ. Tại sao phải dùng con trỏ thay vì truyền biến trực tiếp vào hàm, và sự khác nhau giữa *p và &p là gì? Có ai cho ví dụ dễ hiểu không?',
 88, '2026-09-27 10:30:00'),

(4, 5, 'Sự khác nhau giữa struct và class trong C++?',
 'Mình đọc tài liệu thấy struct và class trong C++ gần như giống nhau, chỉ khác default access modifier. Vậy trong thực tế lập trình thì nên dùng struct hay class, và có nên dùng struct như một class rút gọn không?',
 29, '2026-09-27 15:05:00'),

(5, 7, 'Index trong MySQL có thực sự giúp tăng tốc truy vấn?',
 'Bảng questions của mình có vài trăm nghìn dòng, truy vấn tìm theo category_id đang khá chậm. Mình nghe nói nên tạo index cho cột này, nhưng tạo index nhiều quá có ảnh hưởng đến tốc độ ghi dữ liệu không?',
 204, '2026-09-28 09:45:00'),

(6, 8, 'Flexbox và Grid trong CSS khác nhau thế nào?',
 'Mình làm layout cho trang danh sách câu hỏi, lúc dùng Flexbox lúc dùng Grid nhưng không chắc khi nào nên chọn loại nào. Có quy tắc chung nào để quyết định dùng Flexbox hay CSS Grid cho một layout không?',
 67, '2026-09-28 20:15:00'),

(7, 8, 'Sự khác nhau giữa position relative và absolute trong CSS?',
 'Mình muốn đặt một badge nhỏ ở góc trên bên phải của avatar nhưng dùng position: absolute thì nó bị lệch ra ngoài toàn trang thay vì nằm trong avatar. Mình đang hiểu sai gì về relative và absolute?',
 95, '2026-09-29 11:00:00'),

(8, 9, 'Rebase và merge trong Git khác nhau như thế nào?',
 'Nhóm mình làm project có nhiều branch, lúc merge vào main thì lịch sử commit rất lộn xộn. Có người bảo nên rebase trước khi merge. Rebase và merge khác nhau ở điểm nào và dùng cái nào thì an toàn hơn khi làm nhóm?',
 112, '2026-09-29 21:40:00');

-- id câu hỏi theo thứ tự chèn: 1..20

-- ----- question_tags -----
INSERT INTO question_tags (question_id, tag_id) VALUES
(1, 2), (1, 15),
(2, 3), (2, 16),
(3, 17), (3, 6),
(4, 2), (4, 3), (4, 4),
(5, 3), (5, 5),
(6, 1),
(7, 1), (7, 16),
(8, 2), (8, 15),
(9, 2), (9, 15),
(10, 3), (10, 4),
(11, 7), (11, 18),
(12, 7), (12, 18),
(13, 8),
(14, 8),
(15, 10),
(16, 9), (16, 18),
(17, 6), (17, 17),
(18, 11),
(19, 11),
(20, 13), (20, 14);

-- ----- answers -----
INSERT INTO answers (question_id, user_id, content, is_accepted, created_at) VALUES
(1, 2, 'Dependency array chính là danh sách giá trị mà useEffect sẽ theo dõi. Nếu để trống [] thì effect chỉ chạy đúng 1 lần sau khi component mount. Nếu không truyền array thì effect chạy lại sau mỗi lần render, đó là lý do API của bạn bị gọi liên tục. Hãy truyền đúng các state/props mà effect phụ thuộc vào trong array đó.', 1, '2026-09-20 10:00:00'),
(1, 5, 'Bổ sung thêm là nếu bạn gọi API và set state ngay trong effect mà không có dependency array, React sẽ render lại -> effect chạy lại -> set state -> render lại, tạo vòng lặp vô hạn. Nhớ thêm cleanup function nếu cần hủy request khi component unmount.', 0, '2026-09-20 11:20:00'),

(2, 6, 'Event Loop liên tục kiểm tra hàng đợi callback (callback queue). Khi bạn gọi các tác vụ I/O như đọc file hay query database, Node.js giao việc đó cho libuv xử lý ở background, main thread không bị chặn và tiếp tục xử lý request khác. Khi tác vụ I/O xong, callback được đưa vào queue để Event Loop thực thi khi có cơ hội.', 1, '2026-09-20 15:10:00'),

(3, 7, 'INNER JOIN chỉ trả về các dòng có dữ liệu khớp ở cả hai bảng. LEFT JOIN trả về toàn bộ dòng của bảng bên trái (customers), nếu không có đơn hàng khớp ở bảng bên phải (orders) thì các cột của orders sẽ là NULL. Vì bạn cần thống kê cả khách hàng chưa có đơn hàng, LEFT JOIN từ customers sang orders là lựa chọn đúng.', 1, '2026-09-21 09:30:00'),

(4, 2, 'Trong môi trường dev, cách đơn giản nhất là cấu hình proxy trong vite.config.js để chuyển các request /api sang Express, như vậy request vẫn cùng origin nên không bị CORS. Khi deploy thật thì bạn vẫn nên bật CORS ở Express và chỉ cho phép đúng domain frontend của bạn, không nên mở "*".', 0, '2026-09-21 20:30:00'),

(5, 3, 'JWT gồm 3 phần ngăn cách bởi dấu chấm: header (thuật toán mã hóa), payload (dữ liệu như user id, role) và signature (chữ ký để xác minh token không bị sửa đổi). Server dùng secret key để tạo signature khi login và kiểm tra lại signature ở mỗi request, nên không cần lưu session, chỉ cần verify token là biết token hợp lệ hay không.', 1, '2026-09-22 11:05:00'),
(5, 8, 'Thêm một điểm quan trọng: payload trong JWT KHÔNG được mã hóa, chỉ encode base64, nên đừng bao giờ để password hay dữ liệu nhạy cảm trong đó, ai cũng decode đọc được.', 0, '2026-09-22 12:40:00'),

(6, 4, 'var có function scope và bị hoisting lên đầu function (giá trị undefined trước khi gán). let và const có block scope, không thể dùng trước khi khai báo (temporal dead zone). const không cho gán lại tham chiếu, nhưng nếu giá trị là object/array thì vẫn sửa được thuộc tính bên trong.', 1, '2026-09-22 16:40:00'),

(7, 5, 'async/await chỉ là cách viết dễ đọc hơn cho Promise, bên dưới vẫn chạy bất đồng bộ như .then(). await sẽ "chờ" Promise resolve rồi mới chạy dòng tiếp theo trong hàm async, và đúng là bạn nên dùng try/catch để bắt lỗi thay cho .catch().', 1, '2026-09-23 10:15:00'),

(8, 6, 'Nếu các state độc lập nhau thì nhiều useState vẫn ổn. useReducer thực sự hữu ích khi các state thay đổi cùng lúc theo một logic chung (ví dụ loading/data/error đổi theo từng action như FETCH_START, FETCH_SUCCESS, FETCH_ERROR), giúp logic cập nhật state tập trung một chỗ dễ kiểm soát hơn.', 0, '2026-09-23 21:00:00'),

(9, 7, 'React.memo giúp component con không render lại nếu props không đổi (so sánh shallow). useCallback giữ nguyên tham chiếu hàm giữa các lần render để tránh làm props của component con "trông như thay đổi". useMemo dùng để cache kết quả tính toán nặng. Với list dài, kết hợp React.memo cho item + useCallback cho hàm xử lý sự kiện thường giải quyết được vấn đề giật khi gõ.', 1, '2026-09-24 12:50:00'),

(10, 8, 'Middleware trong Express chạy theo đúng thứ tự bạn khai báo, mỗi middleware gọi next() để chuyển sang middleware/route tiếp theo. Bạn có thể viết một hàm authMiddleware kiểm tra header Authorization, verify JWT, nếu hợp lệ thì gắn thông tin user vào req.user rồi gọi next(), nếu không hợp lệ thì trả lỗi 401 luôn, không gọi next().', 0, '2026-09-24 18:00:00'),

(11, 2, 'ArrayList lưu dữ liệu dạng mảng động nên truy cập theo index rất nhanh (O(1)) nhưng thêm/xóa ở giữa danh sách phải dịch chuyển phần tử (O(n)). LinkedList lưu dạng danh sách liên kết, thêm/xóa ở đầu hoặc giữa nhanh hơn (O(1) nếu đã có con trỏ tới vị trí đó) nhưng truy cập theo index phải đi từng node (O(n)). Nếu chủ yếu đọc theo index thì dùng ArrayList, nếu thêm/xóa nhiều thì LinkedList.', 1, '2026-09-25 09:40:00'),

(13, 3, 'venv là module có sẵn trong Python 3 (không cần cài thêm), còn virtualenv là package riêng hỗ trợ cả Python 2. Quy trình cơ bản: python -m venv venv để tạo, sau đó activate (source venv/bin/activate trên Linux/Mac hoặc venv\\Scripts\\activate trên Windows), rồi pip install các thư viện cần cho riêng project đó.', 0, '2026-09-26 10:05:00'),

(14, 4, 'List comprehension thực chất là cú pháp rút gọn cho vòng for tạo list mới, [bieu_thuc for x in iterable if dieu_kien]. Nó thường nhanh hơn và ngắn hơn for loop thông thường, nhưng nếu logic quá phức tạp hoặc lồng nhiều điều kiện thì nên dùng for loop bình thường cho dễ đọc, không nên cố nhồi hết vào một dòng.', 1, '2026-09-26 19:10:00'),

(15, 5, 'Con trỏ là một biến lưu địa chỉ ô nhớ của biến khác. &p lấy địa chỉ của p, còn *p (khi p là con trỏ) lấy giá trị tại địa chỉ mà p đang trỏ tới. Truyền con trỏ vào hàm cho phép hàm đó sửa trực tiếp giá trị gốc, khác với truyền giá trị thông thường chỉ tạo ra một bản sao bên trong hàm.', 0, '2026-09-27 11:45:00'),

(17, 6, 'Index giúp MySQL tìm dữ liệu nhanh hơn nhiều vì không phải quét toàn bảng (full table scan), đặc biệt rõ với bảng vài trăm nghìn dòng trở lên. Đổi lại, mỗi lần INSERT/UPDATE/DELETE, MySQL phải cập nhật thêm cả index nên có thể chậm hơn một chút. Với cột category_id dùng để filter thường xuyên như của bạn, tạo index là hợp lý.', 1, '2026-09-28 10:30:00'),
(17, 7, 'Thêm ý: nếu câu query của bạn vừa WHERE category_id vừa ORDER BY created_at, có thể xem xét tạo composite index (category_id, created_at) để tối ưu hơn là 2 index riêng lẻ.', 0, '2026-09-28 11:00:00'),

(18, 8, 'Flexbox phù hợp cho layout theo 1 chiều (hàng hoặc cột), ví dụ thanh navbar, danh sách thẻ tag. CSS Grid phù hợp cho layout 2 chiều phức tạp hơn, ví dụ chia trang thành vùng header/sidebar/content/footer. Với trang danh sách câu hỏi có main content + sidebar như AskHub, Grid thường dễ kiểm soát hơn Flexbox.', 1, '2026-09-28 21:00:00'),

(20, 2, 'merge sẽ tạo thêm một commit merge, giữ nguyên lịch sử của cả 2 branch (an toàn hơn, không viết lại lịch sử). rebase sẽ "gắn" các commit của branch bạn lên trên đầu branch main, làm lịch sử thẳng hàng, dễ đọc hơn nhưng viết lại lịch sử commit. Khi làm nhóm, chỉ nên rebase trên branch riêng của mình, KHÔNG rebase branch đã push chung cho người khác để tránh làm rối lịch sử của họ.', 1, '2026-09-30 08:20:00');

-- ----- comments -----
INSERT INTO comments (user_id, question_id, answer_id, content) VALUES
(4, 1, NULL, 'Bạn thử kiểm tra lại dependency array xem có thiếu state nào không, trường hợp của mình cũng từng bị giống vậy.'),
(7, NULL, 1,  'Cảm ơn bạn, mình đã hiểu rõ hơn về cleanup function rồi.'),
(8, 3, NULL, 'Mình cũng từng nhầm giữa hai loại JOIN này, câu trả lời của bạn rất rõ ràng.'),
(4, NULL, 5,  'Vậy JWT lưu ở localStorage có an toàn không bạn, hay nên lưu ở cookie?'),
(2, 17, NULL, 'Bảng của mình có vài triệu dòng, không biết nên tạo index ở cột nào thì hợp lý nhất.');

-- ----- votes -----
-- Vote cho question
INSERT INTO votes (user_id, question_id, answer_id, vote_type) VALUES
(2, 1, NULL, 1), (4, 1, NULL, 1), (5, 1, NULL, 1), (6, 1, NULL, -1),
(3, 2, NULL, 1), (5, 2, NULL, 1), (7, 2, NULL, 1),
(2, 3, NULL, 1), (4, 3, NULL, 1), (6, 3, NULL, 1), (8, 3, NULL, 1),
(3, 4, NULL, 1), (7, 4, NULL, -1),
(2, 5, NULL, 1), (4, 5, NULL, 1), (6, 5, NULL, 1), (8, 5, NULL, 1), (3, 5, NULL, 1),
(5, 6, NULL, 1), (7, 6, NULL, 1),
(3, 7, NULL, 1), (6, 7, NULL, 1), (8, 7, NULL, 1),
(2, 8, NULL, 1), (5, 8, NULL, -1),
(4, 9, NULL, 1), (6, 9, NULL, 1),
(3, 10, NULL, 1), (7, 10, NULL, 1),
(5, 11, NULL, 1), (8, 11, NULL, 1),
(2, 12, NULL, -1);

-- Vote cho answer
INSERT INTO votes (user_id, question_id, answer_id, vote_type) VALUES
(4, NULL, 1, 1), (6, NULL, 1, 1), (7, NULL, 1, 1),
(3, NULL, 3, 1), (8, NULL, 3, 1),
(2, NULL, 4, 1), (5, NULL, 4, 1),
(4, NULL, 6, 1), (8, NULL, 6, 1),
(7, NULL, 8, 1),
(2, NULL, 9, 1),
(6, NULL, 13, 1),
(3, NULL, 15, 1),
(8, NULL, 17, 1),
(2, NULL, 19, 1),
(5, NULL, 20, 1), (7, NULL, 20, -1);

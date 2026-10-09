# AskHub – Yêu cầu dự án

Bạn là một lập trình viên Full-stack có kinh nghiệm với ReactJS, Node.js và MySQL.

Hãy giúp tôi xây dựng hoàn chỉnh một website:

# HỆ THỐNG HỎI ĐÁP TRỰC TUYẾN (Q&A)

Đề bài:

"Diễn đàn hỏi đáp như Stack Overflow."

Các chức năng bắt buộc:

* Người dùng đăng câu hỏi.
* Người dùng trả lời câu hỏi.
* Người dùng bình luận.
* Tìm kiếm câu hỏi theo danh mục và từ khóa.
* Bình chọn câu hỏi/trả lời (upvote/downvote).
* Hệ thống phân quyền Admin và Người dùng.
* Thống kê câu hỏi theo chủ đề.

---

# 1. CÔNG NGHỆ

Bắt buộc sử dụng:

Frontend:

* ReactJS
* JavaScript
* React Router
* CSS thuần
* Axios
* lucide-react (icon)

Backend:

* Node.js
* Express.js
* RESTful API
* JWT
* bcrypt/bcryptjs

Database:

* MySQL

Không sử dụng TypeScript.

Không dùng Next.js.

Không dùng Firebase.

Không dùng MongoDB.

Không dùng Redux nếu Context API là đủ.

---

# 2. ĐIỀU QUAN TRỌNG NHẤT: GIAO DIỆN

Giao diện phải **hiện đại, sạch, chuyên nghiệp** — kiểu sản phẩm dành cho developer năm 2025–2026.

Tham khảo tinh thần (KHÔNG sao chép): GitHub, Linear, Vercel docs, dev.to.

Đẹp nhờ **typography, khoảng cách, sự nhất quán** — không nhờ hiệu ứng.

Có thể lấy cảm hứng từ bố cục của Stack Overflow nhưng:

* KHÔNG sao chép nguyên giao diện.
* KHÔNG sao chép logo.
* KHÔNG sao chép màu sắc hoàn toàn.
* KHÔNG sao chép HTML/CSS.

## Tuyệt đối KHÔNG sử dụng:

* Gradient tím/xanh kiểu AI.
* Glassmorphism.
* Neon, glow, background phát sáng.
* Hero section kiểu landing page startup.
* Emoji dùng làm icon.
* Card lồng trong card.
* Shadow đậm.
* Animation phức tạp, hiệu ứng "wow".
* Biểu đồ không cần thiết.
* Dashboard kiểu "AI SaaS".

---

# 3. PHONG CÁCH GIAO DIỆN (DESIGN TOKENS)

Khai báo toàn bộ token dưới dạng CSS variables trong `client/src/index.css` và dùng nhất quán ở mọi nơi.

## Font

* Inter (Google Fonts), fallback `system-ui, sans-serif`.
* Font code: `ui-monospace, Consolas, monospace`.
* Base 15px, line-height 1.6.
* Thang chữ: 13 / 15 / 17 / 20 / 24px.
* Tiêu đề trang 24px, weight 600. Không dùng chữ lớn hơn 24px.

## Spacing

* Theo bội số 4px: 4, 8, 12, 16, 24, 32.

## Màu

```css
--bg: #ffffff;
--bg-subtle: #f6f8fa;
--text: #1f2328;
--text-secondary: #656d76;
--border: #d0d7de;
--primary: #2563eb;
--primary-dark: #1d4ed8;
--primary-soft: #eff6ff;
--success: #1a7f37;
--success-soft: #dafbe1;
--danger: #cf222e;
```

* Chỉ một màu accent (xanh dương).
* Header: nền trắng có border dưới (hoặc navy đậm — chọn một và giữ nhất quán).

## Hình khối

* Border-radius: 6px cho button/input/tag, 8px cho khối lớn.
* Border 1px màu `--border`.
* Shadow: chỉ cho dropdown/modal, rất nhẹ.

## Icon

* Dùng `lucide-react`, size 16px, chỉ ở chỗ thật sự cần (search, menu, vote...).

## Chuyển động

* Transition 150ms cho hover/focus. Không có animation nào khác.

## Chi tiết tạo cảm giác chỉn chu

* Mọi button/input/link có trạng thái hover, focus (focus ring rõ ràng), disabled.
* Loading dùng skeleton thay vì chữ "Đang tải...".
* Empty state có 1 câu giải thích + 1 nút hành động.
* Số liệu (vote, answer, view) dùng `font-variant-numeric: tabular-nums`, căn thẳng cột.
* Câu hỏi có câu trả lời được chấp nhận: ô số answer nền `--success-soft`.
* Tag: nền `--primary-soft`, chữ xanh đậm, nhỏ gọn.
* Nội dung câu hỏi/trả lời: độ rộng tối đa ~720px; code block nền `--bg-subtle`, font monospace.

---
# 4. LAYOUT

Website desktop có layout:

```text
--------------------------------------------------
| LOGO | Câu hỏi | Danh mục | Search | User     |
--------------------------------------------------

--------------------------------------------------
|                                                |
|              MAIN CONTENT                      |
|                                                |
|  Question list                 Sidebar         |
|                                                |
|  Question                       Categories     |
|  Question                       Popular tags   |
|  Question                       Statistics     |
|                                                |
--------------------------------------------------
```

Không làm sidebar quá rộng.

Main content phải là phần quan trọng nhất.

---

# 5. HEADER

Header gồm:

* Logo: AskHub
* Trang chủ
* Câu hỏi
* Danh mục
* Ô tìm kiếm
* Nút "Đặt câu hỏi"
* Username/avatar
* Menu tài khoản

Khi chưa đăng nhập:

```text
Đăng nhập
Đăng ký
```

Khi đăng nhập:

```text
Username
Hồ sơ
Đăng xuất
```

Nếu là Admin:

```text
Quản trị
```

---

# 6. TRANG HOME

Route:

```text
/
```

Trang chủ hiển thị danh sách câu hỏi.

Mỗi question hiển thị:

```text
12 vote    3 answers    145 views

Làm thế nào để sử dụng useEffect trong React?

ReactJS   JavaScript   Frontend

Hỏi bởi Nguyễn Văn A · 2 giờ trước
```

Không thiết kế QuestionItem thành một card quá lớn.

Nên sử dụng dạng danh sách/forum.

Có:

* Pagination.
* Sort.
* Category filter.

---

# 7. TRANG QUESTIONS

Route:

```text
/questions
```

Có:

* Danh sách câu hỏi.
* Search.
* Filter category.
* Filter tag.
* Sort.

Sort gồm:

```text
Mới nhất
Nhiều vote
Nhiều câu trả lời
Chưa có câu trả lời
```

---

# 8. TRANG CHI TIẾT QUESTION

Route:

```text
/questions/:id
```

Hiển thị:

* Tiêu đề.
* Nội dung.
* Tags.
* Người đăng.
* Thời gian.
* Vote.
* Lượt xem.

Bên dưới:

```text
Câu trả lời
```

Mỗi answer:

* Vote.
* Nội dung.
* Người trả lời.
* Thời gian.
* Comment.
* Đánh dấu câu trả lời đúng.

Chủ câu hỏi có thể chọn:

```text
✓ Câu trả lời được chấp nhận
```

---

# 9. ĐẶT CÂU HỎI

Route:

```text
/ask
```

Form:

```text
Tiêu đề
Nội dung
Danh mục
Tags
```

Button:

```text
Đăng câu hỏi
```

Có validation.

Nếu chưa đăng nhập:

```text
/ask
```

phải chuyển sang:

```text
/login
```

---

# 10. COMMENT

Người dùng có thể bình luận:

* Question.
* Answer.

Ví dụ:

```text
Nguyễn Văn B · 10 phút trước

Bạn kiểm tra lại phiên bản Node.js đang sử dụng nhé.
```

Cho phép user xóa comment của chính mình.

Admin có thể xóa comment.

---

# 11. VOTE

Có:

```text
▲
12
▼
```

Người dùng có thể:

* Upvote.
* Downvote.

Không được vote nhiều lần cho cùng một nội dung.

Vote phải được lưu trong database.

---

# 12. CATEGORY

Route:

```text
/categories
```

Ví dụ:

```text
Java
JavaScript
ReactJS
NodeJS
C/C++
Python
Database
HTML/CSS
Git/GitHub
Khác
```

Mỗi category hiển thị:

* Tên.
* Mô tả.
* Số lượng câu hỏi.

Click category → danh sách câu hỏi.

---

# 13. SEARCH

Route:

```text
/search?q=...
```

Tìm kiếm:

* Tiêu đề.
* Nội dung.
* Tag.

Hiển thị:

```text
Kết quả tìm kiếm cho: React

24 câu hỏi
```

Có filter category.

---

# 14. USER PROFILE

Route:

```text
/users/:id
```

Hiển thị:

* Avatar.
* Username.
* Ngày tham gia.
* Reputation.
* Số câu hỏi.
* Số câu trả lời.

Tabs:

```text
Câu hỏi
Câu trả lời
Hoạt động
```

---

# 15. ADMIN

Route:

```text
/admin
```

Chỉ Admin mới được truy cập.

Không cần dashboard cầu kỳ.

Hiển thị:

```text
Tổng người dùng
Tổng câu hỏi
Tổng câu trả lời
Tổng bình luận
```

Có các chức năng:

### User

* Xem danh sách.
* Tìm kiếm.
* Khóa tài khoản.
* Mở khóa.
* Xóa.

### Question

* Xem danh sách.
* Xóa câu hỏi.

### Answer

* Xem.
* Xóa.

### Category

* Thêm.
* Sửa.
* Xóa.

Backend phải kiểm tra quyền Admin.

Không được chỉ ẩn nút Admin ở frontend.

---

# 16. DATABASE

Database:

```text
qa_forum
```

Tạo các bảng:

## users

```text
id
username
email
password
role
avatar
reputation
status
created_at
```

role:

```text
USER
ADMIN
```

status:

```text
ACTIVE
BLOCKED
```

## categories

```text
id
name
description
created_at
```

## questions

```text
id
user_id
category_id
title
content
views
created_at
updated_at
```

## tags

```text
id
name
```

## question_tags

```text
question_id
tag_id
```

## answers

```text
id
question_id
user_id
content
is_accepted
created_at
updated_at
```

## comments

```text
id
user_id
question_id
answer_id
content
created_at
```

## votes

```text
id
user_id
question_id
answer_id
vote_type
created_at
```

vote_type:

```text
1 = upvote
-1 = downvote
```

Thiết kế foreign key đầy đủ.

Đảm bảo một user không thể vote nhiều lần cho cùng question/answer.

---

# 17. API

## Auth

```text
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

## Questions

```text
GET /api/questions
GET /api/questions/:id
POST /api/questions
PUT /api/questions/:id
DELETE /api/questions/:id
```

## Answers

```text
GET /api/questions/:id/answers
POST /api/questions/:id/answers
PUT /api/answers/:id
DELETE /api/answers/:id
```

## Comments

```text
POST /api/comments
DELETE /api/comments/:id
```

## Votes

```text
POST /api/questions/:id/vote
POST /api/answers/:id/vote
```

## Categories

```text
GET /api/categories
POST /api/categories
PUT /api/categories/:id
DELETE /api/categories/:id
```

## Users

```text
GET /api/users/:id
PUT /api/users/:id
```

## Admin

```text
GET /api/admin/users
PUT /api/admin/users/:id/status
DELETE /api/admin/questions/:id
DELETE /api/admin/answers/:id
```

---

# 18. AUTHENTICATION

Sử dụng JWT.

Login thành công trả về token.

Frontend gửi:

```text
Authorization: Bearer TOKEN
```

Tạo middleware:

```text
authMiddleware
adminMiddleware
```

Backend phải kiểm tra:

```text
JWT
↓
User
↓
Role
↓
Permission
```

Mật khẩu phải được hash bằng bcrypt.

Không lưu password dạng plaintext.

---

# 19. PROJECT STRUCTURE

Tạo:

```text
qa-forum/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── config/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   └── package.json
│
├── database/
│   └── schema.sql
│
├── .gitignore
└── README.md
```

Không viết tất cả code vào một file.

Tách component và API theo chức năng.

Tuy nhiên không over-engineering.

---

# 20. REACT COMPONENTS

Có thể tạo:

```text
Navbar
QuestionList
QuestionItem
VoteButton
Tag
CategoryList
SearchBar
Pagination
AnswerItem
CommentList
QuestionForm
AnswerForm
UserAvatar
ProtectedRoute
AdminRoute
Footer
```

Không tạo component chỉ có vài dòng nếu không cần thiết.

---

# 21. RESPONSIVE

Phải responsive:

```text
1440px
1280px
768px
375px
```

Mobile:

* Navbar thu gọn.
* Sidebar xuống dưới.
* Question list không overflow.
* Button không bị tràn.
* Input full width.
* Không có horizontal scrollbar.

---

# 22. UX

Phải có:

* Loading state.
* Empty state.
* Error state.
* Success message.
* Confirmation khi xóa.
* Disabled button khi đang submit.
* Validation form.

Không dùng `alert()` cho mọi thông báo.

Có thể tạo Toast component đơn giản.

---

# 23. SAMPLE DATA

Tạo dữ liệu mẫu.

Ít nhất:

```text
1 Admin
5–10 Users
8–10 Categories
20 Questions
Một số Answers
Một số Comments
Một số Votes
```

Nội dung phải thực tế và liên quan đến lập trình.

Ví dụ:

```text
Làm thế nào để sử dụng useEffect trong React?

Tại sao Node.js sử dụng Event Loop?

Sự khác nhau giữa INNER JOIN và LEFT JOIN?

Làm thế nào để kết nối React với Express?

JWT hoạt động như thế nào?
```

Không dùng:

```text
Lorem ipsum
Test user
Test question
Hello world
```

---

# 24. CODE STYLE

Code phải:

* Dễ đọc.
* Dễ hiểu với sinh viên.
* Tên biến rõ ràng.
* Không viết code quá thông minh.
* Không over-engineering.
* Comment những phần quan trọng.
* Không sử dụng abstraction không cần thiết.

Tôi muốn sau này có thể tự đọc và giải thích code khi bảo vệ bài.

---

# 25. QUAN TRỌNG: ĐỪNG TỰ Ý LÀM QUÁ MỨC

Không thêm:

* AI chatbot.
* Notification system phức tạp.
* Realtime WebSocket.
* Dark mode nếu không cần.
* Gamification.
* Follow user.
* Chat.
* Subscription.
* Payment.
* Analytics phức tạp.

Chỉ tập trung đúng đề tài Q&A.

---

# 26. README

Tạo README.md gồm:

* Giới thiệu.
* Chức năng.
* Công nghệ.
* Cấu trúc project.
* Database.
* API.
* Cách cài đặt.
* Cách chạy backend.
* Cách chạy frontend.
* Tài khoản demo.
* Một số screenshot nếu có.

---

# 27. CÁCH LÀM VIỆC VỚI TÔI

Không generate toàn bộ project trong một lần.

Làm từng giai đoạn.

## Giai đoạn 1

Tạo:

* React project.
* Node.js project.
* Express.
* MySQL connection.
* Folder structure.
* `.env`.
* `.gitignore`.

Sau khi hoàn thành, kiểm tra project có chạy được hay không.

## Giai đoạn 2

Tạo database:

```text
schema.sql
```

Tạo bảng và dữ liệu mẫu.

Kiểm tra kết nối MySQL.

## Giai đoạn 3

Làm:

```text
Register
Login
JWT
Logout
Protected route
Admin middleware
```

## Giai đoạn 4

Làm Question API.

## Giai đoạn 5

Làm Answer + Comment + Vote.

## Giai đoạn 6

Làm Category + Search.

## Giai đoạn 7

Làm React UI.

## Giai đoạn 8

Kết nối React với API.

## Giai đoạn 9

Làm Admin.

## Giai đoạn 10

Test toàn bộ.

## Giai đoạn 11

Responsive.

## Giai đoạn 12

Hoàn thiện README.

---

# 28. CÁCH PHẢN HỒI SAU MỖI GIAI ĐOẠN

Sau mỗi giai đoạn:

1. Cho biết đã tạo/sửa file nào.
2. Cho biết lệnh cần chạy.
3. Kiểm tra lỗi nếu có.
4. Nếu có lỗi, tự sửa trước khi chuyển bước tiếp theo.
5. Giải thích ngắn gọn những phần quan trọng.

Không chỉ đưa code mà không kiểm tra.

Nếu có thể chạy command trong môi trường hiện tại, hãy chủ động chạy để kiểm tra.

Nếu phát hiện lỗi:

* Đọc lỗi.
* Xác định nguyên nhân.
* Sửa code.
* Chạy lại để xác nhận.

---

# 29. QUY TẮC VỀ UI

Đây là yêu cầu ưu tiên rất cao.

Cách làm UI:

1. Làm design tokens + layout (Navbar, sidebar, footer) trước, cho tôi duyệt.
2. Sau đó mới làm từng trang: Home, Question detail, Ask, Categories, Search, Profile, Login/Register.
3. Sau mỗi trang: chạy dev server, chụp screenshot ở 1440px và 375px, tự đánh giá theo mục 2 và 3, sửa rồi mới báo tôi.

Nếu nhìn giao diện và có cảm giác "đây là website AI vừa generate" (gradient, glow, card to, chữ khổng lồ, icon khắp nơi) thì phải thiết kế lại.

UI phải có:

* Header thực tế, gọn.
* Danh sách question rõ ràng, dễ quét mắt.
* Typography có thứ bậc rõ ràng.
* Khoảng cách đều, thoáng nhưng không lãng phí.
* Màu sắc tiết chế, nhất quán.
* Sidebar hữu ích, không quá rộng.
* Không trang trí thừa.

Mục tiêu:

**Một website Q&A hiện đại, đẹp, mà sinh viên có thể thật sự sử dụng hàng ngày.**

Không phải một concept UI.

---

# 30. MÔI TRƯỜNG VÀ TIẾN ĐỘ

## Môi trường của tôi

* Windows, terminal là **PowerShell**.
* PowerShell không hỗ trợ `&&` và `<` — chạy từng lệnh một, hoặc dùng `;`.
* Import SQL: `mysql -u root -p -e "source database/schema.sql"`.
* Backend và frontend chạy ở 2 terminal riêng (`npm run dev` giữ terminal).

## Tiến độ

* **Giai đoạn 1 – XONG:** React + Vite ở `client/`, Express + mysql2 ở `server/`, `GET /api/health` kiểm tra MySQL, Vite proxy `/api` → `http://localhost:5000`, `.env` / `.env.example`, `.gitignore`.
* Giai đoạn tiếp theo: **Giai đoạn 2 – Database** (`schema.sql` đầy đủ + dữ liệu mẫu).

Cập nhật mục này mỗi khi xong một giai đoạn.
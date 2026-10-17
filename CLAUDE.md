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

> **Cập nhật 2026-10-16:** Thay toàn bộ định hướng UI cũ (tối giản kiểu GitHub/Linear) bằng bản sắc riêng, có cá tính, hiện đại — tinh thần Linear (bố cục gọn, typography tốt) + Reddit (cảm giác cộng đồng, dễ khám phá) + Discord (màu sắc, cá tính) + các SaaS hiện đại (card tinh tế, trạng thái tương tác đẹp). Mục 3 và mục 29 bên dưới đã viết lại theo định hướng này — khi đọc toàn bộ tài liệu, lấy nội dung mới nhất của 2 mục đó làm chuẩn.

Giao diện phải **hiện đại, có bản sắc riêng, chuyên nghiệp** — không phải bản sao của Stack Overflow, không phải một trang CRUD trắng-xám nhàm chán.

Tham khảo tinh thần (KHÔNG sao chép nguyên xi): Linear (bố cục, typography), Reddit (khám phá nội dung, cảm giác cộng đồng), Discord (cá tính, màu sắc), các sản phẩm SaaS hiện đại.

Có thể lấy cảm hứng từ bố cục của Stack Overflow nhưng:

* KHÔNG sao chép nguyên giao diện.
* KHÔNG sao chép logo.
* KHÔNG sao chép HTML/CSS.

## Được phép dùng (có kiểm soát, không lạm dụng):

* Gradient tinh tế (cùng tông màu thương hiệu) ở hero, CTA chính, hoặc điểm nhấn — không dùng tràn lan trên mọi card.
* Hero section ngắn gọn ở trang chủ, không chiếm quá nhiều diện tích, không giống landing page bán hàng.
* Shadow nhẹ/vừa để tạo chiều sâu cho card nổi bật, dropdown, modal.
* Animation/transition mượt cho hover, chuyển tab, vote feedback, skeleton loading — tôn trọng `prefers-reduced-motion`.
* Icon trong vòng tròn màu, badge, avatar, tag có thiết kế riêng.

## Tuyệt đối KHÔNG sử dụng:

* Glassmorphism.
* Neon, glow chói mắt.
* Emoji dùng làm icon (vẫn dùng `lucide-react`).
* Card lồng trong card gây rối mắt.
* Animation giật, chậm, hoặc gây mất tập trung khi đọc nội dung.
* Biểu đồ không cần thiết.
* Toàn bộ trang chỉ toàn card giống hệt nhau — phải có nhịp điệu và phân cấp thị giác.

---

# 3. PHONG CÁCH GIAO DIỆN (DESIGN TOKENS)

Khai báo toàn bộ token dưới dạng CSS variables trong `client/src/index.css` (có bản light + dark qua `ThemeContext` đã có sẵn) và dùng nhất quán ở mọi nơi — không hard-code màu/spacing trong từng file CSS riêng lẻ.

## Font

* Inter (Google Fonts), fallback `system-ui, sans-serif`.
* Font code: `ui-monospace, Consolas, monospace`.
* Base 15px, line-height 1.6.
* Thang chữ mở rộng: 12 / 13 / 15 / 17 / 20 / 24 / 28 / 34 / 42px.
* Tiêu đề trang 24–28px/weight 700. Kiểu chữ hero (34–42px/weight 800) chỉ được dùng ở đúng 2 vị trí trong toàn site — Hero trang chủ, và headline banner trái của `/login`+`/register` (cập nhật 2026-10-20, xem mục 29) — không lặp lại ở bất kỳ nơi nào khác.

### Vai trò chữ (áp dụng thực tế trong code, không phải lý thuyết)

| Vai trò | Kích thước / weight | Màu | Ví dụ |
|---|---|---|---|
| Page title (`h1`) | 28px / 700 | `--text` | "Quản trị", "Danh mục" |
| Hero title | 28px / 800 (desktop), 22px mobile | `#fff` trên gradient | Chỉ ở Hero trang chủ, và headline banner trái `/login`+`/register` (40px/800 desktop, 24px mobile — xem mục 29) |
| Section heading (`h2` cấp trang) | 20px / 600 | `--text` | "Câu hỏi mới nhất" |
| Section heading thu gọn (trong card/sidebar) | 14–15px / 600–700 | `--primary-dark` hoặc `--text` | Tiêu đề sidebar, "Câu hỏi nổi bật", "X câu trả lời" |
| Question title (list, `h3`) | 17px / 600 | `--text` | Tiêu đề trong `QuestionItem` |
| Body / nội dung câu hỏi-trả lời | 14–15px / 400, line-height 1.5–1.6 | `--text` | `MarkdownContent` |
| Metadata (tác giả, thời gian, lượt xem) | 12.5–14px / 400–500 | `--text-secondary` | "Hỏi bởi X · 2 giờ trước" |
| Badge / tag | 11–13px / 500–600 | tùy ngữ cảnh (tag-text, success, accent...) | `.tag-pill`, "Đã giải quyết", role badge |
| Button label | 15px (`.btn`) / 13px (`.btn-sm`), weight 500 | theo biến thể nút | Mọi `.btn-*` |

Quy tắc: 1 vai trò chỉ dùng 1 kích thước cố định xuyên suốt site — không tự chọn size tùy hứng cho cùng 1 loại nội dung ở 2 trang khác nhau.

## Spacing

* Theo bội số 4px: 4, 8, 12, 16, 20, 24, 32, 48, 64.

## Màu — brand identity riêng của AskHub (teal 2 tầng + cam)

> **Cập nhật 2026-10-18:** Áp dụng đúng bảng màu đề xuất (Primary `#103F3A`, Primary accent `#087F73`, CTA accent `#FF781F`...). Kiến trúc token đã sẵn có 2 biến teal tách biệt — `--chrome-bg` (nền tối, dùng cho AppRail + Navbar + Footer) và `--primary` (teal sáng hơn, dùng cho link/nút/trạng thái active) — khớp tự nhiên với 2 mã "Primary" và "Primary accent" của brief.

Giữ nguyên **tên token đã có** trong `client/src/index.css` (toàn bộ ~120 chỗ trong code đã dùng `var(--primary)`, `var(--tag-bg)`... không đổi tên để tránh phải sửa tay hàng loạt file) — chỉ đổi **giá trị màu**:

```css
/* Light mode */
--page-bg: #f5f7fa;
--bg: #ffffff;
--text: #172b3a;
--text-secondary: #667788;
--border: #e1e7ec;

--chrome-bg: #103f3a;         /* "Primary" - nền AppRail/Navbar/Footer */
--primary: #087f73;           /* "Primary accent" - link/nút chính/trạng thái active */
--primary-dark: #066a5f;
--primary-soft: #e6f5f3;
--primary-soft-hover: #cceae6;
--tag-bg: #e6f5f3;
--tag-text: #066a5f;

--accent: #ff781f;            /* "CTA accent" - nút Đặt câu hỏi, badge nổi bật */
--accent-dark: #d9661a;
--accent-soft: #ffeee2;
--brand-gradient: linear-gradient(135deg, #087f73 0%, #103f3a 100%);
--radius-xl: 16px;            /* hero, khối lớn */
```

* 2 màu chính: `--primary` (teal accent, dùng cho link/CTA chính/trạng thái active) và `--accent` (cam, dùng tiết chế cho CTA nổi bật nhất — nút "Đặt câu hỏi"). Không thêm màu thứ 3 ngoài semantic (success/danger/warning).
* Dark mode: đổi `--bg`/`--bg-subtle`/`--text`/`--border` sang bộ màu tối như cũ, `--primary` sang teal sáng (`#2dd4bf`), `--accent` sang cam sáng hơn (`#ff9152`) để đủ tương phản.
* `--chrome-bg` giữ nguyên `#103f3a` ở cả 2 theme (không đổi theo light/dark) — đây là màu thương hiệu cố định cho vùng chrome (AppRail/Navbar/Footer).

## Hình khối

* Border-radius: 8px cho button/input/tag (`--radius-lg` nâng từ 8px, `--radius-sm` giữ 6px cho control nhỏ), 16px cho card lớn/hero (`--radius-xl`), pill (9999px) cho badge/tag tròn.
* Border 1px màu `--border`.
* Shadow: giữ hệ `--shadow-btn*`/`--shadow-menu` đã có (rất nhẹ, dùng cho button/dropdown/modal), thêm `--shadow-card-hover` rõ hơn một chút cho card nổi bật khi hover.

## Icon

* Dùng `lucide-react`, size 16–20px. Có thể đặt trong vòng tròn nền màu nhạt (`--brand-soft`/`--accent-soft`) cho icon tiêu đề mục, category, stat.

## Chuyển động

* Transition 150–200ms ease cho hover/focus/active.
* Card hover: nâng nhẹ (shadow tăng + translateY nhỏ).
* Dropdown/modal: fade + scale nhẹ khi mở.
* Vote/like: hiệu ứng phản hồi ngắn khi bấm (không quá 300ms).
* Skeleton loading: shimmer nhẹ.
* Luôn bọc trong `@media (prefers-reduced-motion: reduce)` để tắt khi người dùng yêu cầu.

## Chi tiết tạo cảm giác chỉn chu

* Mọi button/input/link có trạng thái hover, focus (focus ring rõ ràng theo `--brand`), disabled, loading.
* Loading dùng skeleton thay vì chữ "Đang tải...".
* Empty state có minh họa/icon nhỏ + 1 câu giải thích + 1 nút hành động.
* Số liệu (vote, answer, view) dùng `font-variant-numeric: tabular-nums`, căn thẳng cột.
* Câu hỏi có câu trả lời được chấp nhận: ô số answer nền `--success-soft`.
* Tag: nền `--brand-soft`, chữ `--brand-dark`, bo tròn pill, nhỏ gọn.
* Nội dung câu hỏi/trả lời: độ rộng tối đa ~720px; code block nền `--bg-subtle`, font monospace.

---
# 4. LAYOUT

> **Cập nhật 2026-10-17:** Đổi từ thanh nav ngang sang **rail điều hướng dọc bên trái** (desktop ≥769px) — kiến trúc "app shell" kiểu Linear/Discord/Notion, thay vì layout 1 thanh ngang truyền thống. Đây là thay đổi áp dụng lên toàn bộ trang (nằm trong `MainLayout`), không phải chỉ riêng trang chủ.

Website desktop (≥769px) có layout 2 vùng tách biệt:

```text
----+---------------------------------------------
|R |  Search..................  🌙 🔔 User       |  <- thanh trên (Navbar)
|A  +---------------------------------------------
|I  |                                              |
|L  |              MAIN CONTENT                    |
|   |                                              |
|⌂ |  Question list                 Sidebar         |
|? |                                                |
|▦ |  Question                       Bảng xếp hạng  |
|  |  Question                       Thống kê       |
|➕|  Question                       Tag phổ biến    |
----+---------------------------------------------
```

* **AppRail** (trái, 72px, nền `--chrome-bg`, cố định suốt chiều cao trang, `position: sticky`): logo, 3 icon điều hướng (Trang chủ/Câu hỏi/Danh mục, có tooltip khi hover), nút tròn "Đặt câu hỏi" màu `--accent` ở dưới cùng nhóm icon.
* **Navbar** (thanh trên, trong vùng nội dung bên phải, `position: sticky`): logo nhỏ + ô tìm kiếm (rộng, vì không còn link điều hướng) + ThemeToggle + NotificationBell + User/Login.
* Dưới 768px: AppRail ẩn hoàn toàn, Navbar quay về bản đầy đủ cũ (logo + link + search gộp trong menu hamburger, nút "Đặt câu hỏi" dạng icon luôn hiển thị) — xem mục 21.

Không làm sidebar (bên phải, trong main content) quá rộng — giữ nguyên 280px như cũ.

Main content phải là phần quan trọng nhất.

---

# 5. HEADER

> **Cập nhật 2026-10-19 — "Light Floating Header":** Header (Navbar) đổi từ nền teal đậm sang nền sáng (`--header-bg`, token riêng, tách khỏi `--chrome-bg` mà AppRail/Footer vẫn dùng) để tạo tương phản sáng/tối có chủ đích với sidebar. Dùng `box-shadow: var(--shadow-btn)` + `border-bottom: var(--border)` thay vì border trắng mờ cũ.

Điều hướng chính (Trang chủ/Câu hỏi/Danh mục, nhóm Quản trị) nằm ở **AppRail bên trái** (desktop) — xem mục 4. Thanh Navbar phía trên (desktop) chỉ còn đúng 2 thứ:

* Ô tìm kiếm (42px cao, bo góc 11px, nền `--bg`, viền `--border`, focus chuyển viền teal + box-shadow ring nhẹ `--primary-soft`) — có badge "Ctrl+K" (phím tắt thật, focus thẳng vào ô search từ bất kỳ đâu trên trang, ẩn khi đang gõ/đang focus).
* Nút "Đặt câu hỏi" (cam, cao bằng ô search, bo góc 10px) — **tự ẩn ở desktop khi đang trong `/admin/*`** (đã có FAB tương đương trong AppRail, tránh trùng lặp gây nhầm lẫn ngữ cảnh).

Logo/ThemeToggle/NotificationBell/AccountMenu **không** còn trong Navbar ở desktop (đã chuyển hết xuống AppRail — xem mục 4). Ở mobile (AppRail ẩn), Navbar quay về bản đầy đủ như trước redesign: logo, nav links (+ nhóm Quản trị nếu là admin), search, CTA luôn hiện (thu gọn còn icon ở màn rất hẹp), ThemeToggle/NotificationBell/AccountMenu đầy đủ — tất cả đổi sang màu chữ/icon tối phù hợp nền sáng mới.

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

**Bối cảnh (2026-10-16):** Toàn bộ giao diện đã được redesign theo bản sắc riêng (teal + coral, mục 2–3) — khác với bản UI tối giản ban đầu. Quy tắc dưới đây áp dụng cho redesign này và mọi lần chỉnh sửa UI tiếp theo.

Cách làm UI:

1. Làm design tokens (mục 3) + layout dùng chung (Navbar, sidebar, footer, button/input/card/tag) trước, cho tôi duyệt.
2. Sau đó mới làm từng trang theo thứ tự ưu tiên: Home → Question detail → Ask → Categories/Search → Profile → Login/Register → Admin.
3. Sau mỗi trang (hoặc mỗi nhóm trang nhỏ): chạy dev server, chụp screenshot ở 1440px và 375px, tự đánh giá theo mục 2 và 3, sửa lỗi tràn/lệch/overflow rồi mới báo tôi — không im lặng làm hết toàn bộ rồi mới báo 1 lần.

UI phải có:

* Header hiện đại, gọn, có điểm nhận diện thương hiệu riêng (không phải thanh menu HTML mặc định).
* Danh sách question rõ ràng, dễ quét mắt — không biến QuestionItem thành card to kiểu mạng xã hội.
* Typography có thứ bậc rõ ràng; kiểu chữ hero chỉ xuất hiện ở đúng 2 nơi — Hero trang chủ, và headline banner trái `/login`+`/register` (cập nhật 2026-10-20) — không lặp lại ở bất kỳ trang con nào khác.
* Khoảng cách đều, thoáng nhưng không lãng phí; không để trắng vô nghĩa cũng không nhồi nhét.
* Màu sắc có cá tính (teal + coral) nhưng nhất quán — không đổi tông màu giữa các trang.
* Sidebar hữu ích, không quá rộng.
* Card/button/tag/badge dùng chung 1 ngôn ngữ thiết kế trên toàn bộ site — không có trang nào "lạc" phong cách.
* Không hardcode dữ liệu mẫu để giao diện trông đẹp hơn — mọi nơi vẫn lấy dữ liệu thật từ API hiện có.
* Không được chỉ sửa giao diện mà làm hỏng chức năng đang hoạt động (API, quyền hạn, luồng dữ liệu phải giữ nguyên).

Mục tiêu:

**Một website Q&A hiện đại, đẹp, có bản sắc riêng, mà sinh viên có thể thật sự sử dụng hàng ngày.**

Không phải một concept UI.

**Cập nhật 2026-10-20 — `/login` và `/register` dùng layout split-screen:** `AuthLayout` chia 2 cột ở desktop — cột trái là banner thương hiệu (nền `--chrome-bg`/gradient teal đậm, logo + headline hero + mô tả + 2-3 điểm nổi bật của AskHub), cột phải là form trên nền sáng. Đây là vị trí hero thứ 2 duy nhất được phép ngoài trang chủ (xem mục 3). Mobile: banner thu gọn thành dải trên cùng chỉ còn logo + 1 câu mô tả ngắn, form chiếm phần lớn màn hình bên dưới. Không thêm liên kết "Quên mật khẩu?" vì dự án chưa có chức năng này.

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
# 🗺️ Lộ Trình Triển Khai MCP (MVP Prototype)

> Tài liệu này mô tả lộ trình cụ thể để hoàn thiện bản MCP (Most Critical Prototype) gửi đến khách hàng trải nghiệm thử, chia làm các giai đoạn rõ ràng.

---

## Định nghĩa MCP trong dự án này

**MCP** = Bản prototype có thể trải nghiệm được, đủ để khách hàng hiểu đúng tinh thần sản phẩm và đưa ra phản hồi có giá trị.

**Tiêu chí hoàn thành MCP:**
- [ ] Luồng chính chạy được end-to-end (Login → Chọn chủ đề → Tự học → Dạy chéo)
- [ ] Có data mẫu chất lượng (ít nhất 2 chủ đề, 10+ bài nộp mẫu)
- [ ] Giao diện đủ đẹp để người dùng không bị phân tâm bởi UI
- [ ] Deploy được online (không chạy localhost)

---

## Giai đoạn 0: Chốt Nền Tảng *(1–2 ngày)*

**Mục tiêu**: Đảm bảo team đồng thuận về nghiệp vụ và thiết kế trước khi code.

### Checklist
- [ ] Review và chốt file `01_nghiep-vu.md` — trả lời các Open Questions
- [ ] Chốt Design System trong Stitch (màu, font, spacing)
- [ ] Chốt tech stack (xem file `04_tech-stack.md`)
- [ ] Phân công công việc rõ ràng cho từng thành viên
- [ ] Setup môi trường dev chung (Git repo, branching convention)

**Output**: Tất cả tài liệu trong folder này đã được review và approve

---

## Giai đoạn 1: Hoàn Thiện Stitch Prototype *(2–3 ngày)*

**Mục tiêu**: Có bản prototype trên Stitch đủ để click-through và demo.

### Task trong Stitch

#### 1.1 Màn hình còn thiếu — Cần tạo mới
- [ ] **Màn hình Đăng nhập / Đăng ký** — chưa có trong project
- [ ] **Màn hình Profile người dùng** — lịch sử học, thống kê
- [ ] **Màn hình Nộp bài thành công** — celebration screen sau khi submit
- [ ] **Màn hình Empty State** — khi chưa có bài nộp

#### 1.2 Màn hình cần chỉnh sửa
- [ ] **Chọn chủ đề**: Thêm filter bar (môn, tag, trạng thái)
- [ ] **Chi tiết chủ đề**: Thêm section prerequisites, thêm nút rõ ràng hơn
- [ ] **Tự học**: Cải thiện text editor area, thêm character counter
- [ ] **Dạy chéo**: Thêm sort options, thêm bookmark icon

#### 1.3 Consistency check
- [ ] Kiểm tra tất cả màn hình dùng đúng color palette đã chốt
- [ ] Kiểm tra spacing nhất quán
- [ ] Kiểm tra trạng thái hover/active của button

**Output**: Stitch prototype hoàn chỉnh, có thể share link cho stakeholder xem

---

## Giai đoạn 2: Xây Dựng Frontend *(5–7 ngày)*

**Mục tiêu**: Convert Stitch design thành code chạy được với mock data.

### 2.1 Setup Project
- [ ] Khởi tạo project (React + Vite hoặc Next.js)
- [ ] Cài đặt Design System (Tailwind CSS config theo tokens)
- [ ] Cài đặt icon library (Lucide React)
- [ ] Cài đặt font Inter từ Google Fonts
- [ ] Setup routing

### 2.2 Xây dựng Components cơ bản
- [ ] `Button` (Primary, Secondary, Danger)
- [ ] `Card` (Topic card)
- [ ] `Badge` / `Tag`
- [ ] `Avatar`
- [ ] `ProgressBar`
- [ ] `Timer` component (countdown)
- [ ] `TextEditor` (simple rich text)
- [ ] `FileUpload` component
- [ ] `CommentThread` component

### 2.3 Xây dựng các trang

**User-facing:**
- [ ] `/login` — Trang đăng nhập
- [ ] `/topics` — Chọn chủ đề
- [ ] `/topics/new` — Tạo chủ đề mới (pending duyệt)
- [ ] `/topics/:id` — Chi tiết chủ đề
- [ ] `/topics/:id/learn` — Tự học + Timer (2 ngày window)
- [ ] `/topics/:id/peer` — Dạy chéo
- [ ] `/topics/:id/submission/:sid` — Chi tiết bình luận

**Admin-facing:**
- [ ] `/admin/login` — Đăng nhập riêng cho Admin
- [ ] `/admin/dashboard` — Tổng quan hệ thống
- [ ] `/admin/topics/pending` — Danh sách chủ đề chờ duyệt
- [ ] `/admin/topics/pending/:id` — Chi tiết + Duyệt / Từ chối
- [ ] `/admin/topics` — Quản lý toàn bộ chủ đề

### 2.4 Mock Data Layer
- [ ] Tạo file `mock-data.json` với data mẫu chất lượng (xem file `05_data-mau.md`)
- [ ] Tạo mock API service (có thể dùng json-server hoặc hardcode)

**Output**: Web app chạy được với mock data, đúng với thiết kế Stitch

---

## Giai đoạn 3: Backend & Authentication *(5–7 ngày)*

**Mục tiêu**: Có backend thực, đăng nhập thực, lưu dữ liệu thực.

### 3.1 Authentication
- [ ] Đăng ký / Đăng nhập bằng Email + Password
- [ ] (Optional) Đăng nhập Google OAuth
- [ ] JWT token management
- [ ] Protected routes

### 3.2 API Endpoints cần thiết

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/topics` | Danh sách chủ đề |
| GET | `/api/topics/:id` | Chi tiết chủ đề |
| POST | `/api/topics/:id/submissions` | Nộp bài |
| GET | `/api/topics/:id/submissions` | Danh sách bài nộp (sau khi đã nộp) |
| POST | `/api/submissions/:id/likes` | Like bài |
| POST | `/api/submissions/:id/comments` | Comment |
| GET | `/api/me` | Thông tin người dùng hiện tại |

### 3.3 Database Schema (cơ bản)
- `users`: id, name, email, avatar, created_at
- `topics`: id, title, description, duration_minutes, created_at, deadline
- `topic_resources`: id, topic_id, type(link/file), url, label
- `submissions`: id, topic_id, user_id, understood, not_understood, created_at
- `submission_resources`: id, submission_id, type, url
- `likes`: id, submission_id, user_id
- `comments`: id, submission_id, user_id, content, parent_id, created_at

**Output**: API hoạt động, frontend kết nối được với backend thực

---

## Giai đoạn 4: Deploy & Data Mẫu *(2–3 ngày)*

**Mục tiêu**: Online, có data mẫu chất lượng, sẵn sàng cho user testing.

### 4.1 Deploy Infrastructure
- [ ] Frontend: Vercel hoặc Netlify (free tier)
- [ ] Backend: Railway hoặc Render (free tier)
- [ ] Database: PostgreSQL trên Railway / Supabase
- [ ] File storage: Cloudinary hoặc Supabase Storage (cho upload tài liệu)
- [ ] Domain: Đăng ký domain ngắn gọn (hoặc dùng subdomain miễn phí)

### 4.2 Seed Data Mẫu
- [ ] Tạo ít nhất **3 chủ đề** (xem `05_data-mau.md`)
- [ ] Tạo ít nhất **5 tài khoản người dùng mẫu**
- [ ] Tạo ít nhất **15 bài nộp mẫu** (5 bài/chủ đề)
- [ ] Tạo ít nhất **20 comment mẫu**
- [ ] Tạo **likes** phân bố tự nhiên

### 4.3 Quality Assurance trước launch
- [ ] Test luồng chính end-to-end trên desktop
- [ ] Test trên mobile (responsive)
- [ ] Test với tài khoản khách (guest không thấy nội dung private)
- [ ] Kiểm tra hiệu năng: trang tải < 3 giây
- [ ] Kiểm tra tiếng Việt hiển thị đúng (font, dấu)

**Output**: Link demo online, sẵn sàng gửi cho khách hàng

---

## Giai đoạn 5: User Testing & Iteration *(1–2 tuần)*

**Mục tiêu**: Thu thập feedback thực từ người dùng và cải thiện.

### 5.1 Kịch bản User Testing
Chuẩn bị **task script** cho người dùng thử:
1. "Hãy tìm và tham gia chủ đề về Giải tích 1"
2. "Viết những gì bạn hiểu về đạo hàm"
3. "Tải lên một tài liệu bạn tham khảo"
4. "Đọc bài của người khác và để lại comment"

### 5.2 Metrics cần theo dõi
- Tỷ lệ hoàn thành luồng chính (%)
- Thời gian trung bình hoàn thành một phiên học
- Điểm mà người dùng bỏ cuộc (drop-off point)
- NPS score (0–10, bạn có giới thiệu cho bạn bè không?)

### 5.3 Kênh thu thập feedback
- [ ] Form Google Khảo sát (5–7 câu, gắn link vào app)
- [ ] Interview trực tiếp (3–5 người, 30 phút/người)
- [ ] Hotjar heatmap (nếu có budget)

---

## Timeline Tổng Quan

```
Tuần 1: Giai đoạn 0 + 1 (Chốt nền tảng + Hoàn thiện Stitch)
Tuần 2: Giai đoạn 2 (Frontend với mock data)
Tuần 3: Giai đoạn 3 (Backend + Authentication)
Tuần 4: Giai đoạn 4 (Deploy + Data mẫu + QA)
Tuần 5–6: Giai đoạn 5 (User Testing + Fix bugs)
```

---

## Rủi ro & Giải pháp

| Rủi ro | Xác suất | Giải pháp |
|--------|----------|-----------|
| Thiếu thời gian cho backend | Cao | Dùng Supabase (BaaS) thay vì tự code backend |
| Data mẫu không đủ chất lượng | Trung bình | Chuẩn bị kỹ theo `05_data-mau.md` |
| User không hiểu concept | Cao | Thêm onboarding tutorial ngắn (3 steps) |
| File upload phức tạp | Trung bình | V1 chỉ hỗ trợ link URL, upload file là V2 |

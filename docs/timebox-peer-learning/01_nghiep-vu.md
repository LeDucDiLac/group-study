# 📚 Nghiệp Vụ Dự Án: TimeBoxed Peer Learning

> Tài liệu này mô tả toàn bộ luồng nghiệp vụ, các vai trò người dùng và các quy tắc kinh doanh cốt lõi của nền tảng.

---

## 1. Tầm nhìn & Mục tiêu

**TimeBoxed Peer Learning** là nền tảng học tập ngang hàng (peer learning) ứng dụng kỹ thuật **"Dạy để học" (Learning by Teaching)** kết hợp **Time-Boxing** (học tập có giới hạn thời gian). Người dùng không chỉ tiếp thu kiến thức mà còn **chủ động tạo ra kiến thức** thông qua việc viết lại những gì mình hiểu và chia sẻ với cộng đồng.

### Vấn đề đang giải quyết
- Sinh viên, người đi làm thiếu một kênh **chia sẻ kiến thức có cấu trúc và chất lượng**
- Các tài liệu học tập hiện có rời rạc, thiếu tính tương tác
- Không có cơ chế kiểm tra mức độ thực sự hiểu bài sau khi học

### Giải pháp cốt lõi
Áp dụng **Kỹ thuật Feynman**: Buộc người học phải giải thích lại kiến thức bằng ngôn ngữ của chính mình → Phát hiện lỗ hổng → Học lại → Chia sẻ cho người khác đọc.

---

## 2. Các Vai Trò Người Dùng

| Vai trò | Mô tả | Quyền |
|---------|-------|-------|
| **Người học (Learner)** | Người dùng đã đăng nhập, tham gia học chủ đề | Chọn chủ đề, tự học, dạy chéo, like/comment |
| **Người xem (Viewer)** | Người dùng chưa đăng nhập | Xem danh sách chủ đề, KHÔNG thể tham gia |
| **Quản trị (Admin)** | Người tạo và quản lý chủ đề | Tạo/sửa/xoá chủ đề, duyệt nội dung |

> ⚠️ **Điểm cần hoàn thiện**: Cần định nghĩa rõ ai có quyền tạo chủ đề mới — chỉ Admin hay cả người dùng thường?

---

## 3. Luồng Nghiệp Vụ Chính (Happy Path)

```
[Đăng nhập] 
    ↓
[Chọn chủ đề] — Xem danh sách, lọc theo môn/tag
    ↓
[Chi tiết chủ đề] — Đọc mô tả, xem tài liệu đính kèm, quyết định tham gia
    ↓
[Tự học: Time-Box] — Đặt timer, viết những gì hiểu / chưa hiểu, upload tài liệu
    ↓
[Nộp bài] — Xác nhận nộp, không thể sửa sau khi nộp
    ↓
[Dạy chéo (Peer Learning)] — Đọc bài của người khác, like, comment
```

---

## 4. Chi Tiết Từng Màn Hình

### 4.1 Màn hình Đăng nhập / Đăng ký
- **Chức năng**: Xác thực người dùng
- **Trường dữ liệu**: Email, Mật khẩu
- **Điều hướng**: → Chọn chủ đề (sau đăng nhập thành công)
- **Điểm cần bổ sung**: Đăng nhập bằng Google/GitHub cho đối tượng sinh viên/developer

---

### 4.2 Màn hình Chọn chủ đề (`screen: Chọn chủ đề`)
- **Mục đích**: Hiển thị danh sách các chủ đề học tập có sẵn trong hệ thống
- **Thành phần UI hiện tại**:
  - Search bar tìm kiếm chủ đề
  - Danh sách card chủ đề với: Tên chủ đề, Số người tham gia, Tag/Category, Trạng thái (đang mở/đã đóng)
  - Nút "Bắt đầu" trên mỗi card
- **Quy tắc nghiệp vụ**:
  - Chủ đề có thể có **giới hạn số lượng người** tham gia
  - Chủ đề có thể **đặt thời hạn** (deadline nộp bài)
  - Người dùng đã hoàn thành một chủ đề sẽ thấy badge "Đã hoàn thành"
- **Điểm cần hoàn thiện**:
  - Bộ lọc theo: Môn học, Tag, Độ khó, Số người, Còn chỗ
  - Hiển thị chủ đề "Đang nổi" / "Mới nhất"
  - Lịch sử các chủ đề đã tham gia

---

### 4.3 Màn hình Chi tiết chủ đề (`screen: Chi tiết chủ đề: Cung điện ký ức`)
- **Mục đích**: Giúp người dùng hiểu rõ chủ đề trước khi quyết định tham gia
- **Thành phần UI hiện tại**:
  - Tên chủ đề + mô tả chi tiết
  - Danh sách tài liệu tham khảo đính kèm (PDF, link)
  - Số người đã tham gia
  - Thời gian học đề xuất (time-box)
  - Nút "Bắt đầu học"
- **Quy tắc nghiệp vụ**:
  - Mỗi chủ đề có một **"Mục tiêu học"** rõ ràng
  - Hiển thị **preview bài đã nộp của người khác** (ẩn danh hoặc công khai — cần quyết định)
  - Nếu người dùng **đã nộp bài**, nút chuyển thành "Xem bài của bạn" + "Vào Dạy chéo"
- **Điểm cần hoàn thiện**:
  - Cần có section "Yêu cầu kiến thức trước" (prerequisites)
  - Cần hiển thị % hoàn thành của cộng đồng trong chủ đề đó

---

### 4.4 Màn hình Tự học (`screen: Tự học: Cung điện ký ức`)
- **Mục đích**: Không gian để người dùng **viết lại kiến thức** sau khi tự nghiên cứu tài liệu
- **Thành phần UI hiện tại** (3 phần chính):

  | Section | Mô tả |
  |---------|-------|
  | **Viết những gì bạn hiểu** | Text editor tự do, người dùng tóm tắt kiến thức |
  | **Những gì bạn chưa hiểu** | Text editor, liệt kê điểm còn mờ, câu hỏi còn thắc mắc |
  | **Tải lên tài liệu / Liên kết** | Upload file (PDF, ảnh, Word), thêm URL tham khảo |

- **Timer**: Đồng hồ đếm ngược hiển thị thời gian học (ví dụ: 25 phút Pomodoro)
- **Quy tắc nghiệp vụ**:
  - Timer **bắt buộc** — window **48 giờ** tính từ lúc Admin duyệt chủ đề. Sau 48h hệ thống tự đóng, không nộp được nữa
  - Trong 48h, người dùng có thể **bắt đầu bất kỳ lúc nào**, nhưng chỉ **nộp 1 lần duy nhất**
  - **Autosave nháp** mỗi 30 giây (lưu local/server) — tránh mất dữ liệu
  - Sau khi nhấn **"Nộp bài"**: **KHOÁ VĨNH VIỄN**, không thể sửa
  - Người dùng chọn **công khai tên** hoặc **ẩn danh** trước khi nộp
  - Bài nộp chỉ hiển thị cho **những người đã nộp bài trong cùng chủ đề**
- **Điểm cần hoàn thiện**:
  - Rich text editor (bold, bullet, heading) thay vì plain textarea
  - Hỗ trợ Markdown hoặc LaTeX cho môn Toán, Lý, Hoá
  - Hiển thị rõ **countdown 48h** ở góc màn hình khi đang viết bài

---

### 4.5 Màn hình Tự học — Timer (`screen: Tự học (Timer)`)
- **Mục đích**: Phiên bản màn hình tự học có tích hợp **bộ đếm thời gian nổi bật**
- **Thành phần UI**:
  - Hiển thị đồng hồ đếm ngược cỡ lớn (64px, màu Emerald Green)
  - Thanh tiến trình (progress bar)
  - Nút Pause / Resume / Kết thúc sớm
- **Nhận xét**: Đây là USP (điểm khác biệt) quan trọng — Time-boxing tạo áp lực tích cực, tăng sự tập trung

---

### 4.6 Màn hình Dạy chéo (`screen: Dạy chéo (Peer Learning)`)
- **Mục đích**: Sau khi nộp bài, người dùng **đọc bài của người khác** → Học từ góc nhìn đa chiều
- **Thành phần UI hiện tại**:
  - Danh sách các bài nộp của người dùng khác
  - Mỗi bài hiển thị: Avatar + Tên, phần "Hiểu" và "Chưa hiểu", tài liệu đính kèm
  - Nút Like ❤️
  - Nút Comment 💬
  - Nút xem "Chi tiết bình luận"
- **Quy tắc nghiệp vụ**:
  - **Gate cứng**: Người dùng **chỉ vào được màn hình này sau khi đã nộp bài** — không nộp = không xem (tránh free-rider)
  - Bài nộp **không thể sửa** sau khi submit
  - Bài của bản thân có nhãn "Bài của bạn" → không thể like chính mình
  - Bài ẩn danh hiển thị avatar mặc định + tên "Người dùng ẩn danh" (hệ thống vẫn biết là ai nhưng không hiển thị)
  - Sắp xếp bài theo: Mới nhất / Nhiều like nhất / Ngẫu nhiên
- **Điểm cần hoàn thiện**:
  - Tính năng **"Bookmark"** (lưu bài hay để đọc lại)
  - Tính năng **Reply comment** (thread)
  - Hiển thị **tổng kết cộng đồng**: điểm chung mà nhiều người hiểu, điểm chung nhiều người chưa hiểu → Insight cực kỳ giá trị

---

### 4.7 Màn hình Chi tiết bình luận (`screen: Chi tiết bình luận`)
- **Mục đích**: Xem toàn bộ bài nộp của một người + thread bình luận đầy đủ
- **Thành phần UI**:
  - Full content của bài nộp (Hiểu + Chưa hiểu + Tài liệu)
  - Thread comment với reply
  - Like / Unlike
- **Quy tắc nghiệp vụ**:
  - Comment cần có kiểm duyệt cơ bản (chặn spam, ngôn từ xấu)

---

## 5. Các Điểm Nghiệp Vụ Cần Quyết Định

> Đây là các **open question** quan trọng cần được chốt trước khi code:

| # | Câu hỏi | Quyết định |
|---|---------|------------|
| 1 | Timer có bắt buộc không? | ✅ **BẮT BUỘC** — window 2 ngày (48h) từ lúc Admin duyệt |
| 2 | Bài nộp có thể sửa sau không? | ✅ **KHÔNG** — nộp rồi là khoá, không sửa |
| 3 | Bài nộp công khai hay chỉ trong nhóm? | ✅ **CHỈ NGƯỜI ĐÃ NỘP BÀI** mới xem được — phải đóng góp mới xem |
| 4 | Ai tạo được chủ đề mới? | ✅ **User tạo + Admin duyệt** — xem Section 4.8 |
| 5 | Có hệ thống điểm / gamification không? | ⏳ Để V2 |
| 6 | Có cho phép ẩn danh khi nộp bài không? | ✅ **CÓ TUỲ CHỌN** — người dùng tự chọn nộp công khai hoặc ẩn danh |
| 7 | Bao nhiêu người tối đa/chủ đề? | ✅ **KHÔNG GIỚI HẠN** |

---

## 6. Nghiệp Vụ Cần Bổ Sung Mới

### 4.8 Màn Hình Admin (Phát sinh mới)

> ⚠️ **PHÁT SINH THÊM SCOPE**: Do người dùng được phép tạo chủ đề mới cần Admin phê duyệt, cần bổ sung toàn bộ luồng Admin.

#### Luồng Admin

```
[Admin đăng nhập] — Riêng biệt với user thường
    ↓
[Dashboard Admin] — Tổng quan hệ thống
    ↓
[Duyệt chủ đề] — Danh sách chủ đề chờ duyệt → Xem chi tiết → Phê duyệt / Từ chối
    ↓
[Quản lý chủ đề] — Xem toàn bộ chủ đề đang hoạt động, chỉnh sửa, đóng
    ↓
[Quản lý người dùng] — Danh sách user, khoá tài khoản nếu vi phạm
```

#### Màn hình Admin cần tạo mới trong Stitch

| Màn hình | Mô tả | Độ ưu tiên |
|----------|-------|------------|
| **Admin Dashboard** | Tổng quan: số chủ đề chờ duyệt, tổng user, tổng bài nộp hôm nay | 🔴 Cao |
| **Danh sách chờ duyệt** | Table: Tên chủ đề, Người tạo, Thời gian, Nút Duyệt/Từ chối | 🔴 Cao |
| **Chi tiết chủ đề cần duyệt** | Xem full thông tin, tài liệu đính kèm, lý do đề xuất, form từ chối | 🔴 Cao |
| **Quản lý chủ đề** | Table toàn bộ chủ đề, filter, search, nút Đóng/Ẩn | 🟡 Trung bình |
| **Quản lý người dùng** | Table user, khoá/mở tài khoản | 🟢 Thấp (V2) |

#### Quy tắc nghiệp vụ Admin

- Admin **không tham gia** học như user thường
- Khi từ chối chủ đề: **bắt buộc điền lý do** → Gửi notification đến người tạo
- Khi duyệt chủ đề: hệ thống tự động **gửi thông báo** cho toàn bộ user (hoặc user đã subscribe lĩnh vực đó)
- Admin có thể **đóng chủ đề** bất kỳ lúc nào (vi phạm nội dung, hết hạn)
- Window **2 ngày** được đặt bởi **người tạo chủ đề** khi submit form, Admin có thể chỉnh sửa khi duyệt

#### Form Tạo Chủ Đề (User tạo)

Màn hình người dùng cần tạo thêm trong Stitch:

| Field | Kiểu | Bắt buộc | Ghi chú |
|-------|------|----------|---------|
| Tên chủ đề | Text | ✅ | Max 100 ký tự |
| Mô tả | Textarea | ✅ | Giải thích chủ đề, mục tiêu học |
| Danh mục | Dropdown | ✅ | Toán, Lý, Hóa, CNTT, Kinh tế, Kỹ năng mềm... |
| Tags | Multi-select / text | ✅ | Tối đa 5 tags |
| Thời gian làm bài (window) | Number | ✅ | Mặc định 2 ngày (48h), min 1 ngày, max 7 ngày |
| Yêu cầu kiến thức trước | Textarea | ❌ | Prerequisites |
| Tài liệu / link tham khảo | URL list | ❌ | Tối đa 5 links |
| Lý do đề xuất chủ đề này | Textarea | ✅ | Giúp Admin duyệt nhanh hơn |

---

### 6.1 Hệ thống Thông báo (Notifications)
- Khi có người comment vào bài của mình
- Khi chủ đề sắp đến deadline
- Khi chủ đề mới được tạo trong lĩnh vực yêu thích

### 6.2 Hồ sơ cá nhân (Profile)
- Các chủ đề đã tham gia
- Bài đã nộp
- Số like nhận được
- "Lĩnh vực chuyên môn" tự khai báo

### 6.3 Tổng kết Cộng đồng (Community Insight)
- Sau khi đủ số người nộp bài → hệ thống tổng hợp: "Điểm mọi người đều hiểu", "Điểm mọi người đều chưa hiểu"
- Đây là tính năng **killer feature** giúp giảng viên/admin biết lỗ hổng kiến thức cộng đồng

### 6.4 Lịch học (Study Calendar)
- Xem lịch các chủ đề sắp mở / deadline
- Đặt reminder cá nhân

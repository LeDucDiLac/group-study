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
| **Người học (Learner)** | Người dùng đã đăng nhập, tham gia học chủ đề | Chọn chủ đề, tự học, dạy chéo, like/comment, **tạo chủ đề (cần Admin phê duyệt)** |
| **Người xem (Viewer)** | Người dùng chưa đăng nhập | Xem danh sách chủ đề, KHÔNG thể tham gia |
| **Quản trị (Admin)** | Người tạo và quản lý chủ đề | Tạo/sửa/xoá chủ đề, **phê duyệt chủ đề do người học tạo** |

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
- **Điểm cần bổ sung**: Đăng nhập bằng Google/GitHub cho đối tượng sinh viên/developer **(không phát triển trong MVP)**

---

### 4.2 Màn hình Chọn chủ đề (`screen: Chọn chủ đề`)
- **Mục đích**: Hiển thị danh sách các chủ đề học tập có sẵn trong hệ thống
- **Thành phần UI hiện tại**:
    - Search bar tìm kiếm chủ đề
    - Danh sách card chủ đề với: Tên chủ đề, Số người tham gia, Tag/Category, Trạng thái (Đang mở/Đã hoàn thành)
    - Nút "Bắt đầu" trên mỗi card
    - Bộ lọc theo: Môn học, Tag, Độ khó, Số người
    - Hiển thị chủ đề "Đang nổi" / "Mới nhất"
- **Quy tắc nghiệp vụ**:
    - Chủ đề có thể **đặt thời hạn** (deadline nộp bài)
    - Người dùng đã hoàn thành một chủ đề sẽ thấy badge "Đã hoàn thành"

---

### 4.3 Màn hình Lịch sử chủ đề đã tham gia (`screen: Lịch sử chủ đề`)
- **Mục đích**: Cho phép người dùng xem lại toàn bộ các chủ đề đã tham gia và trạng thái hoàn thành
- **Thành phần UI**:
    - Tabs/filters: Tất cả / Đang tham gia / Đã hoàn thành
    - Danh sách card chủ đề với: Tên chủ đề, Tag/Category, Ngày tham gia, Trạng thái (Đang học/Đã nộp/Hoàn thành)
    - Quick actions: "Xem bài đã nộp", "Tiếp tục học" (nếu còn trong window)
- **Quy tắc nghiệp vụ**:
    - Chỉ hiển thị các chủ đề mà người dùng đã tham gia
    - Nếu đã nộp bài, cho phép đi thẳng tới màn hình Dạy chéo
    - Nếu chủ đề đã hoàn thành, cho phép vào màn hình Dạy chéo dù chưa nộp
    - Nếu hết window của chủ đề mà chưa nộp, hiển thị trạng thái "Quá hạn"

---

### 4.4 Màn hình Chi tiết chủ đề (`screen: Chi tiết chủ đề`)
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
    - Người dùng có thể xem chủ đề bất cứ lúc nào
    - Khi bấm "Bắt đầu học", hệ thống bắt đầu đếm **timer theo thời lượng do người tạo chủ đề quy định**
    - Nếu người dùng **đã nộp bài** hoặc **chủ đề đã hoàn thành**, nút chuyển thành "Xem bài của bạn" + "Vào Dạy chéo"
- **Điểm cần hoàn thiện**:
    - Cần có section "Yêu cầu kiến thức trước" (prerequisites) và section "chủ đề tiếp theo"

---

### 4.5 Màn hình Tự học (`screen: Tự học`)
- **Mục đích**: Không gian để người dùng **viết lại kiến thức** sau khi tự nghiên cứu tài liệu
- **Thành phần UI hiện tại** (3 phần chính):

    | Section | Mô tả |
    |---------|-------|
    | **Viết những gì bạn hiểu** | Text editor tự do, người dùng tóm tắt kiến thức |
    | **Những gì bạn chưa hiểu** | Text editor, liệt kê điểm còn mờ, câu hỏi còn thắc mắc |
    | **Tải lên tài liệu / Liên kết** | Upload file (PDF, ảnh, Word), thêm URL tham khảo |

- **Timer**: Đồng hồ đếm ngược theo thời lượng của chủ đề, bắt đầu từ lúc người dùng bấm "Bắt đầu học"
- **Quy tắc nghiệp vụ**:
    - Người dùng chỉ có thể **nộp bài trong window của chủ đề** tính từ thời điểm bấm "Bắt đầu học"
    - **Autosave nháp** mỗi 30 giây (lưu local/server) — tránh mất dữ liệu
    - Sau khi nhấn **"Nộp bài"**: **KHOÁ VĨNH VIỄN**, không thể sửa
    - Người dùng chọn **công khai tên** hoặc **ẩn danh** trước khi nộp
    - Bài nộp chỉ hiển thị cho **những người đã nộp bài trong cùng chủ đề** hoặc **người dùng khi chủ đề đã hoàn thành**
- **Điểm cần hoàn thiện**:
    - Rich text editor (bold, bullet, heading) thay vì plain textarea
    - Hỗ trợ Markdown hoặc LaTeX cho môn Toán, Lý, Hoá

---

### 4.6 Màn hình Dạy chéo (`screen: Dạy chéo (Peer Learning)`)
- **Mục đích**: Sau khi nộp bài **hoặc** khi chủ đề đã hoàn thành, người dùng **đọc bài của người khác** → Học từ góc nhìn đa chiều
- **Thành phần UI hiện tại**:
    - Danh sách các bài nộp của người dùng khác
    - Mỗi bài hiển thị: Avatar + Tên, phần "Hiểu" và "Chưa hiểu", tài liệu đính kèm
    - Nút Like ❤️
    - Nút Comment 💬
    - Nút xem "Chi tiết bình luận"
    - Reply comment (thread)
- **Quy tắc nghiệp vụ**:
    - **Gate cứng**: Người dùng **chỉ vào được màn hình này sau khi đã nộp bài**, hoặc **khi chủ đề đã hoàn thành**
    - Bài nộp **không thể sửa** sau khi submit
    - Bài của bản thân có nhãn "Bài của bạn" → không thể like chính mình
    - Bài ẩn danh hiển thị avatar mặc định + tên "Người dùng ẩn danh" (hệ thống vẫn biết là ai nhưng không hiển thị)
    - Sắp xếp bài theo: Mới nhất / Nhiều like nhất / Ngẫu nhiên
- **Điểm cần hoàn thiện**:
    - Tính năng **"Bookmark"** (lưu bài hay để đọc lại)
    - Hiển thị **tổng kết cộng đồng**: điểm chung mà nhiều người hiểu, điểm chung nhiều người chưa hiểu → Insight cực kỳ giá trị

---

### 4.7 Màn hình Tạo chủ đề (`screen: Tạo chủ đề`)
- **Mục đích**: Cho phép người học đề xuất chủ đề mới để Admin duyệt
- **Thành phần UI**:

    | Field | Kiểu | Bắt buộc | Ghi chú |
    |-------|------|----------|---------|
    | Tên chủ đề | Text | ✅ | Max 100 ký tự |
    | Mô tả | Textarea | ✅ | Giải thích chủ đề, mục tiêu học |
    | Danh mục | Dropdown | ✅ | Toán, Lý, Hóa, CNTT, Kinh tế, Kỹ năng mềm... |
    | Tags | Multi-select / text | ✅ | Tối đa 5 tags |
    | Thời gian làm bài (window) | Number | ✅ | Mặc định 2 ngày (48h), min 1 ngày, max 7 ngày |
    | Yêu cầu kiến thức trước | Textarea | ❌ | Prerequisites |
    | Tài liệu / link tham khảo | URL list | ❌ | Tối đa 5 links |
- **Quy tắc nghiệp vụ**:
    - Chủ đề do người học tạo phải **chờ Admin phê duyệt** trước khi hiển thị cho cộng đồng
    - Window do người tạo chủ đề đề xuất, Admin có thể chỉnh sửa khi duyệt

---

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

---

### 4.9 Hệ thống Thông báo (Notifications)
- Khi có người comment vào bài của mình
- Khi có thông báo từ admin (thường là cảnh báo spam, ngôn ngữ, thông báo duyệt chủ đề, bài nộp)

---

### 4.10 Hồ sơ cá nhân (Profile)
**Hệ thống Rank (10 cấp bậc)**
1. Tập sự: Được phép tạo chủ đề, bài nộp cần phê duyệt, được phép xem bài nộp của người khác, được phép like/dislike
2. Tân binh: được phép comment
3. Sinh viên chính thức: bài nộp không cần phê duyệt
4. Sinh viên kỳ cựu: Mỗi ngày 1 lần xem bài nộp của người khác nmà không cần hoàn thành chủ đề.
5. Tinh anh:
6. Học giả: Xem bài nộp của người khác nmà không cần hoàn thành chủ đề.
7. Đại học giả: 
8. Lão sư: Đăng bài mà không cần phê duyệt.
9. Đại lão sư:
10. Thách đấu:
**Quy tắc điểm & điều kiện tính điểm**
- Mỗi rank cần 100 điểm.
- **Bình luận của bạn được người khác like**: +5 điểm.
- **Bài nộp của bạn được phê duyệt**: +20 điểm.
- **Bài nộp của bạn được người khác like**: +10 điểm.
- **Bài nộp của bạn bị người khác dislike**: 0 điểm (không trừ).
- Với người dùng từ **rank 5 trở lên**: chỉ tương tác từ **người dùng rank 5+** mới được tính điểm.
- Với **chủ đề do bản thân đăng**:
    - Được phê duyệt: +50 điểm.
    - Mỗi bài nộp của cộng đồng: +15 điểm.
    - Mỗi comment của cộng đồng: +4 điểm.
---

### 4.11 Màn hình Quản lý chủ đề của tôi (`screen: Quản lý chủ đề`)
- **Mục đích**: Thống kê và quản lý các chủ đề do người dùng đã tạo
- **Thành phần UI**:
    - Bộ lọc: Tất cả / Chờ duyệt / Đã duyệt / Bị từ chối / Đã hoàn thành
    - Danh sách card hoặc bảng: Tên chủ đề, Ngày tạo, Trạng thái, Số người tham gia, Số bài nộp, Số comment
    - Quick actions: "Xem chi tiết", "Chỉnh sửa" (trạng thái chờ duyệt), "Hoàn thành" (trạng thái đã duyệt)
- **Quy tắc nghiệp vụ**:
    - Chủ đề ở trạng thái **chờ duyệt** mới được chỉnh sửa
    - Khi được phê duyệt, nút "Chỉnh sửa" chuyển thành "Hoàn thành"
    - Khi bị từ chối, hiển thị lý do từ Admin

---

## 5. Các Điểm Nghiệp Vụ Cần Quyết Định

> Đây là các **open question** quan trọng cần được chốt trước khi code:

| # | Câu hỏi | Quyết định |
|---|---------|------------|
| 1 | Timer có bắt buộc không? | ✅ **KHÔNG bắt buộc để xem chủ đề** — chỉ áp dụng window nộp bài tính từ lúc bấm "Bắt đầu học" |
| 2 | Bài nộp có thể sửa sau không? | ✅ **KHÔNG** — nộp rồi là khoá, không sửa |
| 3 | Bài nộp công khai hay chỉ trong nhóm? | ✅ **CHỈ NGƯỜI ĐÃ NỘP BÀI** mới xem được; **riêng chủ đề đã hoàn thành** thì người dùng có thể xem |
| 4 | Ai tạo được chủ đề mới? | ✅ **User tạo + Admin duyệt** — xem Section 4.7 |
| 5 | Có hệ thống điểm / gamification không? | ⏳ Để V2 |
| 6 | Có cho phép ẩn danh khi nộp bài không? | ✅ **CÓ TUỲ CHỌN** — người dùng tự chọn nộp công khai hoặc ẩn danh |
| 7 | Bao nhiêu người tối đa/chủ đề? | ✅ **KHÔNG GIỚI HẠN** |

---

## 6. Nghiệp Vụ Cần Bổ Sung (Sau MVP)

### 6.1 Tổng kết Cộng đồng (Community Insight)
- Sau khi đủ số người nộp bài → hệ thống tổng hợp: "Điểm mọi người đều hiểu", "Điểm mọi người đều chưa hiểu"
- Đây là tính năng **killer feature** giúp giảng viên/admin biết lỗ hổng kiến thức cộng đồng

### 6.2 Lịch học (Study Calendar)
- Xem lịch các chủ đề sắp mở / deadline
- Đặt reminder cá nhân

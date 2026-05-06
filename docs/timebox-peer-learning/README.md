# 📖 TimeBoxed Peer Learning — Tài Liệu Dự Án

> Bộ tài liệu nền tảng cho việc triển khai MCP (Most Critical Prototype) của nền tảng học tập ngang hàng TimeBoxed Peer Learning.
> Stitch Project: https://stitch.withgoogle.com/projects/16422207480539301977

---

## 📁 Cấu Trúc Tài Liệu

| File | Nội dung | Đọc khi |
|------|---------|---------|
| `01_nghiep-vu.md` | Luồng nghiệp vụ, vai trò người dùng, quy tắc kinh doanh, open questions | Trước khi làm bất cứ điều gì |
| `02_thiet-ke-ui-ux.md` | Design system, màu sắc, phông chữ, bố cục, component guidelines | Trước khi thiết kế hoặc code UI |
| `03_lo-trinh-mcp.md` | Lộ trình 5 giai đoạn, checklist từng bước, timeline | Lập kế hoạch sprint |
| `04_tech-stack.md` | Công nghệ, DB schema, setup guide | Bắt đầu code |
| `05_data-mau.md` | 3 chủ đề mẫu, 5 user mẫu, 8+ bài nộp mẫu, comment mẫu | Tạo seed data |

---

## 🎯 Tóm Tắt Sản Phẩm

**TimeBoxed Peer Learning** là nền tảng học tập ngang hàng áp dụng **Kỹ thuật Feynman** + **Time-Boxing**.

### Luồng chính (3 bước)
```
1. CHỌN CHỦ ĐỀ → Xem danh sách, chọn chủ đề phù hợp, xem chi tiết
2. TỰ HỌC     → Đọc tài liệu trong X phút, viết lại những gì hiểu/chưa hiểu, nộp bài
3. DẠY CHÉO   → Đọc bài của người khác, like, comment, học từ góc nhìn đa chiều
```

### Điểm khác biệt (USP)
- **"Dạy để học"**: Viết lại kiến thức bằng ngôn ngữ của mình = ghi nhớ sâu hơn
- **Time-Boxing**: Giới hạn thời gian tạo áp lực tích cực, tăng tập trung
- **Peer Learning**: Học từ nhiều góc nhìn khác nhau trong cộng đồng
- **Structured Gap Detection**: Phần "Chưa hiểu" giúp người học nhận ra lỗ hổng

### Đối tượng người dùng
- Sinh viên đại học (18–24 tuổi)
- Người đi làm tự học (24–32 tuổi)
- Có nhu cầu chia sẻ và học hỏi nhưng chưa có kênh chất lượng

---

## ⚠️ Open Questions Cần Chốt Ngay

Xem chi tiết trong `01_nghiep-vu.md` — Section 5. Các câu hỏi quan trọng nhất:

1. **Timer có bắt buộc không?** → Đề xuất: Bắt buộc (đúng tinh thần time-boxing)
2. **Bài nộp có sửa được không?** → Đề xuất: Sửa được trong 30 phút đầu
3. **Ai tạo được chủ đề mới?** → V1: Chỉ Admin
4. **File upload hay chỉ link URL?** → V1: Chỉ link URL (đơn giản hóa)

---

## 🚀 Next Steps Ngay Lập Tức

1. **Đọc** `01_nghiep-vu.md` → Chốt các Open Questions với team
2. **Review** Stitch prototype trực tiếp tại link trên
3. **Tạo** các màn hình còn thiếu trong Stitch (Đăng nhập, Nộp bài thành công)
4. **Setup** Supabase project (theo `04_tech-stack.md`)
5. **Khởi tạo** React + Vite project

---

## 📊 Màn Hình Trong Stitch (Tổng Quan)

| Screen | ID | Trạng thái | Ghi chú |
|--------|----|-----------|----|
| Chọn chủ đề | `2cd06f1...` | ✅ Active | Cần thêm filter bar |
| Chi tiết chủ đề: Cung điện ký ức | `3822e00...` | ✅ Active | Version chính |
| Dạy chéo (Peer Learning) | `c378650...` | ✅ Active | Version chính |
| Tự học: Cung điện ký ức | `d38fe60...` | ✅ Active | Version với full content |
| Chi tiết bình luận | `0030fed...` | ✅ Active | Thread comment |
| CogniLearn Learning Platform | `5bd5860...` | ✅ Active | Landing page |
| Dạy chéo (variant) | `08cf714...` | 🔒 Hidden | Variant cũ |
| Chi tiết chủ đề (variant) | `169b14b...` | 🔒 Hidden | Variant cũ |
| Tự học (variant) | `2164876...` | 🔒 Hidden | Variant cũ |
| Chọn chủ đề (variant) | `2a04acd...` | 🔒 Hidden | Variant cũ |
| Tự học (Timer) | `6dca41a...` | 🔒 Hidden | Timer screen riêng |
| Tự học: variant 3 | `77bcf57...` | 🔒 Hidden | Variant |
| Tự học (Timer v2) | `dad23ed...` | 🔒 Hidden | Timer screen v2 |

**Màn hình còn thiếu (cần tạo mới):**
- ❌ Màn hình Đăng nhập / Đăng ký
- ❌ Màn hình Nộp bài thành công (celebration)
- ❌ Màn hình Profile người dùng
- ❌ Màn hình Empty State

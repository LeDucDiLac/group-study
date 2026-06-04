# Thiết kế UI/UX: TimeBoxed Peer Learning

Tài liệu này là chuẩn Design System hiện tại cho frontend sau khi tham khảo phong cách của DOL English tại `https://www.dolenglish.vn/` và kiểm tra trực tiếp các màn hình của dự án. Mục tiêu là giao diện tối giản, hiện đại, dễ đọc, không dùng emoji làm icon và không để chữ chìm vào nền.

---

## 1. Định hướng thị giác

Tinh thần tham khảo:
- Nền sáng, nhiều khoảng trắng, card trắng nổi nhẹ.
- Heading lớn, chắc, dùng xám than thay vì đen tuyệt đối.
- Màu đỏ dùng như màu thương hiệu và hành động, không dùng tràn lan như màu trạng thái.
- Không pha xanh dương/cyan nổi bật vào các thành phần thường xuyên xuất hiện vì sẽ làm giao diện bị xanh đỏ lẫn lộn.
- Card/panel bo 16px, viền mảnh, shadow mềm.
- Icon nhỏ, dạng line icon hoặc shape hình học thống nhất; không dùng emoji trong UI.

Áp dụng cho TimeBoxed:
- Đây là app học tập/dashboard, không phải landing page, nên cỡ chữ cần rõ nhưng không phô trương.
- CTA chính dùng đỏ thương hiệu. Link, tag, category dùng trung tính ấm để không cạnh tranh với CTA.
- Success/timer còn an toàn dùng xanh lá. Warning dùng amber. Error dùng đỏ rượu riêng, khác với đỏ thương hiệu.
- Nội dung viết và bài nộp ưu tiên đọc lâu, body text giữ 15-16px và line-height thoáng.

---

## 2. Màu sắc

### Bảng màu chính

| Token | Hex | Dùng cho |
|---|---:|---|
| Primary | `#34303A` | Nền tối nhỏ, avatar, text đậm |
| Primary Container | `#25222B` | Heading, title, text quan trọng |
| Brand Red | `#CF3A32` | CTA chính, active state, điểm nhấn thương hiệu |
| Brand Red Dark | `#B8322A` | Hover CTA |
| Brand Red Surface | `#FCEBE8` | Active nav, nền nhấn nhẹ |
| Brand Red Surface Dim | `#F6C9C3` | Border/track nhấn nhẹ |
| Info Neutral | `#8A5A52` | Tag/category, link phụ, icon phụ |
| Info Neutral Dark | `#5A342F` | Text trên nền info nhạt |
| Info Neutral Surface | `#F6EFEC` | Badge tag/category |
| Success | `#176F51` | Timer còn an toàn, hoàn thành |
| Success Dim | `#2F9A73` | Shape/điểm nhấn success |
| Success Surface | `#EAF6F0` | Banner/badge success |
| Warning | `#8A5200` | Chưa duyệt, gần hết thời gian |
| Warning Surface | `#FFF2D5` | Badge/banner warning |
| Error | `#9F1239` | Lỗi, từ chối, hành động nguy hiểm |
| Error Surface | `#FFE4E6` | Nền cảnh báo lỗi |
| Background | `#FCFAF8` | Nền trang |
| Surface | `#FFFFFF` | Card, modal, navbar |
| Surface Low | `#F7F2EF` | Input, hover, panel phụ |
| Surface Container | `#EFE7E2` | Disabled button, progress track |
| Border | `#E0D6D0` | Border form/card |
| Border Subtle | `#ECE3DE` | Divider, table row |
| Text | `#25222B` | Body text |
| Text Muted | `#514A55` | Mô tả, meta |
| Text Subtle | `#6F6672` | Helper, timestamp |

### Quy tắc dùng màu

- Đỏ thương hiệu `#CF3A32` chỉ dùng cho hành động chính, active state và một số shape nhấn thương hiệu.
- Không dùng đỏ thương hiệu cho lỗi. Lỗi dùng `#9F1239` để người dùng phân biệt CTA với trạng thái sai/hỏng.
- Không dùng xanh dương/cyan làm màu hệ thống thường xuyên. Tag/category dùng `Info Neutral`.
- Xanh lá chỉ dùng cho trạng thái tích cực: đã nộp, đang mở, hoàn thành, timer còn an toàn.
- Amber chỉ dùng cho trạng thái chờ hoặc cần chú ý.
- Mỗi cụm UI chỉ nên có một màu nhấn chính. Nếu CTA đã đỏ thì badge/tag trong cụm đó dùng trung tính.

### Quy tắc tương phản

- Chữ trắng chỉ đặt trên `#CF3A32`, `#B8322A`, `#34303A`, `#25222B`, `#176F51`, `#9F1239` hoặc nền đủ tối.
- Không đặt `Text Subtle` trên `Surface Container` nếu text nhỏ hơn 14px.
- Disabled button không dùng opacity toàn bộ; dùng nền `Surface Container` và chữ `Text Muted`.
- Warning text dùng `#6B3B00` trên `#FFF2D5`, không dùng amber sáng trên nền trắng.
- Error text dùng `#881337` hoặc `#9F1239` trên nền lỗi nhạt, không dùng brand red cho error copy.

---

## 3. Typography

Font chính: Plus Jakarta Sans. Inter dùng làm fallback.

Lý do:
- Plus Jakarta Sans tạo cảm giác hiện đại, chắc, hợp heading lớn và tiếng Việt.
- Font có x-height tốt, phù hợp giao diện giáo dục có nhiều form, bảng và nội dung dài.

Scale áp dụng cho app:

| Style | Size | Weight | Line Height | Dùng cho |
|---|---:|---:|---:|---|
| Display | 44px | 800 | 1.12 | Trang danh sách/hero nhỏ |
| H1 | 32-36px | 700-800 | 1.2 | Tiêu đề màn hình |
| H2 | 28-32px | 700 | 1.25 | Section lớn |
| H3/Card Title | 20-22px | 700 | 1.3 | Card/panel title |
| Body | 16px | 400 | 1.6 | Nội dung đọc |
| Body Small | 14px | 400/500 | 1.5 | Form, table, meta |
| Caption | 12px | 500 | 1.4 | Helper, timestamp |
| Timer | 56px | 800 | 1.0 | Đồng hồ lớn nếu cần |

Quy tắc cỡ chữ:
- Card title không dưới 20px ở desktop.
- Table text tối thiểu 14px.
- Helper text 12px nhưng phải dùng màu đủ tương phản.
- Không dùng negative letter spacing.
- Không scale font theo viewport width.

---

## 4. Hình khối và layout

| Thành phần | Radius | Ghi chú |
|---|---:|---|
| Button | 12-16px | CTA chính chắc, dễ bấm |
| Card | 16px | Block học tập hiện đại, không sắc cạnh |
| Modal | 20px | Nổi rõ nhưng không quá trang trí |
| Badge/Pill | 9999px | Dùng cho status/tag |
| Avatar | 9999px | Tròn |
| Input/Textarea | 16px | Nhất quán card/form |

Spacing:
- Page container tối đa 1200px.
- Card grid gap 16-24px.
- Card padding 20-24px.
- Form field gap 12-16px.
- Section gap 40-64px.

Không lồng card trong card. Nếu cần nhóm nội dung trong card, dùng divider hoặc surface nhẹ.

---

## 5. Component guidelines

### Button

| Loại | Style | Dùng khi |
|---|---|---|
| Primary | Nền đỏ `#CF3A32`, chữ trắng | Hành động chính |
| Secondary | Nền trắng, border nhẹ, chữ đỏ | Hành động phụ |
| Ghost | Không nền, hover nền xám ấm nhạt | Điều hướng phụ |
| Destructive | Nền error `#9F1239`, chữ trắng | Từ chối/xóa |
| Disabled | Nền `#EFE7E2`, chữ `#514A55` | Không dùng opacity gây chìm chữ |

Nút có icon line khi hành động quen thuộc: tiếp tục, quay lại, tải lên, xác nhận, đóng.

### Badge

Badge trạng thái dùng text ngắn kèm chấm màu nhỏ:
- Đang mở: success.
- Đã đóng: neutral.
- Chưa duyệt: warning.
- Từ chối/lỗi: error.

Tag/category dùng info neutral, không dùng đỏ để tránh nhầm với CTA và không dùng xanh dương để tránh rối hệ màu.

### Cards

Card cần:
- Title lớn, rõ, tối thiểu 20px desktop.
- Description tối đa 2-4 dòng.
- Meta nhỏ nhưng đủ tương phản.
- Badge nằm góc phải hoặc gần title để scan nhanh.
- Shadow mềm, viền `Border Subtle`.

### Forms

Input và textarea:
- Nền `Surface Low`.
- Focus chuyển trắng, border đỏ thương hiệu.
- Placeholder dùng `Text Subtle`, không dùng như label.
- Error text dùng `Error`.

---

## 6. Icon system

Không dùng emoji làm icon trong UI.

Không dùng:
- Emoji file: ảnh, PDF, Word, Excel/PPT, video, zip, đính kèm.
- Emoji trạng thái: check, question, warning, celebration, lock.
- Emoji tương tác: heart, comment, user, search.

Dùng line SVG icon thống nhất:
- Stroke 1.8px.
- Size 14px cho caption/table.
- Size 16-18px cho button/form.
- Size 24px cho empty/upload state.
- Icon màu theo text hiện tại, tránh nhiều màu trong cùng một cụm.

Map icon:

| Ý nghĩa | Icon |
|---|---|
| Tài liệu/chủ đề | `book`, `fileText` |
| Timer/thời gian | shape time hoặc `calendar` |
| Đã hiểu | `check` |
| Câu hỏi/chưa hiểu | `question` |
| Upload/đính kèm | `upload`, `paperclip` |
| Ảnh | `fileImage` |
| File khác | `fileText` |
| Like | `heart` line icon |
| Bình luận | `comment` |
| Tìm kiếm | `search` |
| Khóa | `lock` |
| Quay lại | `arrowLeft` |

Shape minh họa:
- Shape `primary`: hệ thống/admin/cấu trúc.
- Shape `blue`: giữ tên API cũ để tránh sửa nhiều code, nhưng màu hiển thị là đỏ thương hiệu/coral, không còn là xanh dương.
- Shape `emerald`: success/timer/achievement.
- Shape `amber`: pending/warning.
- Shape `surface/ghost`: empty hoặc phụ trợ.

---

## 7. Màn hình cần tuân thủ

### User

- `/topics`: danh sách chủ đề dùng nền sáng, card trắng, category tag trung tính ấm, CTA đỏ.
- `/topics/:id`: title lớn, sidebar stats rõ, không dùng quá nhiều màu trong cùng block.
- `/topics/new`: form ưu tiên readability, warning box dùng amber, tag chip dùng Brand Red Surface nhẹ.
- `/topics/:id/learn`: timer là màu semantic, upload area không dùng emoji file, text cảnh báo lỗi dùng error wine.
- `/topics/:id/peer`: bài nộp và comment dùng màu tiết chế; like không làm cả card đỏ.

### Admin

- Sidebar có nền primary container, active item dùng đỏ thương hiệu.
- Bảng dùng text 14px trở lên, border subtle, hover surface low.
- Approve dùng primary/action nếu là hành động chính; reject dùng destructive.

---

## 8. Checklist nghiệm thu UI

- Không còn emoji icon trong các màn hình chính.
- Không còn xanh dương/cyan nổi bật trong tag, shape, logo app hoặc progress phụ.
- Red brand không được dùng làm error text.
- Chữ trắng luôn nằm trên nền đủ tối.
- Helper/meta không bị chìm trên nền xám/ấm.
- Button disabled vẫn đọc được.
- Mobile không bị tràn chữ trong button/card.
- Mỗi màn hình chỉ có 1 màu nhấn chính ngoài các màu semantic bắt buộc.

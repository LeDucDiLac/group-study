# 🗃️ Data Mẫu Chất Lượng — TimeBoxed Peer Learning

> Tài liệu này định nghĩa toàn bộ data mẫu (seed data) cần tạo để bản demo MCP truyền tải đúng tinh thần sản phẩm và không gây hiểu sai chức năng.

---

## Nguyên tắc thiết kế Data Mẫu

1. **Đa dạng chủ đề** — Phủ nhiều lĩnh vực (STEM, Xã hội, Kỹ năng mềm) để user thấy tính tổng quát
2. **Bài nộp thật sự chất lượng** — Không viết ẩu, phải thể hiện đúng "viết lại kiến thức bằng ngôn ngữ của mình"
3. **Comment tự nhiên** — Đúng tone peer learning: động viên, bổ sung, đặt câu hỏi
4. **Phân bố likes tự nhiên** — Không đều nhau, có bài nhiều like, có bài ít

---

## Chủ đề Mẫu (Topics)

### 📐 Chủ đề 1: Giải Tích 1 — Giới hạn và Liên tục

```json
{
  "id": "topic-001",
  "title": "Giải Tích 1 — Giới hạn và Liên tục",
  "category": "Toán học",
  "tags": ["Giải tích", "Đại học", "Toán"],
  "description": "Giới hạn là nền tảng của Giải tích. Trong phiên học này, bạn sẽ đọc tài liệu về định nghĩa giới hạn (epsilon-delta), tính chất của giới hạn, và hàm liên tục. Sau đó viết lại những gì bạn hiểu và những gì còn mơ hồ.",
  "duration_minutes": 30,
  "participant_count": 24,
  "resources": [
    { "type": "link", "label": "Bài giảng Giới hạn - ĐH Bách Khoa", "url": "https://example.com" },
    { "type": "link", "label": "Khan Academy - Limits (vietsub)", "url": "https://example.com" }
  ],
  "prerequisites": "Hiểu về hàm số, đồ thị",
  "status": "open"
}
```

### 💻 Chủ đề 2: Python Cơ Bản — List và Dictionary

```json
{
  "id": "topic-002",
  "title": "Python Cơ Bản — List và Dictionary",
  "category": "Lập trình",
  "tags": ["Python", "Lập trình", "Beginner"],
  "description": "List và Dictionary là hai cấu trúc dữ liệu quan trọng nhất trong Python. Tìm hiểu về cách khởi tạo, các phương thức phổ biến, và khi nào nên dùng cái nào. Hãy viết lại bằng ngôn ngữ của bạn kèm ví dụ cụ thể.",
  "duration_minutes": 25,
  "participant_count": 38,
  "resources": [
    { "type": "link", "label": "Python Docs - Lists", "url": "https://docs.python.org" },
    { "type": "link", "label": "W3Schools - Python Dictionary", "url": "https://w3schools.com" }
  ],
  "prerequisites": "Biết cú pháp Python cơ bản (biến, if/else, vòng lặp)",
  "status": "open"
}
```

### 🧠 Chủ đề 3: Kỹ Thuật Feynman — Học Bằng Cách Dạy

```json
{
  "id": "topic-003",
  "title": "Kỹ Thuật Feynman — Học Bằng Cách Dạy",
  "category": "Kỹ năng học tập",
  "tags": ["Kỹ năng mềm", "Phương pháp học", "Productivity"],
  "description": "Kỹ thuật Feynman là phương pháp học mạnh mẽ nhất được Richard Feynman (nhà vật lý đoạt Nobel) phát triển. Bạn thực sự hiểu một thứ khi bạn có thể giải thích nó đơn giản. Đọc và viết lại.",
  "duration_minutes": 20,
  "participant_count": 15,
  "resources": [
    { "type": "link", "label": "The Feynman Technique - farnam street", "url": "https://fs.blog/feynman-technique/" }
  ],
  "prerequisites": "Không có",
  "status": "open"
}
```

---

## Tài Khoản Người Dùng Mẫu

| ID | Tên | Email | Avatar | Mô tả |
|----|-----|-------|--------|-------|
| `user-001` | Nguyễn Minh Anh | minha@example.com | (nữ) | Sinh viên năm 3 CNTT, hay hỏi câu hỏi sắc bén |
| `user-002` | Trần Quốc Hùng | hung.tq@example.com | (nam) | Kỹ sư phần mềm 2 năm kinh nghiệm, viết rõ ràng |
| `user-003` | Lê Thị Phương | phuong.le@example.com | (nữ) | Sinh viên năm 1, hay viết nhầm nhưng cố gắng |
| `user-004` | Phạm Đức Thắng | thang.pd@example.com | (nam) | Sinh viên năm 4, giải thích chắc, ít like nhưng quality |
| `user-005` | Vũ Ngọc Mai | mai.vn@example.com | (nữ) | Người đi làm tự học, góc nhìn thực tế ứng dụng |

---

## Bài Nộp Mẫu (Submissions)

### Chủ đề 1 — Giải Tích 1: Giới hạn

---
**Bài của Nguyễn Minh Anh** (user-001) | 18 likes

**✅ Những gì tôi hiểu:**
> Giới hạn của hàm f(x) khi x tiến tới a là giá trị mà f(x) "tiến gần đến" khi x ngày càng gần a, nhưng không nhất thiết phải bằng f(a). Tôi hay hình dung như thế này: đặt mình đứng ở vị trí x, bước ngày càng gần điểm a, thì giá trị hàm số tôi đang đứng ở đó ngày càng tiến về một số nào đó — số đó là giới hạn.
>
> Tính chất quan trọng nhất: giới hạn của tổng = tổng của giới hạn. Tương tự với tích và thương (với điều kiện mẫu ≠ 0).

**❓ Những gì tôi chưa hiểu:**
> Định nghĩa epsilon-delta vẫn còn mơ hồ với tôi. Tôi đọc nhưng không hình dung được tại sao lại cần định nghĩa phức tạp vậy khi có thể dùng khái niệm "tiến gần" trực quan. Cần ai giải thích thêm.

**📎 Tài liệu đính kèm:** [Link tóm tắt các công thức giới hạn](https://example.com)

---

**Bài của Trần Quốc Hùng** (user-002) | 12 likes

**✅ Những gì tôi hiểu:**
> Định nghĩa epsilon-delta thực ra là cách "chặt chẽ hóa" khái niệm "tiến gần". Epsilon là sai số chấp nhận được về phía output, delta là sai số input tương ứng. Nói nôm na: "Nếu bạn muốn kết quả sai không quá epsilon, tôi có thể đảm bảo điều đó bằng cách giữ x trong khoảng delta."
>
> Hàm liên tục tại a nghĩa là giới hạn khi x→a = f(a). Tức là không có "nhảy bậc" hay lỗ hổng tại điểm đó.

**❓ Những gì tôi chưa hiểu:**
> Định lý Bolzano (Intermediate Value Theorem) tôi hiểu ý tưởng nhưng chưa tự chứng minh được. Cần luyện tập thêm.

---

**Bài của Lê Thị Phương** (user-003) | 5 likes

**✅ Những gì tôi hiểu:**
> Giới hạn là khi x gần a thì f(x) gần đến một giá trị L nào đó. Hàm liên tục là khi giới hạn bằng giá trị tại điểm đó.

**❓ Những gì tôi chưa hiểu:**
> Tôi vẫn bị nhầm giữa giới hạn 1 bên (trái/phải) và giới hạn 2 bên. Khi nào thì giới hạn tồn tại? Khi nào thì không?

---

### Chủ đề 2 — Python: List và Dictionary

---
**Bài của Vũ Ngọc Mai** (user-005) | 22 likes

**✅ Những gì tôi hiểu:**
> List trong Python là danh sách có thứ tự, có thể chứa bất kỳ kiểu dữ liệu nào. Tôi hay dùng list khi cần giữ thứ tự và có thể có phần tử trùng lặp.
>
> Dictionary là bảng tra cứu, hoạt động theo cặp key-value. Key phải unique và immutable (chuỗi, số, tuple). Tôi hay dùng dict khi cần tra cứu nhanh theo "tên" thay vì theo vị trí.
>
> Ví dụ thực tế: Quản lý điểm sinh viên — dùng dict `{"Nguyen Minh Anh": 9.5, "Tran Quoc Hung": 8.0}` thay vì list sẽ tìm kiếm nhanh hơn nhiều.

**❓ Những gì tôi chưa hiểu:**
> Dict comprehension tôi chưa quen. `{k: v for k, v in ...}` — cú pháp này khi nào nên dùng thay vì vòng for thường?

---

**Bài của Phạm Đức Thắng** (user-004) | 16 likes

**✅ Những gì tôi hiểu:**
> **List**: Ordered, mutable, allow duplicates. Các phương thức hay dùng: `.append()`, `.extend()`, `.pop()`, `.sort()`, `.index()`, slicing `[start:end:step]`.
>
> **Dictionary**: Key-value, unordered (Python 3.7+ thực ra là insertion-ordered), key phải hashable. Phương thức hay dùng: `.get()`, `.items()`, `.keys()`, `.values()`, `.update()`.
>
> **Khi nào dùng cái nào**: Nếu data có "tên" — dùng dict. Nếu data chỉ là danh sách tuần tự — dùng list.

**❓ Những gì tôi chưa hiểu:**
> Performance: khi nào thì `in` operator trong dict O(1) và trong list O(n)? Muốn hiểu sâu hơn về hash table phía sau.

---

### Chủ đề 3 — Kỹ Thuật Feynman

---
**Bài của Trần Quốc Hùng** (user-002) | 30 likes

**✅ Những gì tôi hiểu:**
> Kỹ thuật Feynman gồm 4 bước:
> 1. Chọn chủ đề muốn học
> 2. Giải thích nó như thể đang dạy cho một đứa trẻ 12 tuổi
> 3. Khi bị "kẹt" (không giải thích được) → đó là lỗ hổng kiến thức → quay lại tài liệu
> 4. Đơn giản hóa và dùng analogy (phép so sánh)
>
> Điều tôi thấy quan trọng nhất: **sự "kẹt" chính là learning opportunity**, không phải thất bại. Đây là bước quan trọng nhất mà nhiều người bỏ qua.

**❓ Những gì tôi chưa hiểu:**
> Làm thế nào để áp dụng cho kiến thức toán học trừu tượng (như epsilon-delta)? Không thể dùng analogy đơn giản cho mọi thứ.

---

## Comment Mẫu

### Comments trên bài của Nguyễn Minh Anh (chủ đề Giải tích)

**Trần Quốc Hùng** đã comment:
> Giải thích "đứng tại vị trí x và bước gần" của bạn rất trực quan! Về epsilon-delta, thực ra nó giải quyết vấn đề thế này: định nghĩa "tiến gần" bằng ngôn ngữ thông thường rất mơ hồ — "gần" là bao nhiêu? Epsilon-delta định lượng hóa sự "gần" đó. Hy vọng giúp ích!

**Lê Thị Phương** đã comment:
> Cảm ơn bạn! Bạn có thể giải thích thêm về giới hạn 1 bên không?

**Nguyễn Minh Anh** đã reply:
> @Phương: Giới hạn trái là khi x tiến tới a từ bên trái (x < a), giới hạn phải là từ bên phải (x > a). Giới hạn 2 bên tồn tại khi và chỉ khi cả 2 giới hạn 1 bên tồn tại VÀ bằng nhau!

---

### Comments trên bài của Vũ Ngọc Mai (chủ đề Python)

**Phạm Đức Thắng** đã comment:
> Ví dụ quản lý điểm sinh viên của bạn rất thực tế! Để trả lời câu hỏi về dict comprehension: dùng nó khi bạn muốn tạo dict từ một iterable có sẵn trong 1 dòng, dễ đọc hơn for loop. Ví dụ: `{student: score * 1.1 for student, score in grades.items() if score > 7}`

**Nguyễn Minh Anh** đã comment:
> Bài này hay quá! Tôi chưa nghĩ đến việc dùng dict cho quản lý điểm. Trước giờ tôi dùng 2 list song song, rất bất tiện.

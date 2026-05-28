# ⚙️ Tech Stack — TimeBoxed Peer Learning

> Tài liệu này định nghĩa công nghệ được chọn và lý do, phục vụ việc triển khai MCP nhanh và ổn định.

---

## Tiêu chí chọn Tech Stack

1. **Deploy nhanh** — Team không cần tốn nhiều thời gian cấu hình
2. **Free tier đủ dùng** cho bản demo/MCP
3. **Phù hợp với team** — Không dùng công nghệ mà team chưa biết
4. **Scalable** — Có thể mở rộng khi sản phẩm phát triển

---


## MongoDB Data Model (Option C)

> Dung cho backend Node.js + MongoDB. Uu tien nhung du lieu lien quan vao document de giam so collection.

### Collections (rut gon)

#### users

```
{
  _id: ObjectId,
  email: String,
  passwordHash: String,
  displayName: String,
  bio: String,
  role: "learner" | "admin",
  rank: Number,             // tong diem rank
  submissionPeekedAt: Date, // ngay da dung quyen xem bai nop (rank 4-5)
  submissionPeekedTopicId: ObjectId, // topic da dung quyen trong ngay
  recentActivities: [
    {
      _id: ObjectId,
      title: String,
      target: Object, // { topicId, submissionId, commentId, subCommentId }
      createdAt: Date,
    }
  ], // tối đa 3 phần tử
  summary: {
    submissions: [Object],        // { topicId, submissionId }
    likesReceived: Number,        // tổng số like đã nhận
    liked: [Object],              // { topicId, submissionId, commentId }
  },
  createdAt: Date,
  updatedAt: Date,
}
```

#### ranks

```
{
  _id: ObjectId,
  level: Number,            // 1-10
  name: String,             // ten rank doc tu nghiep vu (01_nghiep-vu.md)
  createdAt: Date,
}
```

#### notifications

```
{
  _id: ObjectId,
  userId: ObjectId,          // users._id
  actorId: ObjectId,
  type: "comment" | "system",
  title: String,
  content: String,
  target: {
    topicId: ObjectId,
    submissionId: ObjectId,
    commentId: ObjectId,
    subCommentId: ObjectId,
  },
  isRead: Boolean,
  createdAt: Date,
}
```

#### bookmarks

```
{
  _id: ObjectId,
  userId: ObjectId,          // users._id
  target: {
    topicId: ObjectId,
    submissionId: ObjectId,
    commentId: ObjectId,
    subCommentId: ObjectId,
  },
  type: "topic" | "submission" | "comment",
  note: String,
  createdAt: Date,
  updatedAt: Date,
}
```

#### topics

```
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  tags: [String],
  status: "Chưa duyệt", "Bị từ chối", "Đang mở", "Đã hoàn thành",
  windowHours: Number,      // thoi luong nop bai tinh tu luc bat dau hoc
  createdBy: ObjectId,       // users._id
  resources: [
    {
      type: "link" | "file",
      label: String,
      url: String,
    }
  ],
  Participation: [
    {
      userId: ObjectId,
      startedAt: Date,
    }
  ]
  submissions: [
    {
      _id: ObjectId,
      userId: ObjectId,
      understood: String,
      notUnderstood: String,
      isAnonymous: Boolean,
      status: "Chưa duyệt", "Đã duyệt",
      reactions: {
        like: [ObjectId],
        dislike: [ObjectId],
      },
      resources: [
        {
          type: "link" | "file",
          label: String,
          url: String,
        }
      ],
      comments: [
        {
          _id: ObjectId,
          userId: ObjectId,
          content: String,
          reactions: {
            like: [ObjectId],
            dislike: [ObjectId],
          },
          subcomments: [
            _id: ObjectId,
            userId: ObjectId,
            content: String,
            reactions: {
              like: [ObjectId],
              dislike: [ObjectId],
            },
            createdAt: Date,
          ],
          createdAt: Date,
        }
      ],
      createdAt: Date,
      updatedAt: Date,
    }
  ],
  createdAt: Date,
  updatedAt: Date,
}
```

---

### Ghi chu

- Chi muc goi y: topics.status, topics.category.
- Gate xem bai nop: chi tra ve bai nop khi user da nop, hoac topic da completed.
- An danh: neu isAnonymous = true, API khong tra ve userId va thong tin user.

---

## Environment Variables (.env.local)

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJ...
```

---

## Tailwind Config (Design Tokens)

```js
// tailwind.config.js
export default {
  content: ['./src/**/*.{jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E293B',
        'primary-dark': '#091426',
        secondary: '#0058BE',
        'secondary-light': '#2170E4',
        accent: '#00A472',
        'accent-light': '#4EDEA3',
        surface: '#F7F9FB',
        'surface-low': '#F2F4F6',
        'surface-container': '#ECEEF0',
        border: '#C5C6CD',
        'text-primary': '#191C1E',
        'text-secondary': '#45474C',
        'text-muted': '#75777D',
        error: '#BA1A1A',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'timer': ['64px', { lineHeight: '1', fontWeight: '800', letterSpacing: '-0.04em' }],
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '4px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      maxWidth: {
        content: '1200px',
        reading: '800px',
      },
      boxShadow: {
        card: '0 4px 20px rgba(0,0,0,0.05)',
      },
    },
  },
}
```

---

## Hướng Dẫn Setup Nhanh (Quick Start)

```bash
# 1. Tạo Supabase project tại supabase.com
# 2. Chạy SQL schema ở trên trong Supabase SQL Editor
# 3. Clone repo và setup

npm create vite@latest timebox-peer-learning -- --template react
cd timebox-peer-learning
npm install

# Install dependencies
npm install @supabase/supabase-js
npm install lucide-react
npm install react-router-dom
npm install zustand
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 4. Tạo .env.local với Supabase credentials
# 5. Chạy development
npm run dev
```

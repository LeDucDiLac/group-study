# ⚙️ Tech Stack — TimeBoxed Peer Learning

> Tài liệu này định nghĩa công nghệ được chọn và lý do, phục vụ việc triển khai MCP nhanh và ổn định.

---

## Tiêu chí chọn Tech Stack

1. **Deploy nhanh** — Team không cần tốn nhiều thời gian cấu hình
2. **Free tier đủ dùng** cho bản demo/MCP
3. **Phù hợp với team** — Không dùng công nghệ mà team chưa biết
4. **Scalable** — Có thể mở rộng khi sản phẩm phát triển

---

## Stack Khuyến Nghị (Option A — Nhanh nhất)

| Tầng | Công nghệ | Lý do |
|------|----------|-------|
| **Frontend** | React + Vite | Nhanh, quen thuộc, ecosystem tốt |
| **Styling** | Tailwind CSS | Phù hợp với Design System token-based |
| **Icons** | Lucide React | Nhất quán, open-source |
| **Font** | Google Fonts (Inter) | Miễn phí, CDN nhanh |
| **Backend + DB + Auth** | Supabase | BaaS, PostgreSQL sẵn có, Auth sẵn có, Storage sẵn có, Free tier 500MB |
| **File Upload** | Supabase Storage | Tích hợp sẵn với Supabase |
| **Deploy Frontend** | Vercel | Miễn phí, CI/CD tự động từ GitHub |
| **Domain** | Vercel subdomain (.vercel.app) | Miễn phí, không cần mua domain |

**Tổng chi phí MCP: $0/tháng**

---

## Stack Thay Thế (Option B — Nếu team muốn tự build backend)

| Tầng | Công nghệ | Ghi chú |
|------|----------|---------|
| **Frontend** | Next.js 14 (App Router) | SSR tốt hơn cho SEO |
| **Backend** | Express.js hoặc FastAPI | Tuỳ team quen ngôn ngữ nào |
| **Database** | PostgreSQL (Railway) | $5/tháng cho Railway Starter |
| **Auth** | JWT + bcrypt | Tự implement |
| **File Upload** | Cloudinary free tier | 25GB storage miễn phí |
| **Deploy** | Railway (backend) + Vercel (frontend) | |

---

## Cấu Trúc Thư Mục (Option A với Supabase)

```
timebox-peer-learning/
├── src/
│   ├── components/
│   │   ├── ui/              # Button, Card, Badge, Avatar...
│   │   ├── topic/           # TopicCard, TopicDetail
│   │   ├── learn/           # Timer, TextEditor, FileUpload
│   │   └── peer/            # SubmissionCard, CommentThread
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── TopicsPage.jsx
│   │   ├── TopicDetailPage.jsx
│   │   ├── LearnPage.jsx
│   │   ├── PeerLearningPage.jsx
│   │   └── SubmissionDetailPage.jsx
│   ├── lib/
│   │   ├── supabase.js      # Supabase client config
│   │   └── api.js           # API helper functions
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useTimer.js
│   │   └── useSubmission.js
│   ├── stores/              # Zustand state management
│   └── styles/
│       └── index.css        # Tailwind + custom tokens
├── public/
├── .env.local               # Supabase URL + API key
├── tailwind.config.js
└── vite.config.js
```

---

## Supabase Database Schema (SQL)

```sql
-- Users (managed by Supabase Auth, extend with profile)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topics
CREATE TABLE topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  tags TEXT[],
  -- Window người dùng có thể nộp bài (tính từ lúc topic được duyệt)
  window_hours INT DEFAULT 48,       -- Mặc định 2 ngày = 48 giờ
  window_start_at TIMESTAMPTZ,       -- Thời điểm mở (sau khi Admin duyệt)
  window_end_at TIMESTAMPTZ,         -- Thời điểm đóng nộp bài
  max_participants INT,
  -- Trạng thái phê duyệt của Admin
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'closed')),
  rejection_reason TEXT,             -- Lý do từ chối (bắt buộc nếu rejected)
  proposal_reason TEXT,              -- Lý do người dùng đề xuất chủ đề
  created_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

-- Topic Resources (tài liệu đính kèm)
CREATE TABLE topic_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('link', 'file')),
  label TEXT,
  url TEXT NOT NULL
);

-- Submissions (bài nộp)
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id),
  user_id UUID REFERENCES profiles(id),
  understood TEXT,            -- Những gì hiểu
  not_understood TEXT,        -- Những gì chưa hiểu
  is_anonymous BOOLEAN DEFAULT FALSE, -- TRUE = ẩn danh, hệ thống vẫn lưu user_id nhưng không expose
  time_spent_seconds INT,     -- Thời gian học thực tế (giây)
  is_locked BOOLEAN DEFAULT TRUE,     -- Luôn TRUE sau khi nộp, không cho sửa
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(topic_id, user_id)   -- Mỗi user chỉ nộp 1 bài/chủ đề
);

-- Submission Resources
CREATE TABLE submission_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('link', 'file')),
  label TEXT,
  url TEXT NOT NULL
);

-- Likes
CREATE TABLE likes (
  submission_id UUID REFERENCES submissions(id),
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (submission_id, user_id)
);

-- Comments
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES submissions(id),
  user_id UUID REFERENCES profiles(id),
  parent_id UUID REFERENCES comments(id),  -- NULL = top-level
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Row Level Security (RLS) Policies

```sql
-- Profiles: ai cũng đọc được, chỉ owner mới sửa
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Submissions: chỉ đọc được nếu BẢN THÂN ĐÃ NỘP BÀI trong cùng topic (gate cứng)
CREATE POLICY "Can view submissions only if you submitted in same topic" ON submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM submissions my_sub
      WHERE my_sub.topic_id = submissions.topic_id
      AND my_sub.user_id = auth.uid()
    )
  );

-- Submissions: chỉ tạo được 1 bài/topic, trong window 48h
CREATE POLICY "Users can insert own submission within window" ON submissions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM topics t
      WHERE t.id = topic_id
      AND t.status = 'approved'
      AND NOW() BETWEEN t.window_start_at AND t.window_end_at
    )
  );

-- NOTE: Khi query submissions để hiển thị, frontend cần:
-- IF is_anonymous = TRUE → thay thế display_name = 'Người dùng ẩn danh', avatar = default
-- KHÔNG expose user_id của bài ẩn danh ra ngoài API (xử lý ở tầng API/RPC)
```

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
  avatarUrl: String,
  bio: String,
  role: "learner" | "admin",
  rank: Number,             // tong diem rank
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
          comments: [
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

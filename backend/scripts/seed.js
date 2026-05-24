import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

const mongoUri = process.env.MONGODB_URI

if (!mongoUri) {
  console.error('MONGODB_URI is not set. Abort seeding.')
  process.exit(1)
}

async function run() {
  await mongoose.connect(mongoUri)

  const db = mongoose.connection.db
  const usersCollection = db.collection('users')
  const ranksCollection = db.collection('ranks')
  const topicsCollection = db.collection('topics')

  await usersCollection.deleteMany({})
  await ranksCollection.deleteMany({})
  await topicsCollection.deleteMany({})

  const now = new Date()

  function createComment({ userId, content, parentId = null }) {
    return {
      _id: new mongoose.Types.ObjectId(),
      userId,
      parentId,
      content,
      reactions: {
        like: [],
        dislike: [],
      },
      createdAt: now,
    }
  }

  function createSubmission({ userId, understood, notUnderstood, isAnonymous = false }) {
    return {
      _id: new mongoose.Types.ObjectId(),
      userId,
      understood,
      notUnderstood,
      isAnonymous,
      timeSpentSeconds: 1500,
      isLocked: true,
      reactions: {
        like: [],
        dislike: [],
      },
      resources: [],
      comments: [],
      createdAt: now,
      updatedAt: now,
    }
  }

  const ranks = [
    { _id: new mongoose.Types.ObjectId(), level: 1, name: 'Tập sự', minPoints: 0, createdAt: now },
    { _id: new mongoose.Types.ObjectId(), level: 2, name: 'Tân binh', minPoints: 100, createdAt: now },
    { _id: new mongoose.Types.ObjectId(), level: 3, name: 'Sinh viên chính thức', minPoints: 200, createdAt: now },
    { _id: new mongoose.Types.ObjectId(), level: 4, name: 'Sinh viên kỳ cựu', minPoints: 300, createdAt: now },
    { _id: new mongoose.Types.ObjectId(), level: 5, name: 'Tinh anh', minPoints: 400, createdAt: now },
    { _id: new mongoose.Types.ObjectId(), level: 6, name: 'Học giả', minPoints: 500, createdAt: now },
    { _id: new mongoose.Types.ObjectId(), level: 7, name: 'Đại học giả', minPoints: 600, createdAt: now },
    { _id: new mongoose.Types.ObjectId(), level: 8, name: 'Lão sư', minPoints: 700, createdAt: now },
    { _id: new mongoose.Types.ObjectId(), level: 9, name: 'Đại lão sư', minPoints: 800, createdAt: now },
    { _id: new mongoose.Types.ObjectId(), level: 10, name: 'Thách đấu', minPoints: 900, createdAt: now },
  ]

  const users = [
    {
      _id: new mongoose.Types.ObjectId(),
      email: 'admin@timebox.local',
      passwordHash: 'placeholder',
      displayName: 'Quản trị',
      avatarUrl: '',
      bio: '',
      role: 'admin',
      rank: 1000,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      email: 'user1@timebox.local',
      passwordHash: 'placeholder',
      displayName: 'Người học 1',
      avatarUrl: '',
      bio: '',
      role: 'learner',
      rank: 10,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      email: 'user2@timebox.local',
      passwordHash: 'placeholder',
      displayName: 'Người học 2',
      avatarUrl: '',
      bio: '',
      role: 'learner',
      rank: 120,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      email: 'user3@timebox.local',
      passwordHash: 'placeholder',
      displayName: 'Người học 3',
      avatarUrl: '',
      bio: '',
      role: 'learner',
      rank: 220,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new mongoose.Types.ObjectId(),
      email: 'user4@timebox.local',
      passwordHash: 'placeholder',
      displayName: 'Người học 4',
      avatarUrl: '',
      bio: '',
      role: 'learner',
      rank: 330,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const topics = [
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Cung điện ký ức cơ bản',
      description: 'Xây dựng cung điện ký ức để ghi nhớ nhanh hơn.',
      category: 'Kỹ năng mềm',
      tags: ['ghi nhớ', 'học tập'],
      status: 'approved',
      proposalReason: 'Kỹ thuật học phổ biến',
      rejectionReason: null,
      windowHours: 48,
      createdBy: users[1]._id,
      approvedBy: users[0]._id,
      approvedAt: now,
      resources: [
        { type: 'link', label: 'Video giới thiệu', url: 'https://example.com/video' },
      ],
      Participation: [
        { userId: users[1]._id, startedAt: now },
        { userId: users[2]._id, startedAt: now },
      ],
      submissions: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Kỹ thuật Feynman 101',
      description: 'Giải thích kiến thức phức tạp bằng ngôn ngữ đơn giản.',
      category: 'Kỹ năng mềm',
      tags: ['feynman', 'học tập'],
      status: 'pending',
      proposalReason: 'Giúp kiểm tra mức độ hiểu',
      rejectionReason: null,
      windowHours: 24,
      createdBy: users[2]._id,
      approvedBy: null,
      approvedAt: null,
      resources: [
        { type: 'link', label: 'Bài viết tham khảo', url: 'https://example.com/article' },
      ],
      Participation: [],
      submissions: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      title: 'Pomodoro tập trung sâu',
      description: 'Luyện tập tập trung với các phiên time-box ngắn.',
      category: 'Hiệu suất',
      tags: ['pomodoro', 'tập trung'],
      status: 'completed',
      proposalReason: 'Cải thiện thói quen tập trung',
      rejectionReason: null,
      windowHours: 36,
      createdBy: users[3]._id,
      approvedBy: users[0]._id,
      approvedAt: now,
      resources: [],
      Participation: [{ userId: users[4]._id, startedAt: now }],
      submissions: [],
      createdAt: now,
      updatedAt: now,
    },
  ]

  const submission1 = createSubmission({
    userId: users[1]._id,
    understood: 'Đã tạo cung điện ký ức với 5 phòng.',
    notUnderstood: 'Khó giữ thứ tự khi danh sách dài.',
  })
  submission1.comments.push(
    createComment({ userId: users[2]._id, content: 'Bố cục ổn, thử liên kết các mục lại.' })
  )

  const submission2 = createSubmission({
    userId: users[2]._id,
    understood: 'Dùng hình ảnh sống động để ghi nhớ.',
    notUnderstood: 'Cần lịch luyện tập tốt hơn.',
    isAnonymous: true,
  })
  const rootComment = createComment({
    userId: users[3]._id,
    content: 'Ôn tập hàng tuần giúp rất nhiều.',
  })
  const replyComment = createComment({
    userId: users[1]._id,
    content: 'Đồng ý, mình làm vào mỗi Chủ nhật.',
    parentId: rootComment._id,
  })
  submission2.comments.push(rootComment, replyComment)

  topics[0].submissions.push(submission1, submission2)

  const submission3 = createSubmission({
    userId: users[4]._id,
    understood: 'Pomodoro giúp mình tập trung theo từng phiên ngắn.',
    notUnderstood: 'Chưa tối ưu thời gian nghỉ.',
  })
  submission3.comments.push(
    createComment({ userId: users[2]._id, content: 'Thử nghỉ 5 phút trước nhé.' })
  )

  topics[2].submissions.push(submission3)

  await ranksCollection.insertMany(ranks)
  await usersCollection.insertMany(users)
  await topicsCollection.insertMany(topics)

  console.log('Seed completed:', {
    users: users.length,
    topics: topics.length,
  })

  await mongoose.disconnect()
}

run().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})

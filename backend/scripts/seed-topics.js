import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Topic from '../src/models/Topic.js'
import User from '../src/models/User.js'

dotenv.config()

const mongoUri = process.env.MONGODB_URI

if (!mongoUri) {
  console.error('MONGODB_URI is not set. Abort seeding.')
  process.exit(1)
}

async function run() {
  await mongoose.connect(mongoUri)

  console.log('Connected to MongoDB. Creating a LARGE batch of topics, users, and discussions...')

  // Step 1: Make sure we have plenty of users (at least 20)
  let users = await User.find({ role: { $ne: 'admin' } })
  const defaultPasswordHash = '$2a$10$FuUaPtSpG7StS6hILY9vpukUVRCHK0eD26h.AMTiqYQtuWG/kSMO.' 
  
  if (users.length < 20) {
    console.log(`Currently have ${users.length} learner users. Generating more to reach 20...`)
    const firstNames = ['Bảo', 'Châu', 'Dương', 'Hải', 'Khang', 'Linh', 'Minh', 'Ngọc', 'Phong', 'Quyên', 'Sơn', 'Trang', 'Uyên', 'Vy', 'Xuân', 'Anh', 'Bình', 'Thành', 'Hoa', 'Long']
    const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Huỳnh', 'Đặng', 'Vũ', 'Phan', 'Trương', 'Ngô']
    
    const newUsersToCreate = []
    const toCreateCount = 20 - users.length
    for(let i = 0; i < toCreateCount; i++) {
        const fn = firstNames[Math.floor(Math.random() * firstNames.length)]
        const ln = lastNames[Math.floor(Math.random() * lastNames.length)]
        newUsersToCreate.push({
            email: `learner_${Date.now()}_${i}@example.com`,
            displayName: `${ln} ${fn}`,
            role: 'learner',
            passwordHash: defaultPasswordHash,
            rank: Math.floor(Math.random() * 200) + 10
        })
    }
    const createdUsers = await User.insertMany(newUsersToCreate)
    users = [...users, ...createdUsers]
  }

  const userIds = users.map(u => u._id)
  
  const categories = ['Lập trình', 'Kiến trúc', 'Database', 'DevOps', 'Thuật toán', 'Bảo mật', 'Kỹ năng mềm']
  const tagPool = ['javascript', 'nodejs', 'mongodb', 'docker', 'ci-cd', 'react', 'architecture', 'design-patterns', 'agile', 'git', 'aws', 'linux', 'testing']

  const rawTopicTitles = [
    "Làm sao để làm chủ React Server Components?",
    "Áp dụng Clean Architecture cho dự án thực tế",
    "Tối ưu hoá hiệu năng cho ứng dụng Node.js",
    "Thiết kế cơ sở dữ liệu cho hệ thống E-commerce",
    "Làm quen với Kubernetes cho người mới bắt đầu",
    "Sử dụng Redis cache thế nào cho chuẩn?",
    "JWT vs Session Cookies: Phân tích ưu nhược điểm",
    "GraphQL có thực sự thay thế được REST API?",
    "Khám phá các Design Patterns phổ biến trong JS",
    "Cách viết Unit Test hiệu quả với Jest",
    "Hướng dẫn cấu hình CI/CD với GitLab Actions",
    "Giải bài toán N+1 query trong GraphQL và TypeORM",
    "Cách quản lý state toàn cục với Redux Toolkit",
    "Microservices vs Monolith: Khi nào nên chuyển đổi?",
    "Tìm hiểu về Apache Kafka và các use cases",
    "Những nguyên tắc bảo mật quan trọng với Web App",
    "Giới thiệu WebSockets và cách ứng dụng realtime",
    "Thực hành TDD (Test Driven Development) trong TypeScript",
    "Xây dựng hệ thống Notification Scale lớn",
    "Làm chủ Git: Các khái niệm nâng cao"
  ];

  const understoodTemplates = [
    "Mình đã nắm được concept cơ bản và cách setup.",
    "Phần lý thuyết khá dễ hiểu. Mình đã chạy thử thành công một ví dụ nhỏ.",
    "Tôi hiểu ý tưởng thiết kế và lợi ích mang lại so với công nghệ cũ.",
    "Bài viết rất chi tiết, mình đã nắm vững các bước triển khai.",
    "Đã hiểu rõ cách vận hành của flow này thông qua tài liệu.",
    "Các điểm chính như A, B, C mình đã thông suốt."
  ]

  const notUnderstoodTemplates = [
    "Còn phần config nâng cao mình chưa rõ lắm, ai giải thích thêm giúp không?",
    "Tuy nhiên khi áp dụng vào case thực tế phức tạp thì hơi vướng.",
    "Đọc tài liệu thì hiểu nhưng lúc debug vẫn gặp nhiều lỗi lạ.",
    "Làm sao để scale mô hình này lên 1 triệu user? Phần này còn mơ hồ.",
    null, null, // allow null to simulate perfect understanding
    "Cần thêm ví dụ minh hoạ về phần handle error.",
    "Mình bị kẹt ở đoạn setup biến môi trường."
  ]

  const feedbackTemplates = [
    "Cách bạn hiểu như vậy là đúng rồi đấy. Cứ mạnh dạn áp dụng nhé.",
    "Bạn chú ý phần X, nếu không cẩn thận sẽ dính bug đó.",
    "Về phần bạn chưa rõ, thử tìm hiểu thêm về Y xem sao, rất hữu ích.",
    "Mình cũng từng gặp lỗi tương tự, fix bằng cách...",
    "Giải pháp này tốt nhưng có thể gây overhead về CPU, hãy monitor cẩn thận.",
    "Cảm ơn bạn đã share góc nhìn. Mình xin bổ sung thêm một ý...",
    "Nên cẩn trọng với các limit của thư viện nhé, đôi khi vượt quá sẽ lỗi memory."
  ]

  console.log(`Generating ${rawTopicTitles.length} topics...`);

  const createdTopics = []

  for (let i = 0; i < rawTopicTitles.length; i++) {
    const title = rawTopicTitles[i]
    
    // Choose 2-3 random tags
    const numTags = Math.floor(Math.random() * 2) + 2
    const shuffledTags = [...tagPool].sort(() => 0.5 - Math.random())
    const selectedTags = shuffledTags.slice(0, numTags)

    const topic = new Topic({
      title: title,
      description: `Một chủ đề thú vị: ${title}. Mời các bạn cùng thảo luận, chia sẻ góc nhìn và đặt câu hỏi. Đừng ngại chia sẻ những khó khăn.`,
      category: categories[Math.floor(Math.random() * categories.length)],
      tags: selectedTags,
      windowHours: [24, 48, 72][Math.floor(Math.random() * 3)],
      createdBy: userIds[Math.floor(Math.random() * userIds.length)],
      status: Math.random() > 0.8 ? 'Đã hoàn thành' : 'Đang mở',
      resources: Math.random() > 0.5 ? [
        { type: 'link', label: 'Tài liệu tham khảo chính', url: 'https://developer.mozilla.org/' }
      ] : []
    })

    // Random subset of users as participants (5 to 10)
    const shuffledUsers = [...userIds].sort(() => 0.5 - Math.random())
    const participantCount = Math.floor(Math.random() * 6) + 5
    const participants = shuffledUsers.slice(0, participantCount)
    
    topic.Participation = participants.map(uid => ({
      userId: uid,
      startedAt: new Date(Date.now() - Math.random() * 1000 * 3600 * 48)
    }))

    topic.submissions = []
    
    // Create submissions purely from those who participated
    const subCount = Math.floor(Math.random() * participants.length) + 1
    const subAuthorList = participants.slice(0, subCount)

    for (const subAuthorId of subAuthorList) {
        
        const numComments = Math.floor(Math.random() * 4) + 1 // 1 to 4 comments per submission
        const comments = []

        for (let j = 0; j < numComments; j++) {
            const commentAuthorId = participants[Math.floor(Math.random() * participants.length)]
            
            const subComments = []
            // 30% chance for a subcomment
            if (Math.random() > 0.7) {
                subComments.push({
                    userId: subAuthorId, // Author replies back
                    content: "Cảm ơn góp ý của bạn nha. Quả đúng là mình thiếu sót phần này.",
                    reactions: {
                        like: [commentAuthorId],
                        dislike: []
                    }
                })
            }

            comments.push({
                userId: commentAuthorId,
                content: feedbackTemplates[Math.floor(Math.random() * feedbackTemplates.length)],
                subComments: subComments,
                reactions: {
                    like: Math.random() > 0.5 ? [subAuthorId] : [],
                    dislike: []
                }
            })
        }

        const notUnderstood = notUnderstoodTemplates[Math.floor(Math.random() * notUnderstoodTemplates.length)]

        topic.submissions.push({
            userId: subAuthorId,
            understood: understoodTemplates[Math.floor(Math.random() * understoodTemplates.length)],
            notUnderstood: notUnderstood ? notUnderstood : undefined,
            status: 'Đã duyệt',
            reactions: {
                like: participants.slice(0, Math.floor(Math.random() * 3)),
                dislike: []
            },
            comments: comments
        })
    }

    await topic.save()
    createdTopics.push(topic)
  }

  console.log(`Created ${createdTopics.length} topics.`)
  console.log('Mass seeding completed successfully!')
  await mongoose.disconnect()
}

run().catch((error) => {
  console.error('Mass seed topics failed:', error)
  process.exit(1)
})
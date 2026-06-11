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
  const notificationsCollection = db.collection('notifications')
  const bookmarksCollection = db.collection('bookmarks')

  // Reset all collections before inserting fresh seed data.
  await usersCollection.deleteMany({})
  await ranksCollection.deleteMany({})
  await topicsCollection.deleteMany({})
  await notificationsCollection.deleteMany({})
  await bookmarksCollection.deleteMany({})

  const now = new Date()

  const ranks = [
    { _id: new mongoose.Types.ObjectId(), level: 1, name: 'Tập sự', createdAt: now },
    { _id: new mongoose.Types.ObjectId(), level: 2, name: 'Tân binh', createdAt: now },
    { _id: new mongoose.Types.ObjectId(), level: 3, name: 'Sinh viên chính thức', createdAt: now },
    { _id: new mongoose.Types.ObjectId(), level: 4, name: 'Sinh viên kỳ cựu', createdAt: now },
    { _id: new mongoose.Types.ObjectId(), level: 5, name: 'Tinh anh', createdAt: now },
    { _id: new mongoose.Types.ObjectId(), level: 6, name: 'Học giả', createdAt: now },
    { _id: new mongoose.Types.ObjectId(), level: 7, name: 'Đại học giả', createdAt: now },
    { _id: new mongoose.Types.ObjectId(), level: 8, name: 'Lão sư', createdAt: now },
    { _id: new mongoose.Types.ObjectId(), level: 9, name: 'Đại lão sư', createdAt: now },
    { _id: new mongoose.Types.ObjectId(), level: 10, name: 'Thách đấu', createdAt: now },
  ]

  const users = [
    {
      _id: new mongoose.Types.ObjectId(),
      email: 'admin',
      passwordHash: '$2a$10$FuUaPtSpG7StS6hILY9vpukUVRCHK0eD26h.AMTiqYQtuWG/kSMO.',
      displayName: 'Admin',
      bio: '',
      role: 'admin',
      rank: 1000,
      createdAt: now,
      updatedAt: now,
    },
  ]

  await ranksCollection.insertMany(ranks)
  await usersCollection.insertMany(users)

  console.log('Seed completed:', {
    users: users.length,
    ranks: ranks.length,
  })

  await mongoose.disconnect()
}

run().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})

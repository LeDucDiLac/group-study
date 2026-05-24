import dotenv from 'dotenv'
import mongoose from 'mongoose'
import readline from 'node:readline/promises'
import Notification from '../src/models/Notification.js'
import User from '../src/models/User.js'
import { createSystemNotification } from '../src/services/notificationService.js'

dotenv.config()

const mongoUri = process.env.MONGODB_URI

if (!mongoUri) {
  console.error('MONGODB_URI is not set. Abort test.')
  process.exit(1)
}

async function run() {
  await mongoose.connect(mongoUri)
  console.log('Connected to MongoDB')

  const adminUser = await User.findOne({ role: 'admin' }).select('displayName role').lean()
  const recipientUser = await User.findOne({ role: { $ne: 'admin' } })
    .select('displayName role')
    .lean()

  console.log('Resolved system notification actors:', {
    adminUser: adminUser
      ? {
          id: adminUser._id?.toString(),
          displayName: adminUser.displayName,
          role: adminUser.role,
        }
      : null,
    recipientUser: recipientUser
      ? {
          id: recipientUser._id?.toString(),
          displayName: recipientUser.displayName,
          role: recipientUser.role,
        }
      : null,
  })

  if (!adminUser) {
    throw new Error('Không tìm thấy admin để test system notification.')
  }

  if (!recipientUser) {
    throw new Error('Không tìm thấy user nhận thông báo.')
  }

  const title = `[TEST] system notification title ${new Date().toISOString()}`
  const content = `[TEST] system notification content ${new Date().toISOString()}`
  const notification = await createSystemNotification({
    userId: recipientUser._id,
    actorId: adminUser._id,
    title,
    content,
  })

  console.log('System notification created:', {
    id: notification._id?.toString(),
    userId: notification.userId?.toString(),
    actorId: notification.actorId?.toString(),
    type: notification.type,
    title: notification.title,
    content: notification.content,
    target: notification.target,
  })

  console.log('Press Enter to cleanup this system notification and exit.')
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  await rl.question('')
  rl.close()

  await Notification.deleteMany({ _id: notification._id })
  console.log('Cleaned up 1 system notification.')

  await mongoose.disconnect()
}

run().catch(async (error) => {
  console.error('System notification service test failed:', error)

  try {
    await mongoose.disconnect()
  } catch {}

  process.exit(1)
})
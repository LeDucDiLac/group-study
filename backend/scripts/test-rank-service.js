import dotenv from 'dotenv'
import mongoose from 'mongoose'
import readline from 'node:readline/promises'
import Notification from '../src/models/Notification.js'
import User from '../src/models/User.js'
import {
  addPointsForCommentLike,
  addPointsForSubmissionApproved,
  addPointsForSubmissionLike,
  addPointsForTopicApproved,
  addPointsForTopicComment,
  addPointsForTopicSubmission,
  adjustPointsByAdmin,
} from '../src/services/rankService.js'

dotenv.config()

const mongoUri = process.env.MONGODB_URI

if (!mongoUri) {
  console.error('MONGODB_URI is not set. Abort test.')
  process.exit(1)
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function run() {
  await mongoose.connect(mongoUri)
  console.log('Connected to MongoDB')

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const waitForEnter = async (label) => {
    await rl.question(`\n[STEP] ${label} - nhấn Enter để chạy...`)
  }

  const adminUser = await User.findOne({ role: 'admin' })
    .select('displayName role rank')
    .lean()
  const nonAdminUsers = await User.find({ role: { $ne: 'admin' } })
    .select('displayName role rank')
    .limit(2)
    .lean()

  if (!adminUser) {
    throw new Error('No admin user found for rank service test.')
  }

  if (!nonAdminUsers || nonAdminUsers.length < 2) {
    throw new Error('Need at least 2 non-admin users for rank service test.')
  }

  const [targetUser, actorUser] = nonAdminUsers

  const initialPoints = {
    admin: adminUser.rank ?? 0,
    target: targetUser.rank ?? 0,
    actor: actorUser.rank ?? 0,
  }

  const testMarker = `[TEST] rank service ${new Date().toISOString()}`
  const markerRegex = new RegExp(escapeRegExp(testMarker))
  const notificationFilter = {
    userId: targetUser._id,
    actorId: adminUser._id,
    type: 'system',
    content: { $regex: markerRegex },
  }

  console.log('Resolved users:', {
    admin: {
      id: adminUser._id?.toString(),
      displayName: adminUser.displayName,
      rank: adminUser.rank ?? 0,
    },
    target: {
      id: targetUser._id?.toString(),
      displayName: targetUser.displayName,
      rank: targetUser.rank ?? 0,
    },
    actor: {
      id: actorUser._id?.toString(),
      displayName: actorUser.displayName,
      rank: actorUser.rank ?? 0,
    },
  })

  try {
    await waitForEnter('comment like (+5)')
    console.log('Test: comment like (+5)')
    console.log(
      await addPointsForCommentLike({
        commentOwnerId: targetUser._id,
        actorId: actorUser._id,
      })
    )

    await waitForEnter('submission like (+10)')
    console.log('Test: submission like (+10)')
    console.log(
      await addPointsForSubmissionLike({
        submissionOwnerId: targetUser._id,
        actorId: actorUser._id,
      })
    )

    await waitForEnter('submission approved (+20)')
    console.log('Test: submission approved (+20)')
    console.log(
      await addPointsForSubmissionApproved({ submissionOwnerId: targetUser._id })
    )

    await waitForEnter('topic approved (+50)')
    console.log('Test: topic approved (+50)')
    console.log(await addPointsForTopicApproved({ topicOwnerId: targetUser._id }))

    await waitForEnter('topic submission (+15)')
    console.log('Test: topic submission (+15)')
    console.log(
      await addPointsForTopicSubmission({
        topicOwnerId: targetUser._id,
        actorId: actorUser._id,
      })
    )

    await waitForEnter('topic comment (+4)')
    console.log('Test: topic comment (+4)')
    console.log(
      await addPointsForTopicComment({
        topicOwnerId: targetUser._id,
        actorId: actorUser._id,
      })
    )

    await waitForEnter('admin adjust (+7, system notification)')
    console.log('Test: admin adjust (+7 with system notification)')
    console.log(
      await adjustPointsByAdmin({
        userId: targetUser._id,
        actorId: adminUser._id,
        delta: 7,
        reason: testMarker,
      })
    )

    const createdNotifications = await Notification.find(notificationFilter)
      .select('_id title content')
      .lean()

    console.log('System notifications created:',
      createdNotifications.map((item) => ({
        id: item._id?.toString(),
        title: item.title,
        content: item.content,
      }))
    )

    await rl.question('\n[STEP] Đã tạo thông báo hệ thống - nhấn Enter để cleanup...')
  } finally {
    rl.close()
    await Notification.deleteMany(notificationFilter)

    await User.updateOne(
      { _id: targetUser._id },
      { $set: { rank: initialPoints.target } }
    )
    await User.updateOne(
      { _id: actorUser._id },
      { $set: { rank: initialPoints.actor } }
    )
    await User.updateOne(
      { _id: adminUser._id },
      { $set: { rank: initialPoints.admin } }
    )

    await mongoose.disconnect()
    console.log('Cleanup complete. Disconnected from MongoDB.')
  }
}

run().catch(async (error) => {
  console.error('Rank service test failed:', error)

  try {
    await mongoose.disconnect()
  } catch {}

  process.exit(1)
})

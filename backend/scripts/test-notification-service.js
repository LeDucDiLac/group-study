import dotenv from 'dotenv'
import mongoose from 'mongoose'
import readline from 'node:readline/promises'
import Notification from '../src/models/Notification.js'
import Topic from '../src/models/Topic.js'
import { createCommentNotifications } from '../src/services/notificationService.js'

dotenv.config()

const mongoUri = process.env.MONGODB_URI

if (!mongoUri) {
  console.error('MONGODB_URI is not set. Abort test.')
  process.exit(1)
}

async function findTestTargets() {
  const topics = await Topic.find({ 'submissions.comments.0': { $exists: true } })
    .select('submissions comments')
    .lean()

  let topLevelTarget = null
  let replyTarget = null

  for (const topic of topics) {
    for (const submission of topic.submissions || []) {
      for (const comment of submission.comments || []) {
        if (!topLevelTarget && comment?._id && comment?.userId) {
          topLevelTarget = {
            userId: comment.userId,
            commentId: comment._id,
            label: 'top-level',
          }
        }

        const nestedComments = Array.isArray(comment?.comments)
          ? comment.comments
          : Array.isArray(comment?.subComments)
            ? comment.subComments
            : []

        for (const subComment of nestedComments) {
          if (!replyTarget && subComment?._id && subComment?.userId) {
            replyTarget = {
              userId: subComment.userId,
              commentId: subComment._id,
              label: 'reply',
            }
          }

          if (topLevelTarget && replyTarget) {
            return { topLevelTarget, replyTarget }
          }
        }
      }
    }
  }

  return { topLevelTarget, replyTarget }
}

async function run() {
  await mongoose.connect(mongoUri)
  console.log('Connected to MongoDB')

  const { topLevelTarget, replyTarget } = await findTestTargets()

  console.log('Resolved test targets:', {
    topLevelTarget: topLevelTarget
      ? {
          label: topLevelTarget.label,
          userId: topLevelTarget.userId?.toString(),
          commentId: topLevelTarget.commentId?.toString(),
        }
      : null,
    replyTarget: replyTarget
      ? {
          label: replyTarget.label,
          userId: replyTarget.userId?.toString(),
          commentId: replyTarget.commentId?.toString(),
        }
      : null,
  })

  if (!topLevelTarget) {
    throw new Error('Không tìm thấy comment gốc để test service.')
  }

  const insertedIds = []

  const topLevelContent = `[TEST] notification service top-level comment ${new Date().toISOString()}`
  const topLevelNotifications = await createCommentNotifications({
    userId: topLevelTarget.userId,
    commentId: topLevelTarget.commentId,
    content: topLevelContent,
  })
  insertedIds.push(...topLevelNotifications.map((item) => item._id))

  console.log('Top-level comment test result:',
    topLevelNotifications.map((item) => ({
      id: item._id?.toString(),
      userId: item.userId?.toString(),
      target: item.target,
      title: item.title,
    }))
  )

  if (replyTarget) {
    const replyContent = `[TEST] notification service reply comment ${new Date().toISOString()}`
    const replyNotifications = await createCommentNotifications({
      userId: replyTarget.userId,
      commentId: replyTarget.commentId,
      content: replyContent,
    })
    insertedIds.push(...replyNotifications.map((item) => item._id))

    console.log('Reply test result:',
      replyNotifications.map((item) => ({
        id: item._id?.toString(),
        userId: item.userId?.toString(),
        target: item.target,
        title: item.title,
      }))
    )
  } else {
    console.log('Reply test skipped: no nested reply comment found in seed data.')
  }

  console.log(`Created ${insertedIds.length} test notifications in total.`)
  console.log('Press Enter to cleanup test notifications and exit.')

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  await rl.question('')
  rl.close()

  if (insertedIds.length > 0) {
    await Notification.deleteMany({ _id: { $in: insertedIds } })
    console.log(`Cleaned up ${insertedIds.length} test notifications.`)
  }

  await mongoose.disconnect()
}

run().catch(async (error) => {
  console.error('Notification service test failed:', error)

  try {
    await mongoose.disconnect()
  } catch {}

  process.exit(1)
})
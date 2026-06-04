import mongoose from 'mongoose'
import Notification from '../models/Notification.js'
import Topic from '../models/Topic.js'
import User from '../models/User.js'

const { Types } = mongoose

function toObjectId(value, fieldName) {
  if (!value) {
    return null
  }

  if (!Types.ObjectId.isValid(value)) {
    throw new Error(`Giá trị ${fieldName} không hợp lệ.`)
  }

  return new Types.ObjectId(value)
}

function getNestedComments(comment) {
  if (Array.isArray(comment?.comments)) {
    return comment.comments
  }

  if (Array.isArray(comment?.subComments)) {
    return comment.subComments
  }

  return []
}

function uniqueUserIds(ids) {
  return [...new Set(ids.filter(Boolean).map((id) => id.toString()))]
}

async function resolveDisplayName(userId) {
  if (!userId) {
    return 'Ẩn danh'
  }

  const user = await User.findById(userId).select('displayName').lean()
  return user?.displayName || 'Ẩn danh'
}

async function ensureAdminActor(actorId) {
  if (!actorId) {
    throw new Error('Thiếu actorId để tạo thông báo hệ thống.')
  }

  const actor = await User.findById(actorId).select('role displayName').lean()

  if (!actor) {
    throw new Error('Không tìm thấy người thực hiện thao tác.')
  }

  if (actor.role !== 'admin') {
    throw new Error('Chỉ admin mới được tạo thông báo hệ thống.')
  }

  return actor
}

function findSubmission(topic, submissionId) {
  const submission = Array.isArray(topic?.submissions)
    ? topic.submissions.find((item) => item?._id?.toString() === submissionId)
    : null

  if (!submission) {
    throw new Error('Không tìm thấy bài nộp trong chủ đề.')
  }

  return submission
}

function findComment(submission, commentId) {
  const comment = Array.isArray(submission?.comments)
    ? submission.comments.find((item) => item?._id?.toString() === commentId)
    : null

  if (!comment) {
    throw new Error('Không tìm thấy bình luận.')
  }

  return comment
}

function excludeIds(ids, ...excluded) {
  const excludedSet = new Set(
    excluded.filter(Boolean).map((value) => value.toString())
  )
  return ids.filter((id) => !excludedSet.has(id.toString()))
}

async function buildNotifications({
  actorId,
  target,
  content,
  recipients,
  title,
  type = 'comment',
}) {
  if (!recipients.length) {
    return []
  }

  const payload = recipients.map((userId) => ({
    userId,
    actorId,
    ...(target ? { target } : {}),
    title,
    content,
    type,
  }))

  return Notification.insertMany(payload)
}

export async function createCommentNotifications({
  userId,
  commentId,
  content,
}) {
  const actorId = toObjectId(userId, 'userId')
  const commentObjectId = toObjectId(commentId, 'commentId')

  if (!commentObjectId) {
    throw new Error('Thiếu commentId để tạo thông báo.')
  }

  // Resolve topic/submission/comment context via Topic helper
  const target = await Topic.findTargetById(commentObjectId.toString())

  if (!target) {
    throw new Error('Không tìm thấy comment trong bất kỳ topic nào.')
  }

  const topic = await Topic.findById(target.topicId)
    .select('submissions._id submissions.userId submissions.comments')
    .lean()

  if (!topic) {
    throw new Error('Không tìm thấy chủ đề.')
  }

  const submission = findSubmission(topic, target.submissionId.toString())
  const displayName = await resolveDisplayName(actorId)

  if (!target.subCommentId) {
    const submissionOwnerId = submission.userId
    const topLevelCommenters = Array.isArray(submission.comments)
      ? submission.comments.map((comment) => comment?.userId).filter(Boolean)
      : []

    const watcherIds = uniqueUserIds(
      excludeIds(topLevelCommenters, actorId, submissionOwnerId)
    ).map((id) => new Types.ObjectId(id))

    const ownerNotification = submissionOwnerId
      ? await buildNotifications({
          actorId,
          target: {
            topicId: target.topicId,
            submissionId: target.submissionId,
            commentId: target.commentId,
          },
          content,
          recipients: excludeIds([submissionOwnerId], actorId),
          title: `${displayName} đã bình luận vào bài nộp của bạn`,
        })
      : []

    const watcherNotifications = await buildNotifications({
      actorId,
      target: {
        topicId: target.topicId,
        submissionId: target.submissionId,
        commentId: target.commentId,
      },
      content,
      recipients: watcherIds,
      title: `${displayName} đã bình luận vào bài nộp bạn quan tâm`,
    })

    return [...ownerNotification, ...watcherNotifications]
  }

  const parentComment = findComment(submission, target.commentId.toString())
  const parentOwnerId = parentComment.userId
  const subCommenters = getNestedComments(parentComment).map((item) => item?.userId)

  const watcherIds = uniqueUserIds(excludeIds(subCommenters, actorId, parentOwnerId)).map(
    (id) => new Types.ObjectId(id)
  )

  const ownerNotification = parentOwnerId
    ? await buildNotifications({
        actorId,
        target: {
          topicId: target.topicId,
          submissionId: target.submissionId,
          commentId: target.commentId,
          subCommentId: target.subCommentId,
        },
        content,
        recipients: excludeIds([parentOwnerId], actorId),
        title: `${displayName} đã trả lời bình luận của bạn`,
      })
    : []

  const watcherNotifications = await buildNotifications({
    actorId,
    target: {
      topicId: target.topicId,
      submissionId: target.submissionId,
      commentId: target.commentId,
      subCommentId: target.subCommentId,
    },
    content,
    recipients: watcherIds,
    title: `${displayName} đã bình luận vào bài nộp bạn quan tâm`,
  })

  return [...ownerNotification, ...watcherNotifications]
}

export async function createSystemNotification({ userId, actorId, title, content, target }) {
  const recipientId = toObjectId(userId, 'userId')
  const adminActorId = toObjectId(actorId, 'actorId')

  if (!recipientId) {
    throw new Error('Thiếu userId để tạo thông báo hệ thống.')
  }

  if (!title || !title.trim()) {
    throw new Error('Thiếu tiêu đề thông báo hệ thống.')
  }

  if (!content || !content.trim()) {
    throw new Error('Thiếu nội dung thông báo hệ thống.')
  }

  const actor = await ensureAdminActor(adminActorId)
  const displayName = actor.displayName || 'Quản trị'

  const notification = await Notification.create({
    userId: recipientId,
    actorId: adminActorId,
    title: title.trim(),
    content: content.trim(),
    type: 'system',
    isRead: false,
    target,
  })
  return notification
}

export default {
  createCommentNotifications,
  createSystemNotification,
}
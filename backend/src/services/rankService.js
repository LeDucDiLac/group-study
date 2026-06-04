import mongoose from 'mongoose'
import User from '../models/User.js'
import { createSystemNotification } from './notificationService.js'

const { Types } = mongoose

const POINTS_PER_RANK = 100
const MAX_RANK_LEVEL = 10

// Chuyển đầu vào sang ObjectId hoặc báo lỗi khi không hợp lệ.
function toObjectId(value, fieldName) {
  if (!value) {
    return null
  }

  if (!Types.ObjectId.isValid(value)) {
    throw new Error(`Giá trị ${fieldName} không hợp lệ.`)
  }

  return new Types.ObjectId(value)
}

// Chuẩn hóa điểm về số không âm, giá trị không hợp lệ thành 0.
function normalizePoints(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0
  }

  return Math.max(0, value)
}

// Tính cấp bậc từ tổng điểm.
export function calculateRankLevel(points) {
  const normalized = normalizePoints(points)
  const level = Math.floor(normalized / POINTS_PER_RANK) + 1
  return Math.min(MAX_RANK_LEVEL, Math.max(1, level))
}

// Áp dụng quy tắc rank >= 5 cho việc tính điểm tương tác.
function shouldCountInteraction(targetPoints, actorPoints) {
  const targetLevel = calculateRankLevel(targetPoints)
  if (targetLevel < 5) {
    return true
  }

  const actorLevel = calculateRankLevel(actorPoints)
  return actorLevel >= 5
}

// Lấy thông tin người dùng, báo lỗi nếu không tồn tại.
async function loadUser(userId, projection = 'rank displayName role') {
  const user = await User.findById(userId).select(projection).lean()
  if (!user) {
    throw new Error('Không tìm thấy người dùng.')
  }

  return user
}

// Cộng/trừ điểm và trả về snapshot mới.
async function applyPointsDelta(userId, delta) {
  const user = await User.findById(userId).select('rank').lean()
  if (!user) {
    throw new Error('Không tìm thấy người dùng.')
  }

  const currentPoints = normalizePoints(user.rank)
  const nextPoints = Math.max(0, currentPoints + delta)

  if (nextPoints !== currentPoints) {
    await User.updateOne(
      { _id: userId },
      { $set: { rank: nextPoints } }
    )
  }

  return {
    userId: userId.toString(),
    points: nextPoints,
    rankLevel: calculateRankLevel(nextPoints),
  }
}

// Tính điểm tương tác, tôn trọng quy tắc self và rank.
async function applyInteractionPoints({
  targetUserId,
  actorId,
  delta,
  allowSelf = false,
}) {
  const recipientId = toObjectId(targetUserId, 'targetUserId')
  const actorObjectId = toObjectId(actorId, 'actorId')

  if (!recipientId) {
    throw new Error('Thiếu targetUserId để cộng điểm.')
  }

  if (!actorObjectId) {
    throw new Error('Thiếu actorId để cộng điểm.')
  }

  if (!allowSelf && recipientId.toString() === actorObjectId.toString()) {
    return { applied: false, reason: 'self_interaction' }
  }

  const [recipient, actor] = await Promise.all([
    loadUser(recipientId, 'rank'),
    loadUser(actorObjectId, 'rank'),
  ])

  if (!shouldCountInteraction(recipient.rank, actor.rank)) {
    return { applied: false, reason: 'rank_restriction' }
  }

  const updated = await applyPointsDelta(recipientId, delta)
  return { applied: true, ...updated }
}

// +5 điểm khi bình luận được like.
export async function addPointsForCommentLike({ commentOwnerId, actorId }) {
  return applyInteractionPoints({
    targetUserId: commentOwnerId,
    actorId,
    delta: 5,
  })
}

export async function removePointsForCommentLikeCancellation({ commentOwnerId, actorId }) {
  return applyInteractionPoints({
    targetUserId: commentOwnerId,
    actorId,
    delta: -5,
  })
}

// +20 điểm khi bài nộp được duyệt.
export async function addPointsForSubmissionApproved({ submissionOwnerId }) {
  const recipientId = toObjectId(submissionOwnerId, 'submissionOwnerId')
  if (!recipientId) {
    throw new Error('Thiếu submissionOwnerId để cộng điểm.')
  }

  const updated = await applyPointsDelta(recipientId, 20)
  return { applied: true, ...updated }
}

// +10 điểm khi bài nộp được like.
export async function addPointsForSubmissionLike({ submissionOwnerId, actorId }) {
  return applyInteractionPoints({
    targetUserId: submissionOwnerId,
    actorId,
    delta: 10,
  })
}

export async function removePointsForSubmissionLikeCancellation({ submissionOwnerId, actorId }) {
  return applyInteractionPoints({
    targetUserId: submissionOwnerId,
    actorId,
    delta: -10,
  })
}

// +50 điểm khi chủ đề do người dùng tạo được duyệt.
export async function addPointsForTopicApproved({ topicOwnerId }) {
  const recipientId = toObjectId(topicOwnerId, 'topicOwnerId')
  if (!recipientId) {
    throw new Error('Thiếu topicOwnerId để cộng điểm.')
  }

  const updated = await applyPointsDelta(recipientId, 50)
  return { applied: true, ...updated }
}

// +10 điểm khi chủ đề do người dùng tạo được like.
export async function addPointsForTopicLike({ topicOwnerId, actorId }) {
  return applyInteractionPoints({
    targetUserId: topicOwnerId,
    actorId,
    delta: 10,
  })
}

export async function removePointsForTopicLikeCancellation({ topicOwnerId, actorId }) {
  return applyInteractionPoints({
    targetUserId: topicOwnerId,
    actorId,
    delta: -10,
  })
}

// +15 điểm cho mỗi bài nộp của cộng đồng trên chủ đề của người dùng.
export async function addPointsForTopicSubmission({ topicOwnerId, actorId }) {
  return applyInteractionPoints({
    targetUserId: topicOwnerId,
    actorId,
    delta: 15,
  })
}

// +4 điểm cho mỗi bình luận của cộng đồng trên chủ đề của người dùng.
export async function addPointsForTopicComment({ topicOwnerId, actorId }) {
  return applyInteractionPoints({
    targetUserId: topicOwnerId,
    actorId,
    delta: 4,
  })
}

// Admin cộng/trừ điểm trực tiếp và tạo thông báo hệ thống.
export async function adjustPointsByAdmin({ userId, actorId, delta, reason }) {
  const recipientId = toObjectId(userId, 'userId')
  const adminId = toObjectId(actorId, 'actorId')

  if (!recipientId) {
    throw new Error('Thiếu userId để cộng trừ điểm.')
  }

  if (!adminId) {
    throw new Error('Thiếu actorId để cộng trừ điểm.')
  }

  if (typeof delta !== 'number' || Number.isNaN(delta) || delta === 0) {
    throw new Error('delta phải là số khác 0.')
  }

  const admin = await loadUser(adminId, 'role displayName')
  if (admin.role !== 'admin') {
    throw new Error('Chỉ admin mới được cộng trừ điểm trực tiếp.')
  }

  const updated = await applyPointsDelta(recipientId, delta)

  const signText = delta > 0 ? 'cộng' : 'trừ'
  const absDelta = Math.abs(delta)
  const safeReason = typeof reason === 'string' ? reason.trim() : ''
  const contentSuffix = safeReason ? ` Lý do: ${safeReason}.` : ''

  await createSystemNotification({
    userId: recipientId,
    actorId: adminId,
    title: `Admin ${signText} điểm`,
    content: `Bạn được ${signText} ${absDelta} điểm.${contentSuffix}`,
  })

  return { applied: true, ...updated }
}

export default {
  addPointsForCommentLike,
  removePointsForCommentLikeCancellation,
  addPointsForSubmissionApproved,
  addPointsForSubmissionLike,
  removePointsForSubmissionLikeCancellation,
  addPointsForTopicApproved,
  addPointsForTopicLike,
  removePointsForTopicLikeCancellation,
  addPointsForTopicSubmission,
  addPointsForTopicComment,
  adjustPointsByAdmin
}
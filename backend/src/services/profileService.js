import User from '../models/User.js'
import Topic from '../models/Topic.js'
import Bookmark from '../models/Bookmark.js'

// Thêm submission vào summary.submissions
export async function addSubmissionToSummary(userId, { topicId, submissionId }) {
  await User.updateOne({ _id: userId }, { $addToSet: { 'summary.submissions': { topicId, submissionId } } })
}

// Tăng/giảm số like đã nhận
export async function incLikesReceived(userId) {
  await User.updateOne({ _id: userId }, { $inc: { 'summary.likesReceived': 1 } })
}

// Giảm số like đã nhận (chỉ dùng cho unlike)
export async function decLikesReceived(userId) {
  await User.updateOne({ _id: userId }, { $inc: { 'summary.likesReceived': -1 } })
}

// Thêm một item đã like vào summary.liked
export async function addLikedItem(userId, { topicId, submissionId, commentId, subCommentId }) {
  const likedItem = { topicId, submissionId, commentId }
    if (subCommentId) {
        likedItem.subCommentId = subCommentId
    }
  await User.updateOne({ _id: userId }, { $addToSet: { 'summary.liked': likedItem } })
}

// Xóa một item đã like khỏi summary.liked (dùng cho unlike)
export async function removeLikedItem(userId, { topicId, submissionId, commentId, subCommentId }) {
  const likedItem = { topicId, submissionId, commentId }
    if (subCommentId) {
        likedItem.subCommentId = subCommentId
    }
  await User.updateOne({ _id: userId }, { $pull: { 'summary.liked': likedItem } })
}

// --------------------
// Read-only aggregation helpers (do not persist into User)
// --------------------

/**
 * Lấy danh sách topic mà user đã tham gia (Participation hoặc có submission)
 * Trả về mảng target: { topicId }
 */
export async function fetchTopicsParticipated(userId) {
  if (!userId) return []
  // Topics where Participation.userId == userId
  const participated = await Topic.find({ 'Participation.userId': userId }, { _id: 1 }).lean()
  // Also include topics where user has submissions
  const withSubmission = await Topic.find({ 'submissions.userId': userId }, { _id: 1 }).lean()
  const map = new Map()
  participated.forEach(t => map.set(String(t._id), { topicId: t._id }))
  withSubmission.forEach(t => map.set(String(t._id), { topicId: t._id }))
  return Array.from(map.values())
}

/**
 * Lấy danh sách topic do user tạo
 * Trả về mảng target: { topicId }
 */
export async function fetchTopicsCreated(userId) {
  if (!userId) return []
  const created = await Topic.find({ createdBy: userId }, { _id: 1 }).lean()
  return created.map(t => ({ topicId: t._id }))
}

/**
 * Lấy bookmarks của user từ collection bookmarks
 * Trả về mảng target (bookmark.target)
 */
export async function fetchBookmarks(userId) {
  if (!userId) return []
  const items = await Bookmark.find({ userId }, { target: 1 }).lean()
  return items.map(it => it.target || {})
}

/**
 * Trả về object tóm tắt tổng hợp (chỉ đọc) gồm: topicsParticipated, topicsCreated, bookmarks
 */
export async function getAggregatedSummary(userId) {
  const [topicsParticipated, topicsCreated, bookmarks] = await Promise.all([
    fetchTopicsParticipated(userId),
    fetchTopicsCreated(userId),
    fetchBookmarks(userId),
  ])
  return { topicsParticipated, topicsCreated, bookmarks }
}

export default {
  addSubmissionToSummary,
  incLikesReceived,
  decLikesReceived,
  addLikedItem,
  removeLikedItem,
  getAggregatedSummary,
}

import mongoose from 'mongoose'
import Topic from '../models/Topic.js'
import User from '../models/User.js'
import { addPointsForSubmissionApproved } from '../services/rankService.js'
import { placeholder } from '../utils/placeholder.js'

function isValidResources(resources) {
  if (!Array.isArray(resources)) {
    return true
  }

  return resources.every((resource) => {
    if (!resource || typeof resource !== 'object') {
      return false
    }

    const { type, url } = resource

    if (!['link', 'file'].includes(type)) {
      return false
    }

    return typeof url === 'string' && url.trim().length > 0
  })
}

function validateSubmissionWindow(topic, userId) {
  if (topic.windowHours == null) {
    return { ok: true }
  }

  const participationEntries = Array.isArray(topic.Participation)
    ? topic.Participation
    : []
  const participation = participationEntries.find(
    (entry) => entry.userId && entry.userId.toString() === userId
  )

  if (!participation || !participation.startedAt) {
    return { ok: false, error: 'Bạn cần bắt đầu học chủ đề này' }
  }

  const startedAt = new Date(participation.startedAt)
  if (Number.isNaN(startedAt.getTime())) {
    return { ok: false, error: 'Không xác định được thời điểm bắt đầu học.' }
  }

  const now = new Date()
  const maxSeconds = topic.windowHours * 60 * 60
  const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000)

  if (elapsedSeconds < 0 || elapsedSeconds > maxSeconds) {
    return { ok: false, error: 'Đã hết thời gian nộp bài cho chủ đề này.' }
  }

  return { ok: true }
}

function countNestedComments(comments) {
  if (!Array.isArray(comments)) {
    return 0
  }

  let total = 0
  for (const comment of comments) {
    total += 1
    const nested = Array.isArray(comment?.comments)
      ? comment.comments
      : Array.isArray(comment?.subComments)
        ? comment.subComments
        : Array.isArray(comment?.subcomments)
          ? comment.subcomments
          : []
    total += countNestedComments(nested)
  }

  return total
}

function isSameDay(left, right) {
  if (!left || !right) {
    return false
  }

  const leftDate = new Date(left)
  const rightDate = new Date(right)

  return leftDate.toDateString() === rightDate.toDateString()
}

async function allowDailyPeek(userId, userRank, topicId) {
  if (!canDailyPeek(userRank)) {
    return { allowed: false }
  }

  if (!topicId) {
    return { allowed: false }
  }

  const user = await User.findById(userId)
    .select('submissionPeekedAt submissionPeekedTopicId')
    .lean()
  if (!user) {
    return { allowed: false }
  }

  const now = new Date()
  const normalizedTopicId = topicId.toString()

  if (user.submissionPeekedAt && isSameDay(user.submissionPeekedAt, now)) {
    if (user.submissionPeekedTopicId?.toString() === normalizedTopicId) {
      return { allowed: true }
    }

    return { allowed: false }
  }

  await User.updateOne(
    { _id: userId },
    {
      $set: {
        submissionPeekedAt: now,
        submissionPeekedTopicId: topicId,
      },
    }
  )

  return { allowed: true }
}

function canPeekAnytime(userRank) {
  return typeof userRank === 'number' && userRank >= 600
}

function canDailyPeek(userRank) {
  return typeof userRank === 'number' && userRank >= 300 && userRank <= 500
}

function normalizeSubmission(submission) {
  if (!submission) {
    return null
  }

  const commentCount = countNestedComments(submission.comments)
  const { comments, ...rest } = submission
  return { ...rest, commentCount }
}

function shouldAutoApproveSubmission(user) {
  if (!user) {
    return false
  }

  if (typeof user.rank === 'number' && user.rank >= 200) {
    return true
  }

  return false
}

export async function createSubmission(req, res, next) {
  const {
    topicId,
    understood,
    notUnderstood,
    isAnonymous = false,
    resources = [],
  } = req.body || {}

  const userId = req.user?.id || req.user?._id
  const shouldAutoApprove = shouldAutoApproveSubmission(req.user)

  if (!topicId || !understood) {
    return res.status(400).json({ error: 'Vui lòng nhập đủ thông tin bắt buộc.' })
  }

  if (!userId) {
    return res.status(401).json({ error: 'Bạn cần đăng nhập để nộp bài.' })
  }

  if (!mongoose.Types.ObjectId.isValid(topicId)) {
    return res.status(400).json({ error: 'Liên kết chủ đề không hợp lệ.' })
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Thông tin người dùng không hợp lệ.' })
  }

  if (!isValidResources(resources)) {
    return res.status(400).json({ error: 'Tài liệu đính kèm không đúng định dạng.' })
  }

  try {
    const topic = await Topic.findById(topicId)
      .select('status windowHours submissions Participation')
      .lean()

    if (!topic) {
      return res.status(404).json({ error: 'Không tìm thấy chủ đề.' })
    }

    const windowValidation = validateSubmissionWindow(topic, userId)
    if (!windowValidation.ok) {
      return res.status(400).json({ error: windowValidation.error })
    }

    const hasSubmitted = Array.isArray(topic.submissions)
      ? topic.submissions.some((submission) =>
          submission.userId && submission.userId.toString() === userId
        )
      : false

    if (hasSubmitted) {
      return res.status(409).json({ error: 'Bạn đã nộp bài cho chủ đề này rồi.' })
    }

    const now = new Date()
    const userObjectId = new mongoose.Types.ObjectId(userId)
    const submission = {
      _id: new mongoose.Types.ObjectId(),
      userId: userObjectId,
      understood,
      notUnderstood,
      isAnonymous: Boolean(isAnonymous),
      status: shouldAutoApprove ? 'Đã duyệt' : 'Chưa duyệt',
      reactions: { like: [], dislike: [] },
      resources,
      comments: [],
      createdAt: now,
      updatedAt: now,
    }

    const updatedTopic = await Topic.findOneAndUpdate(
      { _id: topicId, 'submissions.userId': { $ne: userObjectId } },
      { $push: { submissions: submission } },
      { new: true, projection: { submissions: { $slice: -1 } } }
    ).lean()

    if (!updatedTopic) {
      return res.status(409).json({ error: 'Bạn đã nộp bài cho chủ đề này rồi.' })
    }

    const [createdSubmission] = updatedTopic.submissions || []

    if (shouldAutoApprove) {
      await addPointsForSubmissionApproved({ submissionOwnerId: userObjectId })
    }

    return res.status(201).json(createdSubmission || submission)
  } catch (error) {
    return next(error)
  }
}

export async function listTopicSubmissions(req, res, next) {
  const { topicId } = req.params
  const userId = req.user?.id || req.user?._id

  if (!userId) {
    return res.status(401).json({ error: 'Bạn cần đăng nhập để xem bài nộp.' })
  }

  if (!mongoose.Types.ObjectId.isValid(topicId)) {
    return res.status(400).json({ error: 'Liên kết chủ đề không hợp lệ.' })
  }

  try {
    const topic = await Topic.findById(topicId)
      .select('title status submissions')
      .lean()

    if (!topic) {
      return res.status(404).json({ error: 'Không tìm thấy chủ đề.' })
    }

    const userObjectId = new mongoose.Types.ObjectId(userId)
    const hasSubmitted = Array.isArray(topic.submissions)
      ? topic.submissions.some((submission) =>
          submission.userId && submission.userId.toString() === userId
        )
      : false

    if (!hasSubmitted) {
      const user = await User.findById(userObjectId).select('rank').lean()
      if (!user) {
        return res.status(404).json({ error: 'Không tìm thấy người dùng.' })
      }

      if (!canPeekAnytime(user.rank)) {
        return res.status(403).json({ error: 'Bạn cần hoàn thành bài nộp để xem các bài nộp khác.', dailyPeekAllowed: canDailyPeek(user.rank) })
      }
    }

    const items = Array.isArray(topic.submissions)
      ? topic.submissions.map(normalizeSubmission)
      : []

    return res.json({
      topicId: topic._id?.toString(),
      topicTitle: topic.title,
      items,
    })
  } catch (error) {
    return next(error)
  }
}

export async function listMySubmissions(req, res, next) {
  const userId = req.user?.id || req.user?._id

  if (!userId) {
    return res.status(401).json({ error: 'Bạn cần đăng nhập để xem bài nộp.' })
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Thông tin người dùng không hợp lệ.' })
  }

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId)
    const results = await Topic.aggregate([
      { $match: { 'submissions.userId': userObjectId } },
      { $unwind: '$submissions' },
      { $match: { 'submissions.userId': userObjectId } },
      {
        $project: {
          topicId: '$_id',
          topicTitle: '$title',
          submission: '$submissions',
        },
      },
      { $sort: { 'submission.createdAt': -1 } },
    ])

    const items = results.map((result) => ({
      topicId: result.topicId?.toString(),
      topicTitle: result.topicTitle,
      submission: normalizeSubmission(result.submission),
    }))

    return res.json({ items })
  } catch (error) {
    return next(error)
  }
}

export async function peekSubmissions(req, res, next) {
  const { topicId } = req.params
  const userId = Sring(req.user._id)

  if (!userId) {
    return res.status(401).json({ error: 'Bạn cần đăng nhập để xem bài nộp.' })
  }

  if (!mongoose.Types.ObjectId.isValid(topicId)) {
    return res.status(400).json({ error: 'Liên kết chủ đề không hợp lệ.' })
  }

  try {
    const topic = await Topic.findById(topicId)
      .select('title status submissions')
      .lean()
    if (!topic) {
      return res.status(404).json({ error: 'Không tìm thấy chủ đề.' })
    }

    const user = await User.findById(userId).select('rank').lean()
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng.' })
    }
    
    const peekPermission = await allowDailyPeek(userId, user.rank, topicId)
    if (!peekPermission.allowed) {
      return res.status(403).json({ error: 'Bạn đã sử dụng quyền xem lén hôm nay. Vui lòng hoàn thành bài nộp để có thể xem các bài nộp khác.' })
    }

    const items = Array.isArray(topic.submissions)
      ? topic.submissions.map(normalizeSubmission)
      : []
      
    return res.json({
      topicId: topic._id?.toString(),
      topicTitle: topic.title,
      items,
    })
  }
    catch (error) {
    return next(error)
  }
}
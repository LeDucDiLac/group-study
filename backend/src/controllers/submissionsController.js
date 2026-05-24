import mongoose from 'mongoose'
import Topic from '../models/Topic.js'
import { placeholder } from '../utils/placeholder.js'

export function listSubmissions(req, res) {
  res.json(placeholder({ items: [] }))
}

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

    return res.status(201).json(createdSubmission || submission)
  } catch (error) {
    return next(error)
  }
}

export function getSubmission(req, res) {
  res.json(placeholder({ id: req.params.id }))
}

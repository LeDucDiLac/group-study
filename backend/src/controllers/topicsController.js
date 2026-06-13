import mongoose, { deleteModel } from 'mongoose'
import { addPointsForTopicApproved } from '../services/rankService.js'
import Topic, { listTopics } from '../models/Topic.js'
import { createSystemNotification } from '../services/notificationService.js'
import { addRecentActivity } from '../services/recentActivityService.js'
import { publicInfo } from '../models/User.js'

const PINNED_TOPIC_ID = '6a2a9c91b7416a0b7d3b8115'

export async function listTopicsController(req, res) {
  const { page = 1, limit = 10, query = '', category = 'all', status = 'all' } = req.query
  const pageNumber = Math.max(1, Number.parseInt(String(page), 10) || 1)
  const limitNumber = Math.max(1, Number.parseInt(String(limit), 10) || 10)
  const visibleStatusFilter = {
    $or: [{ status: 'Đang mở' }, { status: 'Đã hoàn thành' }],
  }
  const filter = {
    ...visibleStatusFilter,
  }

  if (typeof category === 'string' && category !== 'all') {
    filter.category = category
  }

  if (typeof query === 'string' && query.trim()) {
    const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const queryRegex = new RegExp(escapedQuery, 'i')
    filter.$and = [
      {
        $or: [
          { title: queryRegex },
          { description: queryRegex },
          { category: queryRegex },
          { tags: queryRegex },
        ],
      },
    ]
  }

  if (typeof status === 'string' && status !== 'all') {
    if (status === 'Đang mở' || status === 'Đã hoàn thành') {
      filter.status = status
    } else {
      filter.status = '__no_results__'
    }
  }

  const shouldPinTopic = pageNumber === 1
    && (!String(query).trim())
    && (category == null || category === 'all' || !String(category).trim())

  let topics
  if (shouldPinTopic) {
    const pinnedTopic = await Topic.findOne({ ...filter, _id: PINNED_TOPIC_ID })
      .select('-proposalReason -rejectionReason, -approvedBy -approvedAt')
      .populate('createdBy', 'displayName rank')
      .lean()

    const remainingLimit = pinnedTopic ? Math.max(0, limitNumber - 1) : limitNumber
    const remainingTopics = await listTopics(
      pinnedTopic ? { ...filter, _id: { $ne: PINNED_TOPIC_ID } } : filter,
      { page: 1, limit: remainingLimit },
    ).lean()

    topics = pinnedTopic ? [pinnedTopic, ...remainingTopics] : remainingTopics
  } else {
    topics = await listTopics(filter, { page: pageNumber, limit: limitNumber }).lean()
  }

  const totalItems = await Topic.countDocuments(filter)
  const totalPages = Math.max(1, Math.ceil(totalItems / limitNumber))
  // Chuyển trường reactions.like, reactions.dislike, submission, participation thành các trường ảo likeCount, dislikeCount, liked (-1 cho disliked, 0 cho không reaction, 1 cho liked), submissionCount, participationCount, hasParticipated (boolean)
  const transformed = topics.map(async topic => {
    const likeCount = topic.reactions?.like?.length || 0
    const dislikeCount = topic.reactions?.dislike?.length || 0
    const liked = topic.reactions.like.some(id => id.equals(req.user._id)) ? 1 : (topic.reactions.dislike.some(id => id.equals(req.user._id)) ? -1 : 0)
    const submissionCount = topic.submissions?.length || 0
    const participationCount = topic.Participation?.length || 0
    const participationStartTime = topic.Participation?.find(p => String(p.userId) === String(req.user._id))?.startedAt || null
    const mySubmission = topic.submissions?.find(s => String(s.userId) === String(req.user._id)) || null
    // Bỏ các trường Participation, submissions, reactions
    delete topic.Participation
    delete topic.submissions
    delete topic.reactions
    // 
    return {
      ...topic,
      id: String(topic._id),   // map _id → id để frontend dùng topic.id
      status: topic.status,
      likeCount,
      dislikeCount,
      liked,
      submissionCount,
      participationCount,
      participationStartTime,
      mySubmission,
    }
  })
  res.json({
    items: await Promise.all(transformed),
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalItems,
      totalPages,
    },
  })
}

export async function createTopic(req, res) {
  const user_id = String(req.user._id)
  const rank = req.user.rank
  const { title, description, category, tags, resources, proposalReason, windowHours } = req.body || {}
  if (!title || !description || !category || !proposalReason) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' })
  }

  const newTopic = new Topic({
    title,
    description,
    category,
    tags,
    resources,
    proposalReason,
    windowHours,
    createdBy: req.user._id,
  })
  const shouldAutoApprove = rank >= 700
  if (shouldAutoApprove) {
    newTopic.status = 'Đang mở'
    newTopic.approvedBy = req.user._id
    newTopic.approvedAt = new Date()
    addPointsForTopicApproved({ topicOwnerId: user_id })
  }

  try {
    const savedTopic = await newTopic.save()
    await addRecentActivity(req.user._id, {
      title: `Tạo chủ đề: ${savedTopic.title}`,
      target: { topicId: savedTopic._id },
    })
    res.status(201).json(savedTopic)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
}

export async function getTopic(req, res, next) {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID không hợp lệ' })
  }

  try {
    const topic = await Topic.findById(id).populate('createdBy', 'displayName rank').lean()
    if (!topic) {
      return res.status(404).json({ error: 'Topic không tồn tại' })
    }

    const likeCount = topic.reactions?.like?.length || 0
    const dislikeCount = topic.reactions?.dislike?.length || 0
    const liked = req.user
      ? (topic.reactions?.like?.some(uid => String(uid) === String(req.user._id)) ? 1
        : topic.reactions?.dislike?.some(uid => String(uid) === String(req.user._id)) ? -1 : 0)
      : 0
    const submissionCount = topic.submissions?.length || 0
    const participationCount = topic.Participation?.length || 0
    const participationStartTime = req.user
      ? (topic.Participation?.find(p => String(p.userId) === String(req.user._id))?.startedAt ?? null)
      : null
    const mySubmission = req.user
      ? (topic.submissions?.find(s => String(s.userId) === String(req.user._id)) ?? null)
      : null
    if (mySubmission) {
      mySubmission.user = await publicInfo(mySubmission.userId)
      delete mySubmission.userId
    }
    const { Participation, submissions, reactions, ...rest } = topic
    return res.json({
      ...rest,
      id: String(topic._id),
      status: topic.status,
      likeCount,
      dislikeCount,
      liked,
      submissionCount,
      participationCount,
      participationStartTime,
      mySubmission,
    })
  } catch (error) {
    return next(error)
  }
}

export async function updateTopic(req, res) {
  // Chỉ cho update title, description, category, tags, resources
  const { id } = req.params
  const { title, description, category, tags, resources } = req.body || {}
  if (!title || !description || !category) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' })
  }
  try {
    const topic = await Topic.findById(id)
    if (!topic) {
      return res.status(404).json({ error: 'Topic không tồn tại' })
    }
    if (String(topic.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Không có quyền chỉnh sửa topic này' })
    }
    topic.title = title
    topic.description = description
    topic.category = category
    topic.tags = tags
    topic.resources = resources
    await topic.save()
    return res.json({ ok: true })
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi server' })
  }
}

export async function approveTopic(req, res) {
  const { id } = req.params
  const userId = String(req.user._id)
  const role = req.user.role
  if (role !== 'admin')
    return res.status(403).json({ error: 'Chỉ admin mới có quyền duyệt topic' })
  Topic.findById(id).then(async topic => {
    if (!topic) return res.status(404).json({ error: 'Topic không tồn tại' })
    if (topic.status !== 'Chưa duyệt') {
      return res.status(400).json({ error: 'Chỉ có thể duyệt các topic chưa duyệt' })
    }
    topic.status = 'Đang mở'
    topic.approvedBy = userId
    topic.approvedAt = new Date()
    addPointsForTopicApproved({ topicOwnerId: String(topic.createdBy) })
    await createSystemNotification({ userId: topic.createdBy, actorId: userId, title: `Chủ đề "${topic.title}" của bạn đã được duyệt`, content: 'Chúc mừng chủ đề của bạn đã được duyệt và mở ra cho mọi người tham gia!', target: { topicId: topic._id } })
    return topic.save()
  }).then(updated => {
    res.json(updated)
  }).catch(err => {
    res.status(500).json({ error: 'Lỗi server' })
  })
}

export async function rejectTopic(req, res) {
  const { id } = req.params
  const userId = String(req.user._id)
  const role = req.user.role
  if (role !== 'admin')
    return res.status(403).json({ error: 'Chỉ admin mới có quyền từ chối topic' })
  const { rejectionReason } = req.body || {}
  if (!rejectionReason) {
    return res.status(400).json({ error: 'Thiếu lý do từ chối' })
  }
  Topic.findById(id).then(async topic => {
    if (!topic) return res.status(404).json({ error: 'Topic không tồn tại' })
    if (topic.status !== 'Chưa duyệt') {
      return res.status(400).json({ error: 'Chỉ có thể từ chối các topic chưa duyệt' })
    }
    topic.status = 'Bị từ chối'
    topic.rejectionReason = rejectionReason
    topic.approvedBy = userId
    topic.approvedAt = new Date()
    await createSystemNotification({ userId: topic.createdBy, actorId: userId, title: `Chủ đề "${topic.title}" của bạn đã bị từ chối`, content: `Lý do: ${rejectionReason}`, target: { topicId: topic._id } })
    return topic.save()
  }).then(updated => {
    res.json(updated)
  }).catch(err => {
    res.status(500).json({ error: 'Lỗi server' })
  })
}

export async function markTopicCompleted(req, res) {
  const { id } = req.params
  const userId = String(req.user._id)

  try {
    const topic = await Topic.findById(id)
    if (!topic) {
      return res.status(404).json({ error: 'Topic không tồn tại' })
    }
    if (String(topic.createdBy) !== userId) {
      return res.status(403).json({ error: 'Chỉ người tạo topic mới có quyền đánh dấu hoàn thành' })
    }
    if (topic.status !== 'Đang mở') {
      return res.status(400).json({ error: 'Chỉ có thể đánh dấu hoàn thành các topic đang mở' })
    }
    topic.status = 'Đã hoàn thành'
    topic.completedAt = new Date()
    const updatedTopic = await topic.save()
    return res.json({ ok: true })
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi server' })
  }
}

export async function getUnapprovedTopics(req, res) {
  const role = req.user.role
  if (role !== 'admin')
    return res.status(403).json({ error: 'Chỉ admin mới có quyền xem các topic chưa duyệt' })
  try {
    const topics = await Topic.find({ status: 'Chưa duyệt' }).populate('createdBy', 'displayName rank')
    return res.json(topics)
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi server' })
  }
}

export async function getParticipatedTopics(req, res) {
  const userId = String(req.user._id)
  try {
    const topics = await Topic.find({ 'Participation.userId': req.user._id })
      .populate('createdBy', 'displayName rank')
      .lean()

    const result = topics.map(topic => {
      const likeCount = topic.reactions?.like?.length || 0
      const dislikeCount = topic.reactions?.dislike?.length || 0
      const liked = topic.reactions?.like?.some(id => String(id) === userId) ? 1
        : topic.reactions?.dislike?.some(id => String(id) === userId) ? -1 : 0
      const submissionCount = topic.submissions?.length || 0
      const participationCount = topic.Participation?.length || 0
      const participationStartTime = topic.Participation?.find(p => String(p.userId) === userId)?.startedAt ?? null
      const mySubmission = topic.submissions?.find(s => String(s.userId) === userId) ?? null

      const { Participation, submissions, reactions, ...rest } = topic
      return {
        ...rest,
        id: String(topic._id),
        likeCount,
        dislikeCount,
        liked,
        submissionCount,
        participationCount,
        participationStartTime,
        mySubmission,
      }
    })

    return res.json(result)
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi server' })
  }
}

export async function participateTopic(req, res) {
  const { id } = req.params
  const userId = String(req.user._id)
  try {
    const topic = await Topic.findById(id)
    if (!topic) {
      return res.status(404).json({ error: 'Topic không tồn tại' })
    }
    if (topic.status !== 'Đang mở') {
      return res.status(400).json({ error: 'Chỉ có thể tham gia các topic đang mở' })
    }
    if (topic.Participation.some(p => String(p.userId) === userId)) {
      return res.status(400).json({ error: 'Bạn đã tham gia topic này' })
    }
    topic.Participation.push({ userId, startedAt: Date.now() })
    await topic.save()
    await addRecentActivity(req.user._id, {
      title: `Tham gia chủ đề: ${topic.title}`,
      target: { topicId: topic._id },
    })
    const entry = topic.Participation.find(p => String(p.userId) === userId)
    return res.json({ ok: true, startedAt: entry?.startedAt ?? null })
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi server' })
  }
}

export async function myTopicsController(req, res) {
  const userId = String(req.user._id)
  try {
    const topics = await Topic.find({ createdBy: req.user._id })
      .populate('createdBy', 'displayName rank')
      .lean()
    const result = topics.map(topic => {
      const likeCount = topic.reactions?.like?.length || 0
      const dislikeCount = topic.reactions?.dislike?.length || 0
      const liked = topic.reactions?.like?.some(id => String(id) === userId) ? 1
        : topic.reactions?.dislike?.some(id => String(id) === userId) ? -1 : 0
      const submissionCount = topic.submissions?.length || 0
      const participationCount = topic.Participation?.length || 0
      const participationStartTime = topic.Participation?.find(p => String(p.userId) === userId)?.startedAt ?? null
      const mySubmission = topic.submissions?.find(s => String(s.userId) === userId) ?? null

      const { Participation, submissions, reactions, ...rest } = topic
      return {
        ...rest,
        id: String(topic._id),
        likeCount,
        dislikeCount,
        liked,
        submissionCount,
        participationCount,
        participationStartTime,
        mySubmission,
      }
    })
    return res.json(result)
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi server' })
  }
}

import mongoose from 'mongoose'
import { addPointsForTopicApproved } from '../services/rankService.js'
import Topic from '../models/Topic.js'
import { createSystemNotification } from '../services/notificationService.js'

export async function listTopics(req, res) {
  const { page = 1, limit = 10 } = req.query
  const topics = await Topic.listTopics({}, { page, limit })
  // Chuyển trường reactions.like, reactions.dislike, submission, participation thành các trường ảo likeCount, dislikeCount, liked (-1 cho disliked, 0 cho không reaction, 1 cho liked), submissionCount, participationCount, hasParticipated (boolean)
  const transformed = topics.map(topic => {
      const likeCount = topic.reactions?.like?.length || 0
      const dislikeCount = topic.reactions?.dislike?.length || 0
      const liked = topic.reactions?.like?.includes(req.user?._id) ? 1 : (topic.reactions?.dislike?.includes(req.user?._id) ? -1 : 0)
      const submissionCount = topic.submissions?.length || 0
      const participationCount = topic.Participation?.length || 0
      const hasParticipated = req.user ? topic.Participation?.some(p => String(p.userId) === String(req.user._id)) : false
      return {
        ...topic.toObject(),
        likeCount,
        dislikeCount,
        liked,
        submissionCount,
        participationCount,
        hasParticipated,
      }
    })
    res.json(transformed)
}

export async function createTopic(req, res) {
  const user_id = String(req.user._id)
  const rank = req.user.rank
  const { title, description, category, tags, resources, proposalReason } = req.body || {}
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
    const topic = await Topic.findById(id)
    if (!topic) {
      return res.status(404).json({ error: 'Topic không tồn tại' })
    }

    return res.json(topic)
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
    const updatedTopic = await topic.save()
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
  Topic.findById(id).then(topic => {
    if (!topic) return res.status(404).json({ error: 'Topic không tồn tại' })
    if (topic.status !== 'Đang chờ duyệt') {
      return res.status(400).json({ error: 'Chỉ có thể duyệt các topic đang chờ duyệt' })
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
  Topic.findById(id).then(topic => {
    if (!topic) return res.status(404).json({ error: 'Topic không tồn tại' })
    if (topic.status !== 'Đang chờ duyệt') {
      return res.status(400).json({ error: 'Chỉ có thể từ chối các topic đang chờ duyệt' })
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
    return res.status(403).json({ error: 'Chỉ admin mới có quyền xem các topic đang chờ duyệt' })
  try {
    const topics = await Topic.find({ status: 'Chưa duyệt' })
    return res.json(topics)
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi server' })
  }
}
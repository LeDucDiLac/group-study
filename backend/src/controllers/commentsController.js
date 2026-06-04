import Topic from '../models/Topic.js'
import { addPointsForTopicComment } from '../services/rankService.js'
import { createCommentNotifications } from '../services/notificationService.js'

export async function createComment(req, res) {
  const userId = String(req.user._id)
  if (!userId)
    return res.status(401).json({ error: 'Bạn cần đăng nhập để bình luận' })

  const { topicId, submissionId, commentId, content } = req.body
  
  if (!topicId || !submissionId || !content) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' })
  }
  // Bình luận vào submission khi commentId = null, ngược lại là trả lời comment
  if (commentId) {
    // Trả lời comment
    const topic = await Topic.findById(topicId)
    if (!topic) return res.status(404).json({ error: 'Chủ đề không tồn tại' })
    const submission = topic.submissions.id(submissionId)
    if (!submission) return res.status(404).json({ error: 'Bài nộp không tồn tại' })
    const parentComment = submission.comments.id(commentId)
    if (!parentComment) return res.status(404).json({ error: 'Bình luận không tồn tại' })
    parentComment.subComments.push({ content, userId })
    await topic.save()
    await addPointsForTopicComment({ topicOwnerId: topic.createdBy, actorId: userId })
    const newSubComment = parentComment.subComments[parentComment.subComments.length - 1]
    await createCommentNotifications({ userId, commentId: String(newSubComment._id), content })
    return res.json({ comment: newSubComment })
  } else {
    // Bình luận vào submission
    const topic = await Topic.findById(topicId)
    if (!topic) return res.status(404).json({ error: 'Chủ đề không tồn tại' })
    const submission = topic.submissions.id(submissionId)
    if (!submission) return res.status(404).json({ error: 'Bài nộp không tồn tại' })
    submission.comments.push({ content, userId })
    await topic.save()
    await addPointsForTopicComment({ topicOwnerId: topic.createdBy, actorId: userId })
    const newComment = submission.comments[submission.comments.length - 1]
    await createCommentNotifications({ userId, commentId: String(newComment._id), content })
    return res.json({ comment: newComment })
  }
}

import { placeholder } from '../utils/placeholder.js'
import Topic from '../models/Topic.js'

export async function createComment(req, res) {
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
    if (!submission) return res.status(404).json({ error: 'Bài nộp không tồn tại' })``
    const parentComment = submission.comments.id(commentId)
    if (!parentComment) return res.status(404).json({ error: 'Bình luận không tồn tại' })
    parentComment.subComments.push({
      content,
      createdBy: req.user._id,
    })
    await topic.save()
    return res.json({ comment: parentComment.subComments[parentComment.subComments.length - 1] })
  } else {
    // Bình luận vào submission
    const topic = await Topic.findById(topicId)
    if (!topic) return res.status(404).json({ error: 'Chủ đề không tồn tại' })
    const submission = topic.submissions.id(submissionId)
    if (!submission) return res.status(404).json({ error: 'Bài nộp không tồn tại' })
    submission.comments.push({
      content,
      createdBy: req.user._id,
    })
    await topic.save()
    return res.json({ comment: submission.comments[submission.comments.length - 1] })
  }
}

import Bookmark from '../models/Bookmark.js'
import Topic from '../models/Topic.js'

export async function listBookmarks(req, res) {
  const userId = String(req.user._id)
  try {
    const bookmarks = await Bookmark.find({ userId }).sort({ createdAt: -1 })
    res.json({ items: bookmarks })
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy bookmark' })
  }
}

export async function createBookmark(req, res) {
  const userId = String(req.user._id)
  const { targetId, note } = req.body || {}

  if (!targetId) return res.status(400).json({ error: 'Thiếu targetId' })

  // Dùng findTargetById để resolve target đầy đủ (giống reaction)
  const target = await Topic.findTargetById(targetId)
  if (!target) return res.status(404).json({ error: 'Không tìm thấy đối tượng' })

  // Xác định type dựa vào target
  let type = 'topic'
  if (target.subCommentId) type = 'subcomment'
  else if (target.commentId) type = 'comment'
  else if (target.submissionId) type = 'submission'

  try {
    const bookmark = await Bookmark.findOneAndUpdate(
      {
        userId,
        'target.topicId': target.topicId ?? null,
        'target.submissionId': target.submissionId ?? null,
        'target.commentId': target.commentId ?? null,
        'target.subCommentId': target.subCommentId ?? null,
      },
      {
        $set: {
          userId,
          target: {
            topicId: target.topicId,
            submissionId: target.submissionId,
            commentId: target.commentId,
            subCommentId: target.subCommentId,
          },
          type,
          note,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    res.status(201).json({ item: bookmark })
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi tạo bookmark' })
  }
}

export async function deleteBookmark(req, res) {
  const userId = String(req.user._id)
  const { id } = req.params

  const deleted = await Bookmark.findOneAndDelete({ _id: id, userId })
  if (!deleted) return res.status(404).json({ error: 'Bookmark không tồn tại' })
  res.json({ ok: true })
}

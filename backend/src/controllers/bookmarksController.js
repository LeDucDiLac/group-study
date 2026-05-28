import Bookmark from '../models/Bookmark.js'

function hasAnyTargetField(target) {
  return Boolean(target.topicId || target.submissionId || target.commentId || target.subCommentId)
}

export async function listBookmarks(req, res) {
  const userId = String(req.user._id)
  const bookmarks = await Bookmark.find({ userId }).sort({ createdAt: -1 })
  res.json({ items: bookmarks })
}

export async function createBookmark(req, res) {
  const userId = String(req.user._id)
  const { type = 'topic', note } = req.body || {}

  if (!userId) return res.status(401).json({ error: 'Không xác thực' })
  if (!hasAnyTargetField(target)) return res.status(400).json({ error: 'Thiếu thông tin đối tượng bookmark' })

  const bookmark = await Bookmark.findOneAndUpdate(
    { userId, 'target.topicId': target.topicId ?? null, 'target.submissionId': target.submissionId ?? null, 'target.commentId': target.commentId ?? null, 'target.subCommentId': target.subCommentId ?? null },
    { $set: { userId, target, type, note } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  res.status(201).json({ item: bookmark })
}

export async function deleteBookmark(req, res) {
  const userId = String(req.user._id)
  const { id } = req.params
  if (!userId) return res.status(401).json({ error: 'Không xác thực' })

  const deleted = await Bookmark.findOneAndDelete({ _id: id, userId })
  if (!deleted) return res.status(404).json({ error: 'Bookmark không tồn tại' })
  res.json({ ok: true })
}

import Bookmark from '../models/Bookmark.js'
import Topic from '../models/Topic.js'
import { publicInfo } from '../models/User.js'

// Lấy nội dung đầy đủ cho một bookmark dựa vào type và target IDs
async function populateBookmark(bookmark) {
  const { type, target } = bookmark
  const { topicId, submissionId, commentId, subCommentId } = target

  try {
    if (type === 'topic' && topicId) {
      const topic = await Topic.findById(topicId)
        .select('title description category tags status reactions submissions Participation createdBy')
        .populate('createdBy', 'displayName rank')
        .lean()
      if (!topic) return null
      return {
        ...bookmark,
        content: {
          type: 'topic',
          topic: {
            _id: String(topic._id),
            title: topic.title,
            description: topic.description,
            category: topic.category,
            tags: topic.tags,
            status: topic.status,
            likeCount: topic.reactions?.like?.length || 0,
            dislikeCount: topic.reactions?.dislike?.length || 0,
            submissionCount: topic.submissions?.length || 0,
            participationCount: topic.Participation?.length || 0,
            createdBy: topic.createdBy,
          },
        },
      }
    }

    if (type === 'submission' && topicId && submissionId) {
      const topic = await Topic.findOne({ _id: topicId, 'submissions._id': submissionId })
        .select('title submissions.$')
        .lean()
      if (!topic) return null
      const sub = topic.submissions[0]
      if (!sub) return null
      const user = sub.isAnonymous ? null : await publicInfo(sub.userId)
      return {
        ...bookmark,
        content: {
          type: 'submission',
          topicTitle: topic.title,
          topicId: String(topicId),
          submission: {
            _id: String(sub._id),
            understood: sub.understood,
            notUnderstood: sub.notUnderstood,
            isAnonymous: sub.isAnonymous,
            likeCount: sub.reactions?.like?.length || 0,
            dislikeCount: sub.reactions?.dislike?.length || 0,
            commentCount: sub.comments?.length || 0,
            user,
          },
        },
      }
    }

    if ((type === 'comment' || type === 'subcomment') && topicId && submissionId && commentId) {
      const topic = await Topic.findOne({ _id: topicId, 'submissions._id': submissionId })
        .select('title submissions.$')
        .lean()
      if (!topic) return null
      const sub = topic.submissions[0]
      if (!sub) return null
      const comment = sub.comments.find(c => String(c._id) === String(commentId))
      if (!comment) return null

      if (type === 'subcomment' && subCommentId) {
        const sub2 = comment.subComments?.find(sc => String(sc._id) === String(subCommentId))
        if (!sub2) return null
        const user = sub2.isAnonymous ? null : await publicInfo(sub2.userId)
        return {
          ...bookmark,
          content: {
            type: 'subcomment',
            topicTitle: topic.title,
            topicId: String(topicId),
            submissionId: String(submissionId),
            commentId: String(commentId),
            comment: {
              _id: String(sub2._id),
              content: sub2.content,
              isAnonymous: sub2.isAnonymous,
              likeCount: sub2.reactions?.like?.length || 0,
              user,
              createdAt: sub2.createdAt,
            },
          },
        }
      }

      const user = comment.isAnonymous ? null : await publicInfo(comment.userId)
      return {
        ...bookmark,
        content: {
          type: 'comment',
          topicTitle: topic.title,
          topicId: String(topicId),
          submissionId: String(submissionId),
          comment: {
            _id: String(comment._id),
            content: comment.content,
            isAnonymous: comment.isAnonymous,
            likeCount: comment.reactions?.like?.length || 0,
            user,
            createdAt: comment.createdAt,
          },
        },
      }
    }
  } catch {
    // nếu lỗi thì trả về bookmark gốc không có content
  }

  return bookmark
}

export async function listBookmarks(req, res) {
  const userId = String(req.user._id)
  try {
    const bookmarks = await Bookmark.find({ userId }).sort({ createdAt: -1 }).lean()
    const populated = await Promise.all(bookmarks.map(b => populateBookmark({
      _id: String(b._id),
      type: b.type,
      target: {
        topicId: b.target?.topicId ? String(b.target.topicId) : undefined,
        submissionId: b.target?.submissionId ? String(b.target.submissionId) : undefined,
        commentId: b.target?.commentId ? String(b.target.commentId) : undefined,
        subCommentId: b.target?.subCommentId ? String(b.target.subCommentId) : undefined,
      },
      note: b.note,
      createdAt: b.createdAt,
    })))
    res.json({ items: populated.filter(Boolean) })
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

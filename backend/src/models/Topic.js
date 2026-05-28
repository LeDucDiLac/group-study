import mongoose from 'mongoose'

const { Schema } = mongoose

const reactionSchema = new Schema(
  {
    like: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    dislike: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { _id: false }
)

const commentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    reactions: {
      type: reactionSchema,
      default: () => ({ like: [], dislike: [] }),
    },
    subcomments: [],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
)

commentSchema.add({ subcomments: [commentSchema] })

const topicResourceSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['link', 'file'],
      required: true,
    },
    label: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
)

const submissionResourceSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['link', 'file'],
      required: true,
    },
    label: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
)


const submissionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    understood: {
      type: String,
      required: true,
      trim: true,
    },
    notUnderstood: {
      type: String,
      trim: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Chưa duyệt', 'Đã duyệt'],
      default: 'Chưa duyệt',
      trim: true,
    },
    reactions: {
      type: reactionSchema,
      default: () => ({ like: [], dislike: [] }),
    },
    resources: [submissionResourceSchema],
    comments: [commentSchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
)

const participationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
)

const topicSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    tags: [{ type: String, trim: true }],
    windowHours: {
      type: Number,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    proposalReason: {
      type: String,
      trim: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Chưa duyệt', 'Bị từ chối', 'Đang mở', 'Đã hoàn thành'],
      default: 'Chưa duyệt',
      trim: true,
    },
    reactions: {
      like: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      dislike: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    resources: [topicResourceSchema],
    Participation: [participationSchema],
    submissions: [submissionSchema],
  },
  {
    timestamps: true,
  }
)

// Do not create the model until statics are attached

// Static helper: find topic/submission/comment by a comment id (top-level or nested)
// Returns { topicId, submissionId, commentId, subCommentId? } or null
topicSchema.statics.findTargetByCommentId = async function findTargetByCommentId(commentId) {
  if (!commentId) return null

  const normalizedId = new mongoose.Types.ObjectId(commentId)

  const subCommentMatch = await this.aggregate([
    { $unwind: '$submissions' },
    { $unwind: '$submissions.comments' },
    { $unwind: '$submissions.comments.subcomments' },
    { $match: { 'submissions.comments.subcomments._id': normalizedId } },
    {
      $project: {
        topicId: '$_id',
        submissionId: '$submissions._id',
        commentId: '$submissions.comments._id',
        subCommentId: '$submissions.comments.subcomments._id',
      },
    },
  ])

  if (subCommentMatch.length > 0) {
    return subCommentMatch[0]
  }

  const subCommentAliasMatch = await this.aggregate([
    { $unwind: '$submissions' },
    { $unwind: '$submissions.comments' },
    { $unwind: '$submissions.comments.subComments' },
    { $match: { 'submissions.comments.subComments._id': normalizedId } },
    {
      $project: {
        topicId: '$_id',
        submissionId: '$submissions._id',
        commentId: '$submissions.comments._id',
        subCommentId: '$submissions.comments.subComments._id',
      },
    },
  ])

  if (subCommentAliasMatch.length > 0) {
    return subCommentAliasMatch[0]
  }

  const commentMatch = await this.aggregate([
    { $unwind: '$submissions' },
    { $unwind: '$submissions.comments' },
    { $match: { 'submissions.comments._id': normalizedId } },
    {
      $project: {
        topicId: '$_id',
        submissionId: '$submissions._id',
        commentId: '$submissions.comments._id',
      },
    },
  ])

  if (commentMatch.length > 0) {
    return commentMatch[0]
  }

  return null
}

const Topic = mongoose.models.Topic || mongoose.model('Topic', topicSchema)

export function listTopics(filter = {}, options = {}) {
  
  const { page = 1, limit = 10 } = options
  if (page && limit) {
    return Topic.find(filter)
      .select('-proposalReason -rejectionReason, -approvedBy -approvedAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
  } else {
    return Topic.find(filter).sort({ createdAt: -1 })
  }
}

export default Topic

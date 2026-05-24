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
    comments: [],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
)

commentSchema.add({ comments: [commentSchema] })

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
    status: {
      type: String,
      trim: true,
    },
    windowHours: {
      type: Number,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resources: [topicResourceSchema],
    Participation: [participationSchema],
    submissions: [submissionSchema],
  },
  {
    timestamps: true,
  }
)

const Topic = mongoose.models.Topic || mongoose.model('Topic', topicSchema)

export default Topic

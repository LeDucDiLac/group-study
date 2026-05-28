import mongoose from 'mongoose'

const { Schema } = mongoose

const userSchema = new Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      trim: true,
    },
    rank: {
      type: Number,
    },
    submissionPeekedAt: {
      type: Date,
    },
    submissionPeekedTopicId: {
      type: Schema.Types.ObjectId,
      ref: 'Topic',
    },
    recentActivities: {
      type: [
        {
          _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
          title: { type: String },
          target: { type: Schema.Types.Mixed }, // { topicId, submissionId, commentId, subCommentId }
          createdAt: { type: Date, default: Date.now },
        }
      ],
      default: [],
      validate: [arr => arr.length <= 3, 'Tối đa 3 hoạt động gần đây'],
    },
    summary: {
      submissions: { type: [Schema.Types.Mixed], default: [] }, // { topicId, submissionId }
      likesReceived: { type: Number, default: 0 },
      liked: { type: [Schema.Types.Mixed], default: [] }, // { topicId, submissionId, commentId, [subCommentId] }
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
)

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User

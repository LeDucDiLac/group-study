import mongoose from 'mongoose'

const { Schema } = mongoose

const bookmarkSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    target: {
      topicId: {
        type: Schema.Types.ObjectId,
        ref: 'Topic',
      },
      submissionId: {
        type: Schema.Types.ObjectId,
        ref: 'Submission',
      },
      commentId: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
      subCommentId: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    },
    type: {
      type: String,
      default: 'topic',
      trim: true,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'bookmarks',
  }
)

bookmarkSchema.index({ userId: 1, 'target.topicId': 1, 'target.submissionId': 1, 'target.commentId': 1, 'target.subCommentId': 1 }, { unique: true })

const Bookmark = mongoose.models.Bookmark || mongoose.model('Bookmark', bookmarkSchema)

export default Bookmark

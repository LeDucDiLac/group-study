import mongoose from 'mongoose'

const { Schema } = mongoose

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
    topicId: {
      type: Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
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
    timeSpentSeconds: {
      type: Number,
      min: 0,
    },
    isLocked: {
      type: Boolean,
      default: true,
    },
    resources: [submissionResourceSchema],
  },
  {
    timestamps: true,
  }
)

submissionSchema.index({ topicId: 1, userId: 1 }, { unique: true })

const Submission = mongoose.models.Submission || mongoose.model('Submission', submissionSchema)

export default Submission

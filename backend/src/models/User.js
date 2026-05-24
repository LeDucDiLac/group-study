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
    avatarUrl: {
      type: String,
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
  },
  {
    timestamps: true,
    collection: 'users',
  }
)

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User

import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import healthRoutes from './routes/healthRoutes.js'
import authRoutes from './routes/authRoutes.js'
import topicsRoutes from './routes/topicsRoutes.js'
import submissionsRoutes from './routes/submissionsRoutes.js'
import commentsRoutes from './routes/commentsRoutes.js'
import bookmarksRoutes from './routes/bookmarksRoutes.js'
import reactionRoutes from './routes/reactionRoute.js'
import uploadRoutes from './routes/uploadRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import notificationRoute from './routes/notificationRoute.js'

dotenv.config()

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

const PORT = process.env.PORT || 3001

const isDbWarningSuppressed = process.env.SUPPRESS_DB_WARNING === 'true'
const mongoUri = process.env.MONGODB_URI

async function connectDb() {
  if (!mongoUri) {
    if (!isDbWarningSuppressed) {
      console.warn('MONGODB_URI is not set. Running without database connection.')
    }
    return
  }

  try {
    await mongoose.connect(mongoUri)
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
  }
}

app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/topics', topicsRoutes)
app.use('/api/submissions', submissionsRoutes)
app.use('/api/comments', commentsRoutes)
app.use('/api/bookmarks', bookmarksRoutes)
app.use('/api/reactions', reactionRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/profiles', profileRoutes)
app.use('/api/notifications', notificationRoute)
app.use('/uploads', express.static('uploads'))

// Fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message || 'Server error' })
})

connectDb().finally(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
})

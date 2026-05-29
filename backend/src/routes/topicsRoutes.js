import { Router } from 'express'
import {
  listTopics,
  createTopic,
  getTopic,
  updateTopic,
  approveTopic,
  rejectTopic,
  markTopicCompleted,
  getUnapprovedTopics,
} from '../controllers/topicsController.js'
import multer from 'multer'
import authMiddleware from '../middleware/authMiddleware.js'

const router = Router()
const upload = multer({ dest: 'uploads/resources/' })

router.get('/', listTopics)
router.post('/', authMiddleware, createTopic)
router.get('/:id', getTopic)
router.patch('/:id', authMiddleware, updateTopic)
router.post('/:id/approve', authMiddleware, approveTopic)
router.post('/:id/reject', authMiddleware, rejectTopic)
router.post('/:id/mark-completed', authMiddleware, markTopicCompleted)
router.post('/uploads', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  const fileUrl = `/uploads/resources/${req.file.filename}`
  res.json({ url: fileUrl })
})
router.get('/unapproved', authMiddleware, getUnapprovedTopics)

export default router

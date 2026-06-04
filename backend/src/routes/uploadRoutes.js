import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { randomUUID } from 'crypto'
import authMiddleware from '../middleware/authMiddleware.js'

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/markdown',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const ALLOWED_EXT = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.md', '.txt', '.docx'])

const storage = multer.diskStorage({
  destination: 'uploads/resources/',
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${randomUUID()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (ALLOWED_MIME.has(file.mimetype) || ALLOWED_EXT.has(ext)) {
      cb(null, true)
    } else {
      cb(new Error('Định dạng file không được hỗ trợ.'))
    }
  },
})

function extToType(ext) {
  if (ext === '.pdf') return 'pdf'
  if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) return 'image'
  if (ext === '.md') return 'markdown'
  if (ext === '.txt') return 'txt'
  if (ext === '.docx') return 'docx'
  return 'file'
}

const router = Router()

router.post('/', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Không có file được gửi lên.' })
  }

  const url = `/uploads/resources/${req.file.filename}`

  return res.json({
    url,
    label: req.file.originalname,
    type: 'file'
  })
})

// Lỗi multer (file quá lớn, sai định dạng)
router.use((err, _req, res, _next) => {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File vượt quá giới hạn 20MB.' })
  }
  return res.status(400).json({ error: err.message || 'Lỗi upload file.' })
})

export default router

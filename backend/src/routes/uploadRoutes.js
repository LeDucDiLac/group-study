import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { randomUUID } from 'crypto'
import authMiddleware from '../middleware/authMiddleware.js'

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/rtf',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel.sheet.macroenabled.12',
  'application/vnd.ms-powerpoint.presentation.macroenabled.12',
  'application/vnd.ms-word.document.macroenabled.12',
  'application/json',
  'application/xml',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/vnd.rar',
  'application/x-7z-compressed',
  'application/gzip',
  'application/x-tar',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/svg+xml',
  'image/heic',
  'image/heif',
  'image/avif',
  'image/webp',
  'text/markdown',
  'text/plain',
  'text/csv',
  'text/tab-separated-values',
  'text/xml',
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/webm',
])

const ALLOWED_EXT = new Set([
  '.pdf',
  '.doc',
  '.docx',
  '.rtf',
  '.odt',
  '.xls',
  '.xlsx',
  '.xlsm',
  '.ods',
  '.csv',
  '.tsv',
  '.ppt',
  '.pptx',
  '.pptm',
  '.odp',
  '.txt',
  '.md',
  '.markdown',
  '.json',
  '.xml',
  '.yaml',
  '.yml',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.bmp',
  '.tif',
  '.tiff',
  '.svg',
  '.heic',
  '.heif',
  '.avif',
  '.zip',
  '.rar',
  '.7z',
  '.tar',
  '.gz',
  '.bz2',
  '.mp3',
  '.wav',
  '.m4a',
  '.mp4',
  '.mov',
  '.avi',
  '.mkv',
  '.webm',
])

function normalizeOriginalName(name = '') {
  if (!name) return name
  const decoded = Buffer.from(name, 'latin1').toString('utf8')
  return decoded.includes('\uFFFD') ? name : decoded
}

const storage = multer.diskStorage({
  destination: 'uploads/resources/',
  filename: (_req, file, cb) => {
    const normalizedName = normalizeOriginalName(file.originalname)
    const ext = path.extname(normalizedName).toLowerCase()
    cb(null, `${randomUUID()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const normalizedName = normalizeOriginalName(file.originalname)
    const ext = path.extname(normalizedName).toLowerCase()
    if (ALLOWED_MIME.has(file.mimetype) || ALLOWED_EXT.has(ext)) {
      cb(null, true)
    } else {
      cb(new Error('Định dạng file không được hỗ trợ. Hãy dùng các định dạng tài liệu phổ biến (ảnh, PDF, Office, bảng tính, trình chiếu, text, nén, media).'))
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
  const label = normalizeOriginalName(req.file.originalname)

  return res.json({
    url,
    label,
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

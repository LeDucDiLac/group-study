import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { getProfile, updateProfile, updateAvatar } from '../controllers/profileController.js'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const COOKIE_NAME = 'tb_token'

const router = Router()
const upload = multer({ 
    dest: 'uploads/avatars/temp/', // Thư mục tạm để lưu trữ ảnh trước khi xử lý
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước file là 5MB
    fileFilter: (req, file, cb) => {
        // Chỉ chấp nhận các định dạng ảnh phổ biến
        if (file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh'), false)
        }
    }
})

// Optional auth — populate req.user nếu có token, không bắt buộc
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization
    const cookieToken = req.cookies?.[COOKIE_NAME]
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : cookieToken
  if (!token) return next()
  try {
        const payload = jwt.verify(token, JWT_SECRET)
    if (payload.id) {
      const User = (await import('../models/User.js')).default
      req.user = await User.findById(payload.id)
    }
  } catch (error) {
        // Token không hợp lệ hoặc hết hạn — tiếp tục không có user
  }
  next()
}

router.get('/:userId', optionalAuth, getProfile)
router.put('/:userId', authMiddleware, updateProfile)
router.get('/:userId/avatar', async (req, res) => {
    const userId = String(req.params.userId)
    // Tìm trong thư mục avatar nếu có file nào có tên bắt đầu bằng userId thì trả về file đó
    const avatarDir = path.join(process.cwd(), 'uploads/avatars/')
    fs.readdir(avatarDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Lỗi server' })
        }
        const avatarFile = files.find(file => file.startsWith(userId + '.'))
        if (avatarFile) {
            res.sendFile(path.join(avatarDir, avatarFile))
        }
        else {
            res.status(404).json({ error: 'Không tìm thấy ảnh đại diện' })
        }
    })
})
router.post('/:userId/avatar', authMiddleware, upload.single('avatar'), updateAvatar)

export default router
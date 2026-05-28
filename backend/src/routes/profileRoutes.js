import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { getProfile, getSelfProfile, updateProfile } from '../controllers/profileController.js'

const router = Router()
const multer = require('multer')
const upload = multer({ 
    dest: 'uploads/avatars/temp/', // Thư mục tạm để lưu trữ ảnh trước khi xử lý
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước file là 5MB
    fileFilter: (req, file, cb) => {
        // Chỉ chấp nhận các định dạng ảnh phổ biến
        if (file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh'))
        }
    }
})

router.get('/:userId', getProfile)
router.get('/self', authMiddleware, getSelfProfile)
router.put('/:userId', authMiddleware, updateProfile)
router.post('/:userId/avatar', authMiddleware, upload.single('avatar'), updateAvatar)
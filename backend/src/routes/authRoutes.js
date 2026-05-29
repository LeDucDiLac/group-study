import { Router } from 'express'
import { register, login, forgotPassword, googleAuth, logout, me, changePassword } from '../controllers/authController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = Router()


router.post('/register', register)
router.post('/login', login)
router.post('/forgot', forgotPassword)
router.post('/google', googleAuth)
router.post('/logout', logout)
router.get('/me', authMiddleware, me)
router.post('/change-password', authMiddleware, changePassword)

export default router

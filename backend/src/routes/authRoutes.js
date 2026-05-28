import { Router } from 'express'
import { login, register } from '../controllers/authController.js'

const router = Router()

import { register, login, forgotPassword, googleAuth, logout, me, changePassword } from '../controllers/authController.js'
import authMiddleware from '../middleware/authMiddleware.js'

router.post('/register', register)
router.post('/login', login)
router.post('/forgot', forgotPassword)
router.post('/google', googleAuth)
router.post('/logout', logout)
router.get('/me', authMiddleware, me)
router.post('/change-password', authMiddleware, changePassword)

export default router

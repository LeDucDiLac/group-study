import { Router } from 'express'
import { getNotifications, markAllRead, markAsRead, createSystemNotification } from '../controllers/notificationController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = Router()
router.get('/', authMiddleware, getNotifications)
router.post('/mark-all-read', authMiddleware, markAllRead)
router.post('/mark-as-read', authMiddleware, markAsRead)
router.post('/system', createSystemNotification)

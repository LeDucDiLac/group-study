import { Router } from 'express'
import { like, dislike, cancelReaction } from '../controllers/reactionController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = Router()

router.post('/like', authMiddleware, like)
router.post('/dislike', authMiddleware, dislike)
router.post('/cancel', authMiddleware, cancelReaction)

export default router

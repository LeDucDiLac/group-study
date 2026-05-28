import { Router } from 'express'
import { createComment } from '../controllers/commentsController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = Router()

router.post('/', authMiddleware, createComment)

export default router

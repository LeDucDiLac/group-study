import { Router } from 'express'
import { createComment, listComments } from '../controllers/commentsController.js'

const router = Router()

router.get('/', listComments)
router.post('/', createComment)

export default router

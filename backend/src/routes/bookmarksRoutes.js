import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { createBookmark, deleteBookmark, listBookmarks } from '../controllers/bookmarksController.js'

const router = Router()

router.use(authMiddleware)
router.get('/', listBookmarks)
router.post('/', createBookmark)
router.delete('/:id', deleteBookmark)

export default router

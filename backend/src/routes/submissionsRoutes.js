import { Router } from 'express'
import {
  createSubmission,
  getSubmission,
  listSubmissions,
} from '../controllers/submissionsController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', listSubmissions)
router.post('/', authMiddleware, createSubmission)
router.get('/:id', getSubmission)

export default router

import { Router } from 'express'
import {
  createSubmission,
  listMySubmissions,
  listTopicSubmissions,
  peekSubmissions,
  approveSubmission,
  rejectSubmission,
  getUnapprovedSubmissions,
} from '../controllers/submissionsController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = Router()

router.get('/topic/:topicId', authMiddleware, listTopicSubmissions)
router.get('/mine', authMiddleware, listMySubmissions)
router.post('/', authMiddleware, createSubmission)
router.post('/peek/:topicId', authMiddleware, peekSubmissions)
router.post('/approve/:submissionId', authMiddleware, approveSubmission)
router.post('/reject/:submissionId', authMiddleware, rejectSubmission)
router.get('/unapproved', authMiddleware, getUnapprovedSubmissions)
export default router

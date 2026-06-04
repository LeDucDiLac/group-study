import { Router } from 'express'
import {
  createSubmission,
  listMySubmissions,
  listTopicSubmissions,
  peekSubmissions,
  approveSubmission,
  rejectSubmission,
  getUnapprovedSubmissions,
  getSubmissionComments,
} from '../controllers/submissionsController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = Router()

router.get('/topic/:topicId', authMiddleware, listTopicSubmissions)
router.get('/mine', authMiddleware, listMySubmissions)
router.get('/unapproved', authMiddleware, getUnapprovedSubmissions)
router.get('/:submissionId/comments', authMiddleware, getSubmissionComments)
router.post('/', authMiddleware, createSubmission)
router.post('/peek/:topicId', authMiddleware, peekSubmissions)
router.post('/approve/:submissionId', authMiddleware, approveSubmission)
router.post('/reject/:submissionId', authMiddleware, rejectSubmission)

export default router

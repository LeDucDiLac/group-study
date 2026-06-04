import { Router } from 'express'
import {
  listTopicsController,
  myTopicsController,
  getParticipatedTopics,
  createTopic,
  getTopic,
  updateTopic,
  approveTopic,
  rejectTopic,
  markTopicCompleted,
  getUnapprovedTopics,
  participateTopic,
} from '../controllers/topicsController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', authMiddleware, listTopicsController)
router.get('/my-topics', authMiddleware, myTopicsController)
router.get('/participated', authMiddleware, getParticipatedTopics)
router.get('/unapproved', authMiddleware, getUnapprovedTopics)
router.post('/:id/participate', authMiddleware, participateTopic)
router.post('/', authMiddleware, createTopic)
router.get('/:id', authMiddleware, getTopic)
router.patch('/:id', authMiddleware, updateTopic)
router.post('/:id/approve', authMiddleware, approveTopic)
router.post('/:id/reject', authMiddleware, rejectTopic)
router.post('/:id/mark-completed', authMiddleware, markTopicCompleted)

export default router

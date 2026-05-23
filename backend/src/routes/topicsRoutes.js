import { Router } from 'express'
import {
  approveTopic,
  createTopic,
  getTopic,
  listTopics,
  updateTopic,
} from '../controllers/topicsController.js'

const router = Router()

router.get('/', listTopics)
router.post('/', createTopic)
router.get('/:id', getTopic)
router.patch('/:id', updateTopic)
router.post('/:id/approve', approveTopic)

export default router

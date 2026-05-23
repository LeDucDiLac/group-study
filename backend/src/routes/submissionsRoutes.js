import { Router } from 'express'
import {
  createSubmission,
  getSubmission,
  listSubmissions,
} from '../controllers/submissionsController.js'

const router = Router()

router.get('/', listSubmissions)
router.post('/', createSubmission)
router.get('/:id', getSubmission)

export default router

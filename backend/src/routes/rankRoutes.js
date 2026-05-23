import { Router } from 'express'
import { getRank } from '../controllers/rankController.js'

const router = Router()

router.get('/', getRank)

export default router

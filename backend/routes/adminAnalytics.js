import { Router } from 'express'
import { getAdminAnalytics } from '../controllers/adminAnalyticsController.js'

const router = Router()

router.get('/', getAdminAnalytics)

export default router

import express from 'express'
import requireAuth from '../middleware/auth.js'
import {
  getDashboardProfile,
  getDashboardOverview,
  getDashboardTugasAktif,
  getDashboardActivity
} from '../controllers/dashboardController.js'

const router = express.Router()

router.get('/profile', requireAuth, getDashboardProfile)
router.get('/overview', requireAuth, getDashboardOverview)
router.get('/tugas-aktif', requireAuth, getDashboardTugasAktif)
router.get('/activity', requireAuth, getDashboardActivity)

export default router

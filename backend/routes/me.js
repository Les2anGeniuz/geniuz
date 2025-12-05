import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getMyKelas } from '../controllers/meController.js'

const router = express.Router()

router.get('/kelas', requireAuth, getMyKelas)

export default router

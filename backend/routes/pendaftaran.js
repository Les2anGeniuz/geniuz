import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import { createPendaftaran, getMyPendaftarans } from '../controllers/pendaftaranController.js'

const router = express.Router()

router.post('/', requireAuth, createPendaftaran)
router.get('/me', requireAuth, getMyPendaftarans)

export default router

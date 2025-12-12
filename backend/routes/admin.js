import express from 'express'
import requireAdmin from '../middleware/adminAuth.js'
import { getAdminById } from '../controllers/adminController.js'

const router = express.Router()

router.get('/:id', requireAdmin, getAdminById)

export default router

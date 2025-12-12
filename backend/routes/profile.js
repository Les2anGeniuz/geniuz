import express from 'express'
<<<<<<< HEAD
import requireAuth from '../middleware/auth.js'
=======
import { requireAuth } from '../middleware/auth.js'
>>>>>>> ad2763b177a6af6416b89799f9a4dd101fcb687a
import { getMyProfile, updateMyProfile } from '../controllers/profileController.js'

const router = express.Router()

router.get('/me', requireAuth, getMyProfile)
router.put('/me', requireAuth, updateMyProfile)

export default router

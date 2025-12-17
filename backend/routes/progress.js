import express from 'express'
<<<<<<< HEAD
<<<<<<< HEAD
import requireAuth from '../middleware/auth.js'
=======
import {requireAuth} from '../middleware/auth.js'
>>>>>>> ad2763b177a6af6416b89799f9a4dd101fcb687a
=======
import {requireAuth} from '../middleware/auth.js'
>>>>>>> 9d3e909a479e751f94f4ebb373d4c41c23f2ffd9
import { getMyProgress, getMyProgressByKelas } from '../controllers/progressController.js'

const router = express.Router()

router.get('/me', requireAuth, getMyProgress)
router.get('/kelas/:id', requireAuth, getMyProgressByKelas)

export default router

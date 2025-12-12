import express from 'express'
<<<<<<< HEAD
import requireAuth from '../middleware/auth.js'
=======
import {requireAuth} from '../middleware/auth.js'
>>>>>>> ad2763b177a6af6416b89799f9a4dd101fcb687a
import { getTugasByKelas, getTugasById, getActiveTugasForUser } from '../controllers/tugasController.js'

const router = express.Router()

router.get('/kelas/:id', getTugasByKelas)
router.get('/me/aktif', requireAuth, getActiveTugasForUser)
router.get('/:id', getTugasById)

export default router

import express from 'express'
<<<<<<< HEAD
import requireAuth from '../middleware/auth.js'
=======
import {requireAuth} from '../middleware/auth.js'
>>>>>>> ad2763b177a6af6416b89799f9a4dd101fcb687a
import { getMySubmissionForTugas, submitTugas } from '../controllers/pengumpulanTugasController.js'

const router = express.Router()

router.get('/tugas/:id/me', requireAuth, getMySubmissionForTugas)
router.post('/tugas/:id/submit', requireAuth, submitTugas)

export default router

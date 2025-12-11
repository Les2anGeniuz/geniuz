import express from 'express'
import { getMateriByKelas, getMateriById } from '../controllers/materiController.js'

const router = express.Router()

router.get('/kelas/:id', getMateriByKelas)
router.get('/:id', getMateriById)

export default router

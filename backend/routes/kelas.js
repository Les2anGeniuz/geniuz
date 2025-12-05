import express from 'express'
import { getAllKelas, getKelasById } from '../controllers/kelasController.js'

const router = express.Router()

router.get('/', getAllKelas)
router.get('/:id', getKelasById)

export default router

// backend/routes/adminPengumpulanTugas.js

import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import { getPengumpulanTugas } from "../controllers/adminPengumpulanTugasController.js";
const router = express.Router();

// GET /admin/tugas/:idTugas/pengumpulan
router.get("/tugas/:idTugas/pengumpulan", adminAuth, getPengumpulanTugas);

export default router;

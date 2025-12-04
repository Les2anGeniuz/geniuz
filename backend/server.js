import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.js'
import pendaftaranRoutes from './routes/pendaftaran.js'
import pembayaranRoutes from './routes/pembayaran.js'
import profileRoutes from './routes/profile.js'
import fakultasRoutes from './routes/fakultas.js'
import kelasRoutes from './routes/kelas.js'
import meRoutes from './routes/me.js'
import materiRoutes from './routes/materi.js'
import tugasRoutes from './routes/tugas.js'
import pengumpulanTugasRoutes from './routes/pengumpulanTugas.js'
import progressRoutes from './routes/progress.js'
import mentorRoutes from './routes/mentor.js'

dotenv.config()

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true, credentials: true }))
app.use(express.json())

app.get('/', (_, res) => res.send('API OK'))

app.use('/api/auth', authRoutes)
app.use('/api/pendaftaran', pendaftaranRoutes)
app.use('/api/pembayaran', pembayaranRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/fakultas', fakultasRoutes)
app.use('/api/kelas', kelasRoutes)
app.use('/api/me', meRoutes)
app.use('/api/materi', materiRoutes)
app.use('/api/tugas', tugasRoutes)
app.use('/api/pengumpulan', pengumpulanTugasRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/mentor', mentorRoutes)

app.listen(process.env.PORT || 5000, () => {
  console.log(`Backend ready on http://localhost:${process.env.PORT || 5000}`)
})

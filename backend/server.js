import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.js'
import pendaftaranRoutes from './routes/pendaftaran.js'
import pembayaranRoutes from './routes/pembayaran.js'
import profileRoutes from './routes/profile.js'
import fakultasRoutes from './routes/fakultas.js'
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

app.listen(process.env.PORT || 5000, () => {
  console.log(`Backend ready on http://localhost:${process.env.PORT || 5000}`)
})

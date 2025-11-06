import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true, credentials: true }));
app.use(express.json()); // <— WAJIB, agar body JSON bisa dibaca

app.get('/', (_, res) => res.send('API OK'));                 // optional
app.get('/api/auth/health', (_, res) => res.json({ ok: true })); // optional healthcheck

app.use('/api/auth', authRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Backend ready on http://localhost:${process.env.PORT || 5000}`);
});

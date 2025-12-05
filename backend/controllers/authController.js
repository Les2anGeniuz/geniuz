import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../services/supabase.js';

const TABLE = 'User';
const SALT_ROUNDS = 10;

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
}

// POST /api/auth/register
export async function register(req, res) {
  try {
    const { nama_lengkap, email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: 'Email & password wajib' });
    if (password.length < 6) return res.status(400).json({ error: 'Password minimal 6 karakter' });

    // cek email exist
    const { data: exist, error: exErr } = await supabaseAdmin
      .from(TABLE).select('id_User').eq('email', email).limit(1);
    if (exErr) return res.status(500).json({ error: exErr.message });
    if (exist && exist.length) return res.status(409).json({ error: 'Email sudah terdaftar' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert([{
        nama_lengkap, email, password: hashed, 
        // created_at auto now() dari DB
      }])
      .select('id_User, email, nama_lengkap, created_at')
      .single();

    if (error) return res.status(500).json({ error: error.message });

    const token = signToken({ id_User: data.id_User, email: data.email });
    return res.status(201).json({ message: 'Registrasi berhasil', user: data, access_token: token });
    } catch (e) {
    console.error('[REGISTER ERROR]', e);
    return res.status(500).json({ error: e?.message || 'Internal server error' });
    }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email & password wajib' });

    const { data: user, error } = await supabaseAdmin
      .from(TABLE)
      .select('id_User, email, password, nama_lengkap, created_at')
      .eq('email', email)
      .single();

    if (error) {
      console.error('[LOGIN SELECT ERROR]', error);
      // Mengembalikan error yang sama untuk keamanan
      return res.status(401).json({ error: 'Email atau password salah' });
    }
    if (!user) {
      console.error('[LOGIN NOT FOUND]', email);
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    // PENTING: Cek apakah password hash berhasil diambil dari DB
    if (!user.password) {
        console.error('[LOGIN ERROR] Password hash not retrieved from database. Check RLS policy.');
        return res.status(401).json({ error: 'Email atau password salah' });
    }

    console.log('[LOGIN USER ROW]', { id_User: user.id_User, email: user.email, hasPwd: !!user.password });

    // Perbandingan bcrypt
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.error('[LOGIN BCRYPT MISMATCH]');
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const token = jwt.sign({ id_User: user.id_User, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });

    delete user.password;
    return res.json({ message: 'Login berhasil', user, access_token: token });
  } catch (e) {
    console.error('[LOGIN CATCH]', e);
    return res.status(500).json({ error: e?.message || 'Internal server error' });
  }
}

// GET /api/auth/me
export async function me(req, res) {
  return res.json({ user: req.user });
}

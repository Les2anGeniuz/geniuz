import { supabaseAdmin } from '../services/supabase.js'
import jwt from 'jsonwebtoken'

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const { data: admin, error } = await supabaseAdmin
      .from('Admin')
      .select('id, nama, email, password')
      .eq('email', email)
      .eq('password', password)
      .single()

    if (error || !admin) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { adminId: admin.id, role: 'admin' },
      process.env.JWT_SECRET_ADMIN || process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    return res.status(200).json({
      message: 'Login success',
      admin: { id: admin.id, nama: admin.nama, email: admin.email },
      token
    })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Internal server error' })
  }
}

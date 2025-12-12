import jwt from 'jsonwebtoken'

export default function requireAdmin(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const secret = process.env.JWT_SECRET_ADMIN || process.env.JWT_SECRET
    const payload = jwt.verify(token, secret)
    if (payload?.role !== 'admin' || !payload?.adminId) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    req.admin = payload
    next()
  } catch (_) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

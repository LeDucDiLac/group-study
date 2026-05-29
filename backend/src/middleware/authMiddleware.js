import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const COOKIE_NAME = 'tb_token'

function extractToken(req) {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  const cookieToken = req.cookies?.[COOKIE_NAME]
  if (cookieToken) return cookieToken

  return null
}

export default async function authMiddleware(req, res, next) {
  const token = extractToken(req)
  if (!token) return res.status(401).json({ error: 'Không được xác thực' })

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const userId = payload.id
    if (!userId) return res.status(401).json({ error: 'Token không hợp lệ' })

    let user = null
    try {
      user = await User.findById(userId)
    } catch (error) {
      return res.status(401).json({ error: 'Nguời dùng không tồn tại' })
    }

    req.user = user
    return next()
  } catch (error) {
    console.error('Lỗi xác thực token:', error.message)
    return res.status(401).json({ error: 'Token không hợp lệ' })
  }
}

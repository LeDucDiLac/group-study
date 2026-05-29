import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const COOKIE_NAME = 'tb_token'

function signToken(data) {
  return jwt.sign(data, JWT_SECRET, { expiresIn: '30d' })
}

export async function register(req, res) {
  const { name, email, password } = req.body
  if (!email || !password || !name) return res.status(400).json({ error: 'Thiếu thông tin cần thiết' })
  const existing = await User.findOne({ email: email.toLowerCase().trim() })
  if (existing) return res.status(409).json({ error: 'Email đã được sử dụng' })
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ email: email.toLowerCase().trim(), passwordHash, displayName: name, role: 'learner' })
  // Chỉ trả về displayName, email, role và rank
  const data = { id: String(user._id), displayName: user.displayName, email: user.email, role: user.role, rank: user.rank }
  const token = signToken(data)
  res.cookie(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax' })
  res.json({ user: data })
}

export async function login(req, res) {
  const { email, password, remember } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Thiếu thông tin đăng nhập' })
  const user = await User.findOne({ email: email.toLowerCase().trim() })
  if (!user) return res.status(401).json({ error: 'Thông tin đăng nhập không hợp lệ' })
  const ok = user.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false
  if (!ok) return res.status(401).json({ error: 'Thông tin đăng nhập không hợp lệ' })
  const data = { id: String(user._id), displayName: user.displayName, email: user.email, role: user.role, rank: user.rank }
  const token = signToken(data)
  const cookieOptions = { httpOnly: true, sameSite: 'lax' }
  if (remember) cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days
  res.cookie(COOKIE_NAME, token, cookieOptions)
  res.json({ user: data })
}

export async function me(req, res) {
  // authMiddleware attaches req.user
  if (!req.user) return res.status(401).json({ error: 'Không được xác thực' })
  const { _id, displayName, email, role, rank } = req.user
  res.json({ user: { id: String(_id), displayName, email, role, rank } })
}

export async function logout(req, res) {
  res.clearCookie(COOKIE_NAME)
  res.json({ ok: true })
}

export async function forgotPassword(req, res) {
  // Feature not implemented — inform client to show popup
  res.status(501).json({ notImplemented: true, message: 'Quên mật khẩu chưa được triển khai' })
}

export async function googleAuth(req, res) {
  // Placeholder for Google OAuth integration
  res.status(501).json({ notImplemented: true, message: 'Xác thực Google chưa được triển khai' })
}

export async function changePassword(req, res) {
  const userId = String(req.user._id)
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Thiếu thông tin cần thiết' })
  const user = await User.findById(userId)
  if (!user) return res.status(404).json({ error: 'Người dùng không tồn tại' })
  if (!user.passwordHash) return res.status(400).json({ error: 'Không cho phép thay đổi mật khẩu cho tài khoản này' })
  const ok = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Mật khẩu hiện tại không đúng' })
  const newHash = await bcrypt.hash(newPassword, 10)
  user.passwordHash = newHash
  await user.save()
  res.json({ ok: true })
}

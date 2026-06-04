import User from '../models/User.js'
import ProfileService from '../services/profileService.js'
import { getRecentActivities } from '../services/recentActivityService.js'
import fs from 'fs'
import path from 'path'

export async function getProfile(req, res) {
    const { userId } = req.params
    const user = await User.findById(userId).select('-password')
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' })
    // Lấy thêm thông tin topic đã tham gia và đã tạo 
    const [topicsParticipated, topicsCreated] = [(await ProfileService.fetchTopicsParticipated(userId)).length, (await ProfileService.fetchTopicsCreated(userId)).length]
    
    // Chuyển subbmissions và liked thành số lượng
    const submissionsCount = Array.isArray(user.summary?.submissions) ? user.summary.submissions.length : 0
    const likedCount = Array.isArray(user.summary?.liked) ? user.summary.liked.length : 0

    // Tạo summary mới với thông tin đã chuyển đổi
    const summary = {
        topicsParticipated,
        topicsCreated,
        submissions: submissionsCount,
        likesReceived: user.summary?.likesReceived || 0,
        liked: likedCount,
    }

    // Trả về profile với summary đã chuyển đổi
    res.json({ profile: { ...user.toObject(), summary } })
}

export async function getSelfProfile(req, res) {
    const userId = String(req.user._id)
    const user = await User.findById(userId).select('-password')
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' })
    // Lấy thêm thông tin topic đã tham gia và đã tạo và bookmarks
    const topicsParticipated = await ProfileService.fetchTopicsParticipated(userId)
    const topicsCreated = await ProfileService.fetchTopicsCreated(userId)
    const bookmarks = await ProfileService.fetchBookmarks(userId)

    // Lấy thông tin hoạt động gần đây
    const recentActivity = await getRecentActivities(userId)
    res.json({ profile: { ...user.toObject(), summary: { ...user.summary, topicsParticipated, topicsCreated, bookmarks }, recentActivity } })
}

export async function updateProfile(req, res) {
    // chỉ cho phép update displayName, bio
    const userId = String(req.params.userId)
    const { displayName, bio } = req.body || {}
    if (!displayName) return res.status(400).json({ error: 'displayName is required' })
    if (!bio) return res.status(400).json({ error: 'bio is required' })

    const updatedUser = await User.findByIdAndUpdate(userId, { displayName, bio }, { new: true }).select('-password')
    if (!updatedUser) return res.status(404).json({ error: 'Không tìm thấy người dùng' })

    res.json({ profile: updatedUser })
}

export async function updateAvatar(req, res) {
    const userId = String(req.params.userId)
    
    if (!req.file) return res.status(400).json({ error: 'Không tải lên được ảnh' })

    // Chuyển ảnh từ thư mục tạm sang thư mục chính, ghi đè nếu đã có ảnh cũ
    const avatarDir = path.join(process.cwd(), 'uploads/avatars/')
    const finalPath = path.join(avatarDir, `${userId}${path.extname(req.file.originalname)}`)
    
    // Kiểm tra và tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(avatarDir)) {
        fs.mkdirSync(avatarDir, { recursive: true })
    }

    // Di chuyển ảnh từ thư mục tạm sang thư mục chính
    fs.renameSync(path.join(avatarDir, `temp`, req.file.filename), finalPath)

    res.json({ success: "Ảnh đại diện đã được cập nhật" })
}
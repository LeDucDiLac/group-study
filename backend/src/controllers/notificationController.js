import Notification from '../models/Notification.js'
import User from '../models/User.js'
import NotificationService from '../services/notificationService.js'

export async function getNotifications(req, res) {
    const userId = String(req.user._id)
    try {
        const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 }).lean()
        res.json(notifications)
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi lấy thông báo' })
    }
}

export async function markAllRead(req, res) {
    const userId = String(req.user._id)
    try {
        await Notification.updateMany({ user: userId, read: false }, { read: true })
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi đánh dấu đã đọc' })
    }
}

export async function markAsRead(req, res) {
    const userId = String(req.user._id)
    const { notificationId } = req.body
    if (!notificationId) return res.status(400).json({ error: 'Thiếu mã thông báo' })
    try {
        const notification = await Notification.findOneAndUpdate({ _id: notificationId, user: userId }, { read: true }, { new: true })  
        if (!notification) return res.status(404).json({ error: 'Không tìm thấy thông báo' })
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi đánh dấu đã đọc' })
    }
}

export async function createSystemNotification(req, res) {
    const actorId = String(req.user._id)
    const role = req.user.role

    if (role !== 'admin') {
        return res.status(403).json({ error: 'Chỉ admin mới được tạo thông báo hệ thống' })
    }

    const { userId, title, content } = req.body
    if (!userId || !title || !content) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc (userId, title, content)' })
    }

    try {
        const notification = await NotificationService.createSystemNotification({ userId, actorId, title, content })
        res.json({ ok: true })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
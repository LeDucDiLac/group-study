import User from '../models/User.js'

/**
 * Thêm một hoạt động gần đây cho user, tự động xóa hoạt động cũ nếu vượt quá 3.
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @param {Object} params - { title, target }
 * @returns {Promise<void>}
 */
export async function addRecentActivity(userId, { title, target }) {
  if (!userId || !title) throw new Error('Thiếu thông tin')
  const user = await User.findById(userId)
  if (!user) throw new Error('User không tồn tại')

  user.recentActivities.unshift({
    title,
    target,
    createdAt: new Date(),
    _id: undefined // để mongoose tự tạo
  })
  if (user.recentActivities.length > 3) {
    user.recentActivities = user.recentActivities.slice(0, 3)
  }
  await user.save()
}

/**
 * Lấy danh sách hoạt động gần đây của user
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @returns {Promise<Array>}
 */
export async function getRecentActivities(userId) {
  const user = await User.findById(userId)
  return user ? user.recentActivities : []
}

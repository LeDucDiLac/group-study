import { apiRequest } from './api';
import type { Notification } from '@/types/domain';

function toNotification(row: any): Notification {
  return {
    id: String(row._id || row.id),
    type: row.type || 'system',
    title: String(row.title || ''),
    description: String(row.description || row.content || ''),
    actionLabel: String(row.actionLabel || row.action_label || 'Xem'),
    actionTo: String(row.actionTo || row.action_to || '/'),
    read: Boolean(row.isRead || row.read),
    createdAt: String(row.createdAt || row.created_at || new Date().toISOString()),
  };
}

export const notificationService = {
  /** GET /api/notifications */
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const res = await apiRequest<any[]>('/api/notifications');
      return res.map(toNotification);
    } catch {
      return [];
    }
  },

  /** GET /api/notifications + mark-as-read — lấy chi tiết 1 notification */
  getNotification: async (id: string): Promise<Notification> => {
    await notificationService.markAsRead(id);
    const notifications = await notificationService.getNotifications();
    const found = notifications.find(n => n.id === id);
    if (!found) throw new Error('NOTIFICATION_NOT_FOUND');
    return found;
  },

  /** POST /api/notifications/mark-as-read */
  markAsRead: async (notificationId: string): Promise<void> => {
    await apiRequest<void>('/api/notifications/mark-as-read', {
      method: 'POST',
      body: JSON.stringify({ notificationId }),
    });
  },

  /** POST /api/notifications/mark-all-read */
  markAllRead: async (): Promise<void> => {
    await apiRequest<void>('/api/notifications/mark-all-read', { method: 'POST' });
  },
};

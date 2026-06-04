import { apiRequest } from './api';
import type { Notification, NotificationTarget } from '@/types/domain';

function toNotification(row: any): Notification {
  return {
    id: String(row._id || row.id),
    type: row.type || 'system',
    title: String(row.title || ''),
    description: String(row.content || row.description || ''),
    target: row.target as NotificationTarget | undefined,
    read: Boolean(row.isRead || row.read),
    createdAt: String(row.createdAt || new Date().toISOString()),
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

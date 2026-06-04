import { apiRequest } from './api';

export interface BookmarkItem {
  _id: string;
  type: string;
  target: { submissionId?: string; topicId?: string };
  createdAt: string;
}

export const bookmarkService = {
  /** GET /api/bookmarks */
  getBookmarks: async (): Promise<BookmarkItem[]> => {
    try {
      const res = await apiRequest<{ items: BookmarkItem[] }>('/api/bookmarks');
      return res.items || [];
    } catch {
      return [];
    }
  },

  /** POST /api/bookmarks */
  createBookmark: async (submissionId: string, topicId?: string): Promise<BookmarkItem> => {
    return apiRequest<BookmarkItem>('/api/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ target: { submissionId, topicId }, type: 'submission' }),
    });
  },

  /** DELETE /api/bookmarks/:id */
  deleteBookmark: async (id: string): Promise<{ ok: boolean }> => {
    return apiRequest<{ ok: boolean }>(`/api/bookmarks/${id}`, { method: 'DELETE' });
  },

  /** Toggle helper — kiểm tra trạng thái rồi tạo/xóa bookmark */
  toggleBookmark: async (submissionId: string, topicId?: string): Promise<{ submissionId: string; saved: boolean }> => {
    try {
      const items = await bookmarkService.getBookmarks();
      const existing = items.find(item => item.target.submissionId === submissionId);
      if (existing) {
        await bookmarkService.deleteBookmark(existing._id);
        return { submissionId, saved: false };
      } else {
        await bookmarkService.createBookmark(submissionId, topicId);
        return { submissionId, saved: true };
      }
    } catch {
      return { submissionId, saved: false };
    }
  },
};

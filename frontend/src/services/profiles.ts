import { apiRequest } from './api';
import type { User, ProfileStats } from '@/types/domain';

// In-memory cache dùng làm fallback khi dữ liệu chưa load xong
const userCache = new Map<string, User>();

export const userFallback = (id: string): User => {
  if (id?.startsWith('anonymous-')) {
    return { id, displayName: 'Người học ẩn danh', email: '', role: 'learner', rank: 0 };
  }
  return userCache.get(id) ?? { id, displayName: 'Người học', email: '', role: 'learner', rank: 0 };
};

function toUser(row: any): User {
  return {
    id: String(row._id || row.id),
    displayName: String(row.displayName || 'Người học'),
    email: String(row.email || ''),
    role: row.role === 'admin' ? 'admin' : 'learner',
    rank: Number(row.rank ?? 0),
  };
}

export const profileService = {
  /** GET /api/profiles/:userId */
  getProfile: async (userId: string): Promise<User> => {
    const res = await apiRequest<{ profile: any }>(`/api/profiles/${userId}`);
    const user = toUser(res.profile);
    userCache.set(user.id, user);
    return user;
  },

  /** GET /api/profiles/:userId — lấy thống kê */
  getProfileStats: async (userId: string): Promise<ProfileStats> => {
    try {
      const res = await apiRequest<{ profile: any }>(`/api/profiles/${userId}`);
      const summary = res.profile?.summary || {};
      return {
        joinedTopicCount: summary.topicsParticipated || 0,
        submissionCount: summary.submissions || 0,
        createdTopicCount: summary.topicsCreated || 0,
        bookmarkCount: summary.bookmarks?.length || 0,
        submissionLikeCount: summary.likesReceived || 0,
        answerCount: summary.answerCount || 0,
        answerLikeCount: summary.answerLikeCount || 0,
      };
    } catch {
      return {
        joinedTopicCount: 0,
        submissionCount: 0,
        createdTopicCount: 0,
        bookmarkCount: 0,
        submissionLikeCount: 0,
        answerCount: 0,
        answerLikeCount: 0,
      };
    }
  },

  /** GET /api/profiles/self */
  getSelfProfile: async (): Promise<User> => {
    const res = await apiRequest<{ profile: any }>('/api/profiles/self');
    const user = toUser(res.profile);
    userCache.set(user.id, user);
    return user;
  },

  /** PUT /api/profiles/:userId */
  updateProfile: async (userId: string, payload: Partial<User>): Promise<User> => {
    const res = await apiRequest<{ profile: any }>(`/api/profiles/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return toUser(res.profile);
  },

  /** POST /api/profiles/:userId/avatar */
  updateAvatar: async (userId: string, file: File): Promise<{ avatarUrl: string }> => {
    const form = new FormData();
    form.append('avatar', file);
    const response = await fetch(`/api/profiles/${userId}/avatar`, {
      method: 'POST',
      body: form,
      credentials: 'include',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Upload ảnh đại diện thất bại');
    }
    return response.json();
  },
};

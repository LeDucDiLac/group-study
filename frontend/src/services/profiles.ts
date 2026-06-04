import { apiRequest } from './api';
import type { User, ProfileStats, SelfProfile, PublicProfile } from '@/types/domain';

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

  /** GET /api/profiles/:userId — lấy public profile đầy đủ (counts + bio) */
  getPublicProfile: async (userId: string): Promise<PublicProfile> => {
    const res = await apiRequest<{ profile: any }>(`/api/profiles/${userId}`);
    const p = res.profile;
    const user = toUser(p);
    userCache.set(user.id, user);
    const summary = p.summary || {};
    return {
      ...user,
      bio: p.bio || '',
      summary: {
        topicsParticipated: Number(summary.topicsParticipated || 0),
        topicsCreated: Number(summary.topicsCreated || 0),
        submissions: Number(summary.submissions || 0),
        likesReceived: Number(summary.likesReceived || 0),
        liked: Number(summary.liked || 0),
      },
    };
  },

  /** GET /api/profiles/self — lấy thông tin đầy đủ của người dùng hiện tại */
  getSelfProfile: async (): Promise<SelfProfile> => {
    const res = await apiRequest<{ profile: any }>('/api/profiles/self');
    const p = res.profile;
    const user = toUser(p);
    userCache.set(user.id, user);
    return {
      ...user,
      bio: p.bio || '',
      summary: {
        topicsParticipated: p.summary?.topicsParticipated || [],
        topicsCreated: p.summary?.topicsCreated || [],
        bookmarks: p.summary?.bookmarks || [],
        likesReceived: p.summary?.likesReceived || 0,
        liked: p.summary?.liked || [],
        submissions: p.summary?.submissions || [],
      },
      recentActivity: p.recentActivity || [],
    };
  },

  /** Lấy thống kê từ getSelfProfile (dùng /self để lấy đầy đủ) */
  getProfileStats: async (): Promise<ProfileStats> => {
    try {
      const res = await apiRequest<{ profile: any }>('/api/profiles/self');
      const summary = res.profile?.summary || {};
      return {
        joinedTopicCount: Array.isArray(summary.topicsParticipated) ? summary.topicsParticipated.length : (summary.topicsParticipated || 0),
        submissionCount: Array.isArray(summary.submissions) ? summary.submissions.length : (summary.submissions || 0),
        createdTopicCount: Array.isArray(summary.topicsCreated) ? summary.topicsCreated.length : (summary.topicsCreated || 0),
        bookmarkCount: Array.isArray(summary.bookmarks) ? summary.bookmarks.length : 0,
        submissionLikeCount: summary.likesReceived || 0,
        likedCount: Array.isArray(summary.liked) ? summary.liked.length : (summary.liked || 0),
      };
    } catch {
      return { joinedTopicCount: 0, submissionCount: 0, createdTopicCount: 0, bookmarkCount: 0, submissionLikeCount: 0, likedCount: 0 };
    }
  },

  /** PUT /api/profiles/:userId */
  updateProfile: async (userId: string, payload: { displayName: string; bio: string }): Promise<User> => {
    const res = await apiRequest<{ profile: any }>(`/api/profiles/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return toUser(res.profile);
  },

  /** POST /api/profiles/:userId/avatar */
  updateAvatar: async (userId: string, file: File): Promise<void> => {
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
  },
};

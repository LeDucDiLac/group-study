import { apiRequest } from './api';
import type { Topic, TopicFilters } from '@/types/domain';

// In-memory cache dùng làm fallback khi dữ liệu chưa load xong
const topicCache = new Map<string, Topic>();

export const topicFallback = (id: string): Topic =>
  topicCache.get(id) ?? ({
    _id: id,
    title: 'Chủ đề học tập',
    description: 'Đang tải thông tin chủ đề...',
    category: 'Học tập',
    tags: [],
    resources: [],
    status: 'Đang mở',
    createdBy: '',
    proposalReason: '',
    approvedBy: '',
    windowHours: 48,
    submissionCount: 0,
    likeCount: 0,
    dislikeCount: 0,
    liked: 0,
    participationCount: 0,
    participationStartTime: null,
    mySubmission: null,
    createdAt: new Date().toISOString(),
  } as Topic);

export const topicService = {
  /** GET /api/topics */
  getTopics: async (filters: TopicFilters = {}): Promise<Topic[]> => {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.query?.trim()) params.append('query', filters.query.trim());
    const topics = await apiRequest<Topic[]>(`/api/topics?${params.toString()}`);
    topics.forEach(t => topicCache.set(t._id, t));
    return topics;
  },

  /** GET /api/topics/:id */
  getTopicById: async (id: string): Promise<Topic> => {
    const topic = await apiRequest<Topic>(`/api/topics/${id}`);
    topicCache.set(topic._id, topic);
    return topic;
  },

  /** GET /api/topics/unapproved */
  getUnapprovedTopics: async (): Promise<Topic[]> => {
    return apiRequest<Topic[]>('/api/topics/unapproved');
  },

  /** POST /api/topics */
  createTopic: async (payload: Partial<Topic>): Promise<Topic> => {
    return apiRequest<Topic>('/api/topics', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** PATCH /api/topics/:id */
  updateTopic: async (id: string, payload: Partial<Topic>): Promise<{ ok: boolean }> => {
    return apiRequest<{ ok: boolean }>(`/api/topics/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  /** POST /api/topics/:id/approve */
  approveTopic: async (id: string): Promise<Topic> => {
    return apiRequest<Topic>(`/api/topics/${id}/approve`, { method: 'POST' });
  },

  /** POST /api/topics/:id/reject */
  rejectTopic: async (id: string, payload: { rejectionReason: string }): Promise<Topic> => {
    return apiRequest<Topic>(`/api/topics/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** POST /api/topics/:id/mark-completed */
  markCompleted: async (id: string): Promise<{ ok: boolean }> => {
    return apiRequest<{ ok: boolean }>(`/api/topics/${id}/mark-completed`, { method: 'POST' });
  },

  /** POST /api/topics/:id/participate */
  participate: async (id: string): Promise<{ ok: boolean; startedAt: string }> => {
    return apiRequest(`/api/topics/${id}/participate`, { method: 'POST' });
  },

  /** GET /api/topics/participated — chỉ các topic user đã tham gia */
  getParticipatedTopics: async (): Promise<Topic[]> => {
    const topics = await apiRequest<Topic[]>('/api/topics/participated');
    topics.forEach(t => topicCache.set(t._id, t));
    return topics;
  },

  /** GET /api/topics/my-topics — các topic user đã tạo */
  getMyTopics: async (): Promise<Topic[]> => {
    const topics = await apiRequest<Topic[]>('/api/topics/my-topics');
    topics.forEach(t => topicCache.set(t._id, t));
    return topics;
  },
};

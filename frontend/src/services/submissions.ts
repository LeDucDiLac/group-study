import { apiRequest } from './api';
import type { ResourceFile, Submission } from '@/types/domain';

// ─── Draft (localStorage, không có route backend) ───────────────────────────

export interface LearningDraft {
  understood: string;
  notUnderstood: string;
  isAnonymous: boolean;
  timeSpentSeconds: number;
  updatedAt?: string;
}

export const draftService = {
  getDraft: (topicId: string): LearningDraft | null => {
    try {
      const data = localStorage.getItem(`draft-${topicId}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveDraft: (topicId: string, draft: LearningDraft): LearningDraft => {
    try {
      const updated = { ...draft, updatedAt: new Date().toISOString() };
      localStorage.setItem(`draft-${topicId}`, JSON.stringify(updated));
      return updated;
    } catch {
      return draft;
    }
  },

  clearDraft: (topicId: string): void => {
    try {
      localStorage.removeItem(`draft-${topicId}`);
    } catch {
      // ignore
    }
  },
};

// ─── Submissions API ─────────────────────────────────────────────────────────

export const submissionService = {
  /** POST /api/submissions */
  submit: async (
    topicId: string,
    payload: {
      understood: string;
      notUnderstood: string;
      isAnonymous: boolean;
      timeSpentSeconds?: number;
      resources?: ResourceFile[];
    },
  ): Promise<Submission> => {
    return apiRequest<Submission>('/api/submissions', {
      method: 'POST',
      body: JSON.stringify({
        topicId,
        understood: payload.understood,
        notUnderstood: payload.notUnderstood,
        isAnonymous: payload.isAnonymous,
        resources: (payload.resources ?? []).map(f => ({ type: f.type, url: f.url, label: f.label })),
      }),
    });
  },

  /** GET /api/submissions/topic/:topicId */
  getSubmissionsByTopic: async (topicId: string): Promise<Submission[]> => {
    const res = await apiRequest<{ items: Submission[] }>(`/api/submissions/topic/${topicId}`);
    return res.items || [];
  },

  /** GET /api/submissions/mine */
  getMySubmissions: async (): Promise<Array<{ topicId: string; topicTitle: string; submission: Submission }>> => {
    const res = await apiRequest<{ items: Array<{ topicId: string; topicTitle: string; submission: Submission }> }>('/api/submissions/mine');
    return res.items || [];
  },

  /** POST /api/submissions/peek/:topicId */
  peekSubmissions: async (topicId: string): Promise<Submission[]> => {
    const res = await apiRequest<{ items: Submission[] }>(`/api/submissions/peek/${topicId}`, { method: 'POST' });
    return res.items || [];
  },

  /** GET /api/submissions/unapproved — admin only */
  getUnapprovedSubmissions: async (): Promise<Array<{ topicId: string; topicTitle: string; submission: Submission }>> => {
    const res = await apiRequest<{ items: Array<{ topicId: string; topicTitle: string; submission: Submission }> }>('/api/submissions/unapproved');
    return res.items || [];
  },

  /** POST /api/submissions/approve/:submissionId — admin only */
  approveSubmission: async (submissionId: string): Promise<{ ok: boolean }> => {
    return apiRequest<{ ok: boolean }>(`/api/submissions/approve/${submissionId}`, { method: 'POST' });
  },

  /** POST /api/submissions/reject/:submissionId — admin only */
  rejectSubmission: async (submissionId: string, reason: string): Promise<{ ok: boolean }> => {
    return apiRequest<{ ok: boolean }>(`/api/submissions/reject/${submissionId}`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  /** POST /api/reactions/like hoặc /cancel cho submission */
  toggleLike: async (submissionId: string, alreadyLiked: boolean): Promise<void> => {
    const endpoint = alreadyLiked ? '/api/reactions/cancel' : '/api/reactions/like';
    await apiRequest(endpoint, { method: 'POST', body: JSON.stringify({ id: submissionId }) });
  },

  /** POST /api/reactions/dislike hoặc /cancel cho submission */
  toggleDislike: async (submissionId: string, alreadyDisliked: boolean): Promise<void> => {
    const endpoint = alreadyDisliked ? '/api/reactions/cancel' : '/api/reactions/dislike';
    await apiRequest(endpoint, { method: 'POST', body: JSON.stringify({ id: submissionId }) });
  },
};

import { apiRequest } from './api';

type ReactionTarget = {
  /** ID của topic, submission, hoặc comment */
  id: string;
  /** Nếu react cho comment: cần thêm topicId, submissionId, và optional subCommentId */
  topicId?: string;
  submissionId?: string;
  commentId?: string;
  subCommentId?: string;
};

export const reactionService = {
  /** POST /api/reactions/like */
  like: async (target: ReactionTarget): Promise<void> => {
    await apiRequest('/api/reactions/like', {
      method: 'POST',
      body: JSON.stringify(target),
    });
  },

  /** POST /api/reactions/dislike */
  dislike: async (target: ReactionTarget): Promise<void> => {
    await apiRequest('/api/reactions/dislike', {
      method: 'POST',
      body: JSON.stringify(target),
    });
  },

  /** POST /api/reactions/cancel */
  cancel: async (target: ReactionTarget): Promise<void> => {
    await apiRequest('/api/reactions/cancel', {
      method: 'POST',
      body: JSON.stringify(target),
    });
  },
};

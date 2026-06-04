import { apiRequest } from './api';
import type { Comment } from '@/types/domain';

export function flattenComments(dbComments: any[], parentId?: string, submissionId?: string): Comment[] {
  let flat: Comment[] = [];
  for (const c of dbComments || []) {
    const commentId = String(c._id || c.id);
    flat.push({
      id: commentId,
      submissionId: submissionId || '',
      user: {
        id: String(c.user?._id || c.user?.id || c.userId || c.createdBy || ''),
        displayName: c.user?.displayName || 'Người học',
        rank: c.user?.rank ?? 0,
      },
      isAnonymous: Boolean(c.isAnonymous),
      content: c.content,
      likeCount: c.reactions?.like?.length || 0,
      dislikeCount: c.reactions?.dislike?.length || 0,
      createdAt: c.createdAt || new Date().toISOString(),
      parentId,
    });
    const nested = c.subComments || [];
    if (nested.length > 0) {
      flat = flat.concat(flattenComments(nested, commentId, submissionId));
    }
  }
  return flat;
}

export const commentService = {
  /**
   * GET /api/submissions/:submissionId/comments
   * Lấy comments của một submission.
   */
  getComments: async (submissionId: string, topicId?: string): Promise<Comment[]> => {
    if (!submissionId || submissionId === 's1') return [];
    try {
      const res = await apiRequest<{ comments: any[] }>(`/api/submissions/${submissionId}/comments`);
      return flattenComments(res.comments || [], undefined, submissionId);
    } catch {
      return [];
    }
  },

  /** POST /api/comments */
  createComment: async (
    submissionId: string,
    content: string,
    topicId?: string,
    parentId?: string,
    isAnonymous = false,
  ): Promise<Comment> => {
    const res = await apiRequest<{ comment: any }>('/api/comments', {
      method: 'POST',
      body: JSON.stringify({
        topicId,
        submissionId,
        content,
        isAnonymous,
        ...(parentId ? { commentId: parentId } : {}),
      }),
    });
    const c = res.comment;
    return {
      id: String(c._id || c.id),
      submissionId,
      user: {
        id: String(c.user?._id || c.user?.id || c.userId || c.createdBy || ''),
        displayName: c.user?.displayName || 'Người học',
        rank: c.user?.rank ?? 0,
      },
      isAnonymous,
      content: c.content,
      likeCount: 0,
      dislikeCount: 0,
      createdAt: c.createdAt || new Date().toISOString(),
      parentId,
    };
  },

  /** Alias cho createComment với parentId — POST /api/comments */
  createReply: async (
    submissionId: string,
    parentId: string,
    content: string,
    topicId?: string,
    isAnonymous = false,
  ): Promise<Comment> => {
    return commentService.createComment(submissionId, content, topicId, parentId, isAnonymous);
  },

  /** POST /api/reactions/like hoặc /cancel cho comment */
  toggleLike: async (
    commentId: string,
    alreadyLiked: boolean,
    submissionId?: string,
    topicId?: string,
    subCommentId?: string,
  ): Promise<void> => {
    const body = JSON.stringify({ id: commentId, submissionId, topicId, subCommentId });
    const endpoint = alreadyLiked ? '/api/reactions/cancel' : '/api/reactions/like';
    await apiRequest(endpoint, { method: 'POST', body });
  },

  /** POST /api/reactions/dislike hoặc /cancel cho comment */
  toggleDislike: async (
    commentId: string,
    alreadyDisliked: boolean,
    submissionId?: string,
    topicId?: string,
    subCommentId?: string,
  ): Promise<void> => {
    const body = JSON.stringify({ id: commentId, submissionId, topicId, subCommentId });
    const endpoint = alreadyDisliked ? '/api/reactions/cancel' : '/api/reactions/dislike';
    await apiRequest(endpoint, { method: 'POST', body });
  },
};

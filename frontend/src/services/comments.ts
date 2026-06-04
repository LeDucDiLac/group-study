import { apiRequest } from './api';
import type { Comment } from '@/types/domain';

export function flattenComments(dbComments: any[], parentId?: string, submissionId?: string): Comment[] {
  let flat: Comment[] = [];
  for (const c of dbComments || []) {
    const commentId = String(c._id || c.id);
    flat.push({
      id: commentId,
      submissionId: submissionId || '',
      userId: String(c.userId || c.createdBy || ''),
      content: c.content,
      likeCount: c.reactions?.like?.length || 0,
      createdAt: c.createdAt || new Date().toISOString(),
      parentId,
    });
    // Schema dùng 'subcomments' (lowercase)
    const nested = c.subcomments || c.subComments || [];
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
  ): Promise<Comment> => {
    const res = await apiRequest<{ comment: any }>('/api/comments', {
      method: 'POST',
      body: JSON.stringify({
        topicId,
        submissionId,
        content,
        ...(parentId ? { commentId: parentId } : {}),
      }),
    });
    const c = res.comment;
    return {
      id: String(c._id || c.id),
      submissionId,
      userId: String(c.userId || c.createdBy || ''),
      content: c.content,
      likeCount: 0,
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
  ): Promise<Comment> => {
    return commentService.createComment(submissionId, content, topicId, parentId);
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
};

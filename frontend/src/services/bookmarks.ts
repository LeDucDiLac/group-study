import { apiRequest } from './api';

export interface BookmarkTarget {
  topicId?: string;
  submissionId?: string;
  commentId?: string;
  subCommentId?: string;
}

export type BookmarkType = 'topic' | 'submission' | 'comment' | 'subcomment';

// Content shapes returned by the enriched listBookmarks endpoint
export interface BookmarkTopicContent {
  type: 'topic';
  topic: {
    _id: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    status: string;
    likeCount: number;
    dislikeCount: number;
    submissionCount: number;
    participationCount: number;
    createdBy: { _id?: string; displayName: string; rank?: number } | null;
  };
}

export interface BookmarkSubmissionContent {
  type: 'submission';
  topicTitle: string;
  topicId: string;
  submission: {
    _id: string;
    understood: string;
    notUnderstood: string;
    isAnonymous: boolean;
    likeCount: number;
    dislikeCount: number;
    commentCount: number;
    user: { id: string; displayName: string; rank: number } | null;
  };
}

export interface BookmarkCommentContent {
  type: 'comment' | 'subcomment';
  topicTitle: string;
  topicId: string;
  submissionId: string;
  commentId?: string;
  comment: {
    _id: string;
    content: string;
    isAnonymous: boolean;
    likeCount: number;
    user: { id: string; displayName: string; rank: number } | null;
    createdAt: string;
  };
}

export type BookmarkContent = BookmarkTopicContent | BookmarkSubmissionContent | BookmarkCommentContent;

export interface BookmarkItem {
  _id: string;
  type: BookmarkType;
  target: BookmarkTarget;
  note?: string;
  createdAt: string;
  content?: BookmarkContent;
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

  /**
   * POST /api/bookmarks
   * Chỉ gửi targetId (id của topic/submission/comment/subComment).
   * Backend dùng findTargetById để resolve target đầy đủ.
   */
  createBookmark: async (targetId: string, note?: string): Promise<BookmarkItem> => {
    const res = await apiRequest<{ item: BookmarkItem }>('/api/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ targetId, note }),
    });
    return res.item;
  },

  /** DELETE /api/bookmarks/:id */
  deleteBookmark: async (id: string): Promise<{ ok: boolean }> => {
    return apiRequest<{ ok: boolean }>(`/api/bookmarks/${id}`, { method: 'DELETE' });
  },

  /**
   * Toggle bookmark theo targetId.
   * Nếu đã có bookmark với submissionId/commentId/subCommentId trùng thì xóa, ngược lại tạo mới.
   */
  toggleBookmark: async (
    targetId: string,
    existingBookmarks: BookmarkItem[],
  ): Promise<{ saved: boolean; item?: BookmarkItem }> => {
    // Tìm bookmark đã tồn tại dựa trên targetId khớp với bất kỳ target field nào
    const existing = existingBookmarks.find(b =>
      String(b.target.subCommentId) === targetId ||
      String(b.target.commentId) === targetId ||
      String(b.target.submissionId) === targetId ||
      String(b.target.topicId) === targetId
    );
    if (existing) {
      await bookmarkService.deleteBookmark(existing._id);
      return { saved: false };
    } else {
      const item = await bookmarkService.createBookmark(targetId);
      return { saved: true, item };
    }
  },

  /** Kiểm tra targetId đã được bookmark chưa */
  isBookmarked: (bookmarks: BookmarkItem[], targetId: string): boolean => {
    return bookmarks.some(b =>
      String(b.target.subCommentId) === targetId ||
      String(b.target.commentId) === targetId ||
      String(b.target.submissionId) === targetId ||
      String(b.target.topicId) === targetId
    );
  },

  /** Lấy bookmark id của targetId */
  getBookmarkId: (bookmarks: BookmarkItem[], targetId: string): string | undefined => {
    return bookmarks.find(b =>
      String(b.target.subCommentId) === targetId ||
      String(b.target.commentId) === targetId ||
      String(b.target.submissionId) === targetId ||
      String(b.target.topicId) === targetId
    )?._id;
  },
};

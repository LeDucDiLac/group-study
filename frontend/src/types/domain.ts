export type UserRole = 'learner' | 'admin'
export type TopicStatus = 'Đang mở' | 'Chưa duyệt' | 'Bị từ chối' | 'Đã hoàn thành'
export type NotificationType = 'comment' | 'deadline' | 'approved' | 'rejected' | 'closed' | 'system'

export interface User {
  id: string
  displayName: string
  email: string
  role: UserRole
  rank: number
}

export interface ProfileStats {
  joinedTopicCount: number
  submissionCount: number
  createdTopicCount: number
  bookmarkCount: number
  submissionLikeCount: number
  likedCount: number
}

export interface RecentActivity {
  _id: string
  title: string
  target?: {
    topicId?: string
    submissionId?: string
    commentId?: string
    subCommentId?: string
  }
  createdAt: string
}

export interface SelfProfile extends User {
  bio?: string
  summary: {
    topicsParticipated: { topicId: string }[]
    topicsCreated: { topicId: string }[]
    bookmarks: { topicId?: string; submissionId?: string; commentId?: string }[]
    likesReceived: number
    liked: { topicId: string; submissionId?: string; commentId?: string }[]
    submissions: { topicId: string; submissionId: string }[]
  }
  recentActivity: RecentActivity[]
}

export interface ResourceFile {
  label: string;
  type: 'link' | 'file' | 'pdf' | 'image' | 'markdown' | 'txt' | 'docx';
  url: string;
  size?: string;
}

export interface Topic {
  _id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  resources: ResourceFile[];
  status: TopicStatus;
  createdBy: string | { _id: string; displayName: string; rank?: number };
  approvedBy: string;
  rejectionReason?: string;
  proposalReason: string;
  windowHours: number;
  submissionCount: number;
  likeCount: number;
  dislikeCount: number;
  liked: number;
  participationCount: number;
  participationStartTime: string | null;
  mySubmission: Submission | null;
  createdAt: string;
  closesAt?: string;
}

export interface Submission {
  _id: string
  user?: User
  isAnonymous: boolean
  understood: string
  notUnderstood: string
  resources: ResourceFile[]
  likeCount: number
  dislikeCount: number
  commentCount: number
  status: 'Chưa duyệt' | 'Đã duyệt' | 'Bị từ chối'
  createdAt: string
  saved: boolean
}

export interface Comment {
  id: string
  submissionId: string
  user: {
    id: string
    displayName: string
    rank: number
  }
  isAnonymous: boolean
  parentId?: string
  content: string
  likeCount: number
  dislikeCount: number
  createdAt: string
}

export interface NotificationTarget {
  topicId?: string
  submissionId?: string
  commentId?: string
  subCommentId?: string
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  description: string
  target?: NotificationTarget
  read: boolean
  createdAt: string
}

export interface Deadline {
  id: string
  topicId: string
  title: string
  dueAt: string
  status: 'submitted' | 'not_submitted' | 'expired'
}

export interface CommunityInsight {
  topicId: string
  understoodPoints: string[]
  unclearPoints: string[]
  commonQuestions: string[]
  submissionCount: number
}

export interface TopicFilters {
  query?: string
  category?: string
  status?: TopicStatus | 'all'
}

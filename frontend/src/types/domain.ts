export type UserRole = 'learner' | 'admin'
export type AccountStatus = 'active' | 'locked'
export type TopicStatus = 'open' | 'closed' | 'pending' | 'rejected'
export type NotificationType = 'comment' | 'deadline' | 'approved' | 'rejected' | 'closed'
export type BadgeLevel = 'newcomer' | 'helper' | 'mentor' | 'expert'

export interface BadgeStats {
  answerCount: number
  answerLikeCount: number
  level: BadgeLevel
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: AccountStatus
  interests: string[]
  joinedTopicIds: string[]
  submissionIds: string[]
  createdTopicIds: string[]
  badgeStats: BadgeStats
}

export interface ProfileStats {
  joinedTopicCount: number
  submissionCount: number
  createdTopicCount: number
  bookmarkCount: number
  submissionLikeCount: number
  answerCount: number
  answerLikeCount: number
}

export interface ResourceFile {
  id: string
  name: string
  type: 'pdf' | 'image' | 'markdown' | 'txt' | 'docx' | 'link'
  url: string
  size?: string
}

export interface Topic {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  prerequisites: string
  resources: ResourceFile[]
  status: TopicStatus
  createdBy: string
  proposedBy: string
  proposedByName?: string
  proposedByEmail?: string
  approvedBy?: string
  approvedByName?: string
  rejectionReason?: string
  revisionSuggestions?: string[]
  proposalReason?: string
  updatedAt?: string
  submittedAt?: string
  reviewedAt?: string
  reviewedBy?: string
  reviewedByName?: string
  reviewedByEmail?: string
  rejectedAt?: string
  resubmittedAt?: string
  commentCount?: number
  userSubmissionStatus?: 'not_started' | 'in_progress' | 'submitted' | 'locked'
  canEditProposal?: boolean
  canStartLearning?: boolean
  canResubmit?: boolean
  windowHours: number
  windowLabel: string
  submissionCount: number
  likeCount: number
  createdAt: string
  closesAt?: string
}

export interface Submission {
  id: string
  topicId: string
  userId: string
  isAnonymous: boolean
  understood: string
  notUnderstood: string
  files: ResourceFile[]
  wordCount: number
  timeSpentMinutes: number
  likeCount: number
  commentCount: number
  isLocked: boolean
  createdAt: string
  saved?: boolean
}

export interface Comment {
  id: string
  submissionId: string
  userId: string
  parentId?: string
  content: string
  likeCount: number
  createdAt: string
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  description: string
  actionLabel: string
  actionTo: string
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

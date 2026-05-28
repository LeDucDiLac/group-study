import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import {
  comments as mockComments,
  currentAdminId,
  currentUserId,
  deadlines as mockDeadlines,
  insights as mockInsights,
  notifications as mockNotifications,
  submissions as mockSubmissions,
  topics as mockTopics,
  users as mockUsers,
} from '@/data/mock/database'
import type { BadgeLevel, Comment, CommunityInsight, Deadline, Notification, ProfileStats, ResourceFile, Submission, Topic, TopicFilters, User } from '@/types/domain'

type Row = Record<string, any>
type TopicProposalPayload = Partial<Topic> & { resourceFiles?: File[] }
export type LearningDraft = {
  understood: string
  notUnderstood: string
  isAnonymous: boolean
  timeSpentSeconds: number
  updatedAt?: string
}

const userCache = new Map<string, User>(mockUsers.map((user) => [user.id, user]))
const topicCache = new Map<string, Topic>(mockTopics.map((topic) => [topic.id, topic]))
const submissionCache = new Map<string, Submission>(mockSubmissions.map((submission) => [submission.id, submission]))

const anonymousUser: User = {
  id: 'anonymous',
  name: 'Người học ẩn danh',
  email: '',
  role: 'learner',
  status: 'active',
  interests: [],
  joinedTopicIds: [],
  submissionIds: [],
  createdTopicIds: [],
  badgeStats: { answerCount: 0, answerLikeCount: 0, level: 'newcomer' },
}

function shouldUseSupabase() {
  return isSupabaseConfigured
}

async function fallbackOnReadError<T>(operation: Promise<T>, fallback: T): Promise<T> {
  if (!shouldUseSupabase()) return fallback
  try {
    return await operation
  } catch (error) {
    console.warn('[TimeBoxed API] Supabase read failed:', error)
    throw error
  }
}

function requireData<T>(data: T | null, error: unknown): T {
  if (error) throw error
  if (data === null) throw new Error('No data returned')
  return data
}

function sizeToReadable(size?: number | null) {
  if (!size) return undefined
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))}KB`
  return `${(size / 1024 / 1024).toFixed(1)}MB`
}

function toResource(row: Row): ResourceFile {
  return {
    id: String(row.id),
    name: String(row.name),
    type: row.type ?? 'link',
    url: row.url || row.storage_path || '#',
    size: typeof row.size_bytes === 'number' ? sizeToReadable(row.size_bytes) : row.size,
  }
}

function fileKind(file: File): ResourceFile['type'] {
  const name = file.name.toLowerCase()
  if (file.type.startsWith('image/')) return 'image'
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf'
  if (file.type === 'text/markdown' || name.endsWith('.md')) return 'markdown'
  if (file.type === 'text/plain' || name.endsWith('.txt')) return 'txt'
  if (name.endsWith('.docx')) return 'docx'
  return 'link'
}

function isAllowedSubmissionFile(file: File) {
  const allowed = ['pdf', 'image', 'markdown', 'txt', 'docx']
  return allowed.includes(fileKind(file)) && file.size <= 20 * 1024 * 1024
}

function safeStorageName(name: string) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'file'
}

function toBadgeLevel(value?: string): BadgeLevel {
  if (value === 'helper' || value === 'mentor' || value === 'expert') return value
  return 'newcomer'
}

function toUser(profile: Row, reputation?: Row | null, interests: string[] = []): User {
  const user: User = {
    id: String(profile.id),
    name: String(profile.display_name ?? profile.name ?? 'Người học'),
    email: String(profile.email ?? ''),
    role: profile.role === 'admin' ? 'admin' : 'learner',
    status: profile.status === 'locked' ? 'locked' : 'active',
    interests,
    joinedTopicIds: [],
    submissionIds: [],
    createdTopicIds: [],
    badgeStats: {
      answerCount: Number(reputation?.answer_count ?? profile.answer_count ?? profile.badgeStats?.answerCount ?? 0),
      answerLikeCount: Number(reputation?.answer_like_count ?? profile.answer_like_count ?? profile.badgeStats?.answerLikeCount ?? 0),
      level: toBadgeLevel(reputation?.badge_level ?? profile.badge_level ?? profile.badgeStats?.level),
    },
  }
  userCache.set(user.id, user)
  return user
}

function toWindowLabel(topic: Row) {
  if (topic.status === 'pending') return `Chờ duyệt - window ${Math.round(Number(topic.window_hours ?? topic.windowHours ?? 48) / 24)} ngày`
  if (topic.status === 'rejected') return 'Đã từ chối'
  const end = topic.window_end_at ?? topic.closes_at ?? topic.closesAt
  if (!end) return `${topic.window_hours ?? topic.windowHours ?? 48} giờ`
  const diff = new Date(end).getTime() - Date.now()
  if (diff <= 0) return 'Đã hết hạn'
  const hours = Math.floor(diff / 1000 / 60 / 60)
  const minutes = Math.floor((diff / 1000 / 60) % 60)
  if (hours >= 24) return `Còn ${Math.floor(hours / 24)} ngày ${hours % 24} giờ`
  return `Còn ${hours} giờ ${minutes} phút`
}

function toTopic(row: Row, resources: ResourceFile[] = []): Topic {
  const closesAt = row.closes_at ?? row.window_end_at ?? row.closesAt ?? undefined
  const isExpiredOpenTopic = row.status === 'open' && Boolean(closesAt) && new Date(closesAt).getTime() <= Date.now()
  const topic: Topic = {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description ?? ''),
    category: String(row.category ?? ''),
    tags: Array.isArray(row.tags) ? row.tags : [],
    prerequisites: String(row.prerequisites ?? ''),
    resources,
    status: row.status ?? 'pending',
    createdBy: String(row.created_by ?? row.createdBy ?? ''),
    proposedBy: String(row.proposed_by ?? row.proposedBy ?? row.created_by ?? ''),
    proposedByName: row.proposed_by_name ?? row.proposedByName ?? undefined,
    proposedByEmail: row.proposed_by_email ?? row.proposedByEmail ?? undefined,
    approvedBy: row.approved_by ?? row.approvedBy ?? undefined,
    approvedByName: row.approved_by_name ?? row.approvedByName ?? undefined,
    rejectionReason: row.rejection_reason ?? row.rejectionReason ?? undefined,
    revisionSuggestions: row.revision_suggestions ?? row.revisionSuggestions ?? [],
    proposalReason: row.proposal_reason ?? row.proposalReason ?? undefined,
    updatedAt: row.updated_at ?? row.updatedAt ?? undefined,
    submittedAt: row.submitted_at ?? row.submittedAt ?? undefined,
    reviewedAt: row.reviewed_at ?? row.reviewedAt ?? undefined,
    reviewedBy: row.reviewed_by ?? row.reviewedBy ?? undefined,
    reviewedByName: row.reviewed_by_name ?? row.reviewedByName ?? undefined,
    reviewedByEmail: row.reviewed_by_email ?? row.reviewedByEmail ?? undefined,
    rejectedAt: row.rejected_at ?? row.rejectedAt ?? undefined,
    resubmittedAt: row.resubmitted_at ?? row.resubmittedAt ?? undefined,
    commentCount: Number(row.comment_count ?? row.commentCount ?? 0),
    userSubmissionStatus: row.userSubmissionStatus ?? 'not_started',
    canEditProposal: row.status === 'pending' || row.status === 'rejected',
    canStartLearning: row.status === 'open' && !isExpiredOpenTopic,
    canResubmit: row.status === 'rejected',
    windowHours: Number(row.window_hours ?? row.windowHours ?? 48),
    windowLabel: toWindowLabel(row),
    submissionCount: Number(row.submission_count ?? row.submissionCount ?? 0),
    likeCount: Number(row.like_count ?? row.likeCount ?? 0),
    createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString()),
    closesAt,
  }
  topicCache.set(topic.id, topic)
  return topic
}

function toSubmission(row: Row): Submission {
  const id = String(row.id)
  const isAnonymous = Boolean(row.is_anonymous ?? row.isAnonymous)
  const exposedUserId = row.user_id ? String(row.user_id) : `anonymous-${id}`
  if (row.user_id && row.author_display_name) {
    toUser(
      {
        id: exposedUserId,
        display_name: row.author_display_name,
        email: row.author_email ?? '',
        role: 'learner',
        status: 'active',
      },
      row,
    )
  }
  const submission: Submission = {
    id,
    topicId: String(row.topic_id ?? row.topicId),
    userId: exposedUserId,
    isAnonymous,
    understood: String(row.understood ?? ''),
    notUnderstood: String(row.not_understood ?? row.notUnderstood ?? ''),
    files: Array.isArray(row.submission_files) ? row.submission_files.map(toResource) : row.files ?? [],
    wordCount: Number(row.word_count ?? row.wordCount ?? 0),
    timeSpentMinutes: Math.round(Number(row.time_spent_seconds ?? row.timeSpentMinutes * 60 ?? 0) / 60),
    likeCount: Number(row.like_count ?? row.likeCount ?? 0),
    commentCount: Number(row.comment_count ?? row.commentCount ?? 0),
    isLocked: row.is_locked ?? row.isLocked ?? true,
    createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString()),
    saved: Boolean(row.saved),
  }

  if (row.author_display_name) {
    toUser(
      {
        id: exposedUserId,
        display_name: row.author_display_name,
        email: row.author_email ?? '',
        role: 'learner',
        status: 'active',
      },
      {
        answer_count: row.answer_count,
        answer_like_count: row.answer_like_count,
        badge_level: row.badge_level,
      },
    )
  }

  submissionCache.set(submission.id, submission)
  return submission
}

function toNotification(row: Row): Notification {
  return {
    id: String(row.id),
    type: row.type,
    title: String(row.title),
    description: String(row.description),
    actionLabel: String(row.action_label ?? row.actionLabel),
    actionTo: String(row.action_to ?? row.actionTo),
    read: Boolean(row.read),
    createdAt: String(row.created_at ?? row.createdAt),
  }
}

function dedupeNotifications(notifications: Notification[]) {
  const seen = new Set<string>()
  return notifications.filter((notification) => {
    const key = [
      notification.type,
      notification.title.trim(),
      notification.description.trim(),
      notification.actionTo,
    ].join('|')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function toComment(row: Row): Comment {
  const userId = String(row.user_id ?? row.userId)
  if (row.profiles) {
    toUser(row.profiles, row.user_reputation_view)
  }
  return {
    id: String(row.id),
    submissionId: String(row.submission_id ?? row.submissionId),
    userId,
    parentId: row.parent_id ?? row.parentId ?? undefined,
    content: String(row.content),
    likeCount: Number(row.like_count ?? row.likeCount ?? 0),
    createdAt: String(row.created_at ?? row.createdAt),
  }
}

async function getCurrentProfileId() {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

async function fetchResourcesByTopic(topicIds: string[]) {
  if (!topicIds.length) return new Map<string, ResourceFile[]>()
  const { data, error } = await supabase.from('topic_resources').select('*').in('topic_id', topicIds)
  if (error) throw error
  const grouped = new Map<string, ResourceFile[]>()
  for (const row of data ?? []) {
    const topicId = String(row.topic_id)
    grouped.set(topicId, [...(grouped.get(topicId) ?? []), toResource(row)])
  }
  return grouped
}

async function uploadTopicResources(topicId: string, payload: TopicProposalPayload) {
  const resourceRows: Row[] = (payload.resources ?? [])
    .filter((resource) => resource.name.trim())
    .map((resource) => ({
      topic_id: topicId,
      name: resource.name,
      type: resource.type,
      url: resource.url,
      size_bytes: undefined,
    }))

  const files = payload.resourceFiles ?? []
  if (files.length > 5) throw new Error('TOO_MANY_TOPIC_FILES')
  if (files.some((file) => !isAllowedSubmissionFile(file))) throw new Error('INVALID_TOPIC_FILE')

  if (files.length) {
    const userId = await getCurrentProfileId()
    if (!userId) throw new Error('AUTH_REQUIRED')
    for (const file of files) {
      const storagePath = `${userId}/topics/${topicId}/${Date.now()}-${safeStorageName(file.name)}`
      const { error: uploadError } = await supabase.storage.from('topic-resources').upload(storagePath, file, {
        contentType: file.type || undefined,
        upsert: false,
      })
      if (uploadError) throw uploadError
      const { data: publicUrl } = supabase.storage.from('topic-resources').getPublicUrl(storagePath)
      resourceRows.push({
        topic_id: topicId,
        name: file.name,
        type: fileKind(file),
        url: publicUrl.publicUrl,
        storage_path: storagePath,
        size_bytes: file.size,
      })
    }
  }

  if (!resourceRows.length) return
  const { error } = await supabase.from('topic_resources').insert(resourceRows)
  if (error) throw error
}

async function fetchReputationMap(userIds: string[]) {
  const ids = [...new Set(userIds.filter(Boolean))]
  if (!ids.length) return new Map<string, Row>()
  const { data, error } = await supabase.from('user_reputation_view').select('*').in('user_id', ids)
  if (error) throw error
  return new Map((data ?? []).map((row) => [String(row.user_id), row]))
}

async function fetchInterestMap(userIds: string[]) {
  const ids = [...new Set(userIds.filter(Boolean))]
  if (!ids.length) return new Map<string, string[]>()
  const { data, error } = await supabase.from('user_interests').select('*').in('user_id', ids)
  if (error) throw error
  const grouped = new Map<string, string[]>()
  for (const row of data ?? []) {
    const userId = String(row.user_id)
    grouped.set(userId, [...(grouped.get(userId) ?? []), String(row.interest)])
  }
  return grouped
}

async function fetchProfiles(userIds: string[]) {
  const ids = [...new Set(userIds.filter(Boolean))]
  if (!ids.length) return []
  const { data, error } = await supabase.from('profiles').select('*').in('id', ids)
  if (error) throw error
  const reputations = await fetchReputationMap(ids)
  const interests = await fetchInterestMap(ids)
  return (data ?? []).map((profile) => toUser(profile, reputations.get(String(profile.id)), interests.get(String(profile.id)) ?? []))
}

export const authService = {
  getSessionUser: async (): Promise<User | null> => {
    if (!shouldUseSupabase()) {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (!res.ok) return null
        const json = await res.json()
        return json.user ?? null
      } catch (e) {
        return null
      }
    }
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) return null

    const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle()
    if (profileError || !profile) return null

    const [reputations, interests] = await Promise.all([fetchReputationMap([data.user.id]), fetchInterestMap([data.user.id])])
    return toUser(profile, reputations.get(data.user.id), interests.get(data.user.id) ?? [])
  },

  login: async (email: string, password = 'timeboxed', remember = false) => {
    if (!shouldUseSupabase()) {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember }),
      })
      if (!res.ok) throw new Error('Login failed')
      const json = await res.json()
      return { user: json.user }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const profile = data.user ? await userService.getProfile(data.user.id) : null
    return { user: profile ?? mockUsers[0] }
  },
  register: async (name: string, email: string, password = 'timeboxed') => {
    if (!shouldUseSupabase()) {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      if (!res.ok) throw new Error('Register failed')
      const json = await res.json()
      return { user: json.user }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    })
    if (error) throw error
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        display_name: name,
        email,
        role: 'learner',
        status: 'active',
      })
      if (profileError) throw profileError
      return { user: await userService.getProfile(data.user.id) }
    }
    return { user: { ...mockUsers[0], name, email } }
  },
  forgotPassword: async (email: string) => {
    if (!shouldUseSupabase()) {
      // Not implemented in backend: show popup on client
      window.alert('Chức năng quên mật khẩu chưa được phát triển')
      return { email, sent: false }
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
    return { email, sent: true }
  },
  logout: async () => {
    if (!shouldUseSupabase()) {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      return
    }
    if (shouldUseSupabase()) await supabase.auth.signOut()
  },
  loginWithGoogle: async () => {
    if (!shouldUseSupabase()) {
      // backend google not implemented — show popup
      window.alert('Đăng nhập bằng Google chưa được phát triển')
      return null
    }
    // For Supabase path, let supabase handle OAuth (not covered here)
    return null
  },
}

export const topicService = {
  getTopics: async (filters: TopicFilters = {}) =>
    fallbackOnReadError((async () => {
      let query = supabase.from('topic_cards_view').select('*').order('created_at', { ascending: false })
      if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status)
      if (filters.category && filters.category !== 'all') query = query.eq('category', filters.category)
      if (filters.query?.trim()) {
        const q = `%${filters.query.trim()}%`
        query = query.or(`title.ilike.${q},description.ilike.${q},category.ilike.${q}`)
      }
      const { data, error } = await query
      if (error) throw error
      const resources = await fetchResourcesByTopic((data ?? []).map((row) => String(row.id)))
      const topics = (data ?? []).map((row) => toTopic(row, resources.get(String(row.id)) ?? []))
      const currentUserId = await getCurrentProfileId()
      if (!currentUserId || !topics.length) return topics

      const { data: submissions, error: submissionsError } = await supabase
        .from('submissions')
        .select('topic_id')
        .eq('user_id', currentUserId)
        .in('topic_id', topics.map((topic) => topic.id))
      if (submissionsError) throw submissionsError

      const submittedTopicIds = new Set((submissions ?? []).map((submission) => String(submission.topic_id)))
      return topics.map((topic) => {
        if (!submittedTopicIds.has(topic.id)) return topic
        return {
          ...topic,
          userSubmissionStatus: 'locked',
          canStartLearning: false,
        }
      })
    })(), mockTopics),

  getTopicById: async (id: string) =>
    fallbackOnReadError((async () => {
      const { data, error } = await supabase.from('topic_cards_view').select('*').eq('id', id).maybeSingle()
      const row = requireData(data, error)
      const resources = await fetchResourcesByTopic([id])
      const topic = toTopic(row, resources.get(id) ?? [])
      const currentUserId = await getCurrentProfileId()
      if (currentUserId) {
        const { data: mine } = await supabase.from('submissions').select('id').eq('topic_id', id).eq('user_id', currentUserId).maybeSingle()
        if (mine) {
          topic.userSubmissionStatus = 'locked'
          topic.canStartLearning = false
        }
      }
      return topic
    })(), topicCache.get(id) ?? mockTopics[0]),

  createProposal: async (payload: TopicProposalPayload) => {
    if (!shouldUseSupabase()) {
      const nextTopic: Topic = {
        ...mockTopics[3],
        ...payload,
        id: `topic-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submissionCount: 0,
        likeCount: 0,
        commentCount: 0,
        canEditProposal: true,
        canStartLearning: false,
        canResubmit: false,
      }
      mockTopics.unshift(nextTopic)
      topicCache.set(nextTopic.id, nextTopic)
      return nextTopic
    }
    const { data, error } = await supabase.rpc('create_topic_proposal', {
      p_title: payload.title,
      p_description: payload.description,
      p_category: payload.category,
      p_tags: payload.tags ?? [],
      p_prerequisites: payload.prerequisites ?? 'Không yêu cầu kiến thức nền.',
      p_proposal_reason: payload.proposalReason ?? null,
      p_window_hours: payload.windowHours ?? 48,
    })
    if (error) throw error
    await uploadTopicResources(String(data.id), payload)
    return topicService.getTopicById(String(data.id))
  },

  updateTopic: async (id: string, payload: Partial<Topic>) => {
    if (!shouldUseSupabase()) {
      const topic = lookupService.getTopic(id)
      Object.assign(topic, payload, { updatedAt: new Date().toISOString() })
      return topic
    }
    const { data, error } = await supabase.from('topics').update({
      title: payload.title,
      description: payload.description,
      category: payload.category,
      tags: payload.tags,
      prerequisites: payload.prerequisites,
      proposal_reason: payload.proposalReason,
      window_hours: payload.windowHours,
    }).eq('id', id).select('*').single()
    if (error) throw error
    return toTopic(data)
  },

  closeTopic: async (id: string, reason: string) => {
    if (!shouldUseSupabase()) {
      const topic = lookupService.getTopic(id)
      Object.assign(topic, { status: 'closed' as const, updatedAt: new Date().toISOString(), canStartLearning: false })
      return topic
    }
    const { data, error } = await supabase.rpc('close_topic', { p_topic_id: id, p_reason: reason })
    if (error) throw error
    return toTopic(data)
  },

  approveTopic: async (id: string) => {
    if (!shouldUseSupabase()) {
      const topic = lookupService.getTopic(id)
      Object.assign(topic, {
        status: 'open' as const,
        approvedBy: currentAdminId,
        reviewedBy: currentAdminId,
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        canEditProposal: false,
        canStartLearning: true,
        canResubmit: false,
      })
      return topic
    }
    const { data, error } = await supabase.rpc('approve_topic', { p_topic_id: id })
    if (error) throw error
    return toTopic(data)
  },

  rejectTopic: async (id: string, payload: { rejectionReason: string; revisionSuggestions: string[] }) => {
    if (!shouldUseSupabase()) {
      const topic = lookupService.getTopic(id)
      Object.assign(topic, {
        status: 'rejected' as const,
        rejectionReason: payload.rejectionReason,
        revisionSuggestions: payload.revisionSuggestions,
        reviewedBy: currentAdminId,
        reviewedByName: lookupService.getUser(currentAdminId).name,
        reviewedAt: new Date().toISOString(),
        rejectedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        canEditProposal: true,
        canStartLearning: false,
        canResubmit: true,
      })
      return topic
    }
    const { data, error } = await supabase.rpc('reject_topic', {
      p_topic_id: id,
      p_rejection_reason: payload.rejectionReason,
      p_revision_suggestions: payload.revisionSuggestions,
    })
    if (error) throw error
    return toTopic(data)
  },

  resubmitProposal: async (id: string, payload: TopicProposalPayload) => {
    if (!shouldUseSupabase()) {
      const topic = lookupService.getTopic(id)
      Object.assign(topic, payload, {
        status: 'pending' as const,
        resubmittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        canEditProposal: true,
        canStartLearning: false,
        canResubmit: false,
      })
      return topic
    }
    const { data, error } = await supabase.rpc('resubmit_topic', {
      p_topic_id: id,
      p_title: payload.title,
      p_description: payload.description,
      p_category: payload.category,
      p_tags: payload.tags ?? [],
      p_prerequisites: payload.prerequisites ?? '',
      p_proposal_reason: payload.proposalReason ?? null,
      p_window_hours: payload.windowHours ?? 48,
    })
    if (error) throw error
    const { error: deleteResourcesError } = await supabase.from('topic_resources').delete().eq('topic_id', id)
    if (deleteResourcesError) throw deleteResourcesError
    await uploadTopicResources(id, payload)
    return topicService.getTopicById(String(data.id))
  },
}

export const draftService = {
  getDraft: async (topicId: string): Promise<LearningDraft | null> => {
    if (!shouldUseSupabase()) return null
    const userId = await getCurrentProfileId()
    if (!userId) return null
    const { data, error } = await supabase
      .from('learning_drafts')
      .select('*')
      .eq('topic_id', topicId)
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    return {
      understood: String(data.understood ?? ''),
      notUnderstood: String(data.not_understood ?? ''),
      isAnonymous: Boolean(data.is_anonymous),
      timeSpentSeconds: Number(data.time_spent_seconds ?? 0),
      updatedAt: data.updated_at,
    }
  },

  saveDraft: async (topicId: string, draft: LearningDraft) => {
    if (!shouldUseSupabase()) return { ...draft, updatedAt: new Date().toISOString() }
    const userId = await getCurrentProfileId()
    if (!userId) throw new Error('AUTH_REQUIRED')
    const { data, error } = await supabase
      .from('learning_drafts')
      .upsert({
        topic_id: topicId,
        user_id: userId,
        understood: draft.understood,
        not_understood: draft.notUnderstood,
        is_anonymous: draft.isAnonymous,
        time_spent_seconds: draft.timeSpentSeconds,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'topic_id,user_id' })
      .select('*')
      .single()
    if (error) throw error
    return {
      understood: String(data.understood ?? ''),
      notUnderstood: String(data.not_understood ?? ''),
      isAnonymous: Boolean(data.is_anonymous),
      timeSpentSeconds: Number(data.time_spent_seconds ?? 0),
      updatedAt: data.updated_at,
    } satisfies LearningDraft
  },
}

export const submissionService = {
  getSubmissions: async () => fallbackOnReadError((async () => {
    const { data, error } = await supabase.from('submissions').select('*, submission_files(*)')
    if (error) throw error
    return (data ?? []).map(toSubmission)
  })(), mockSubmissions),

  getSubmissionsByTopic: async (topicId: string) => {
    if (!shouldUseSupabase()) return mockSubmissions.filter((submission) => submission.topicId === topicId)
    const { data, error } = await supabase.rpc('get_peer_submissions', { p_topic_id: topicId })
    if (error) throw error
    return (data ?? []).map(toSubmission)
  },

  getSubmission: async (id: string) => {
    if (!shouldUseSupabase()) return submissionCache.get(id) ?? mockSubmissions[0]
    const { data, error } = await supabase.rpc('get_submission_detail', { p_submission_id: id })
    if (error) throw error
    const row = Array.isArray(data) ? data[0] : data
    if (!row) return null
    return toSubmission(row)
  },

  getMySubmission: async (topicId: string) => {
    if (!shouldUseSupabase()) return mockSubmissions.find((submission) => submission.topicId === topicId && submission.userId === currentUserId) ?? null
    const userId = await getCurrentProfileId()
    if (!userId) return null
    const { data, error } = await supabase
      .from('submissions')
      .select('*, submission_files(*)')
      .eq('topic_id', topicId)
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw error
    return data ? toSubmission(data) : null
  },

  submit: async (topicId: string, payload: { understood: string; notUnderstood: string; isAnonymous: boolean; timeSpentSeconds?: number; files?: File[] }) => {
    if (!shouldUseSupabase()) {
      const next = {
        ...mockSubmissions[0],
        id: 'new-submission',
        topicId,
        userId: currentUserId,
        understood: payload.understood,
        notUnderstood: payload.notUnderstood,
        isAnonymous: payload.isAnonymous,
      }
      submissionCache.set(next.id, next)
      return next
    }
    const userId = await getCurrentProfileId()
    if (!userId) throw new Error('AUTH_REQUIRED')
    const files = payload.files ?? []
    if (files.length > 10) throw new Error('TOO_MANY_FILES')
    if (files.some((file) => !isAllowedSubmissionFile(file))) throw new Error('INVALID_FILE')

    const { data, error } = await supabase.rpc('submit_learning', {
      p_topic_id: topicId,
      p_understood: payload.understood,
      p_not_understood: payload.notUnderstood,
      p_is_anonymous: payload.isAnonymous,
      p_time_spent_seconds: payload.timeSpentSeconds ?? 0,
    })
    if (error) throw error
    const submission = toSubmission(data)

    if (files.length) {
      const fileRows = []
      for (const file of files) {
        const storagePath = `${userId}/${submission.id}/${Date.now()}-${safeStorageName(file.name)}`
        const { error: uploadError } = await supabase.storage.from('submission-files').upload(storagePath, file, {
          contentType: file.type || undefined,
          upsert: false,
        })
        if (uploadError) throw uploadError
        fileRows.push({
          submission_id: submission.id,
          name: file.name,
          type: fileKind(file),
          url: '',
          storage_path: storagePath,
          size_bytes: file.size,
        })
      }
      const { error: filesError } = await supabase.from('submission_files').insert(fileRows)
      if (filesError) throw filesError
    }

    return (await submissionService.getMySubmission(topicId)) ?? submission
  },

  toggleLike: async (submissionId: string, liked: boolean) => {
    if (!shouldUseSupabase()) return { submissionId, liked: !liked }
    const userId = await getCurrentProfileId()
    if (!userId) throw new Error('AUTH_REQUIRED')
    if (liked) {
      const { error } = await supabase.from('submission_likes').delete().eq('submission_id', submissionId).eq('user_id', userId)
      if (error) throw error
      return { submissionId, liked: false }
    }
    const { error } = await supabase.from('submission_likes').insert({ submission_id: submissionId, user_id: userId })
    if (error) throw error
    return { submissionId, liked: true }
  },
}

export const commentService = {
  getAllComments: async () => fallbackOnReadError((async () => {
    const { data, error } = await supabase.from('comments').select('*')
    if (error) throw error
    return (data ?? []).map(toComment)
  })(), mockComments),

  getComments: async (submissionId: string) => {
    if (!shouldUseSupabase()) return mockComments.filter((comment) => comment.submissionId === submissionId)
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: true })
    if (error) throw error
    const rows = data ?? []
    const userIds = [...new Set(rows.map((row) => String(row.user_id)).filter(Boolean))]
    const [profiles, reputationByUserId] = await Promise.all([
      fetchProfiles(userIds),
      fetchReputationMap(userIds),
    ])
    const profileByUserId = new Map(profiles.map((profile) => [profile.id, profile]))
    const likeCounts = await Promise.all(rows.map(async (row) => {
      const { count } = await supabase.from('comment_likes').select('*', { count: 'exact', head: true }).eq('comment_id', row.id)
      return [String(row.id), count ?? 0] as const
    }))
    const counts = new Map(likeCounts)
    return rows.map((row) =>
      toComment({
        ...row,
        like_count: counts.get(String(row.id)) ?? 0,
        profiles: profileByUserId.get(String(row.user_id)),
        user_reputation_view: reputationByUserId.get(String(row.user_id)),
      }),
    )
  },

  createComment: async (submissionId: string, content: string) => {
    if (!shouldUseSupabase()) {
      return {
        id: `comment-${Date.now()}`,
        submissionId,
        userId: currentUserId,
        content,
        likeCount: 0,
        createdAt: new Date().toISOString(),
      }
    }
    const userId = await getCurrentProfileId()
    if (!userId) throw new Error('AUTH_REQUIRED')
    const { data, error } = await supabase.from('comments').insert({
      submission_id: submissionId,
      user_id: userId,
      content,
    }).select('*').single()
    if (error) throw error
    return toComment(data)
  },

  createReply: async (submissionId: string, parentId: string, content: string) => {
    if (!shouldUseSupabase()) {
      return {
        id: `reply-${Date.now()}`,
        submissionId,
        parentId,
        userId: currentUserId,
        content,
        likeCount: 0,
        createdAt: new Date().toISOString(),
      }
    }
    const userId = await getCurrentProfileId()
    if (!userId) throw new Error('AUTH_REQUIRED')
    const { data, error } = await supabase.from('comments').insert({
      submission_id: submissionId,
      parent_id: parentId,
      user_id: userId,
      content,
    }).select('*').single()
    if (error) throw error
    return toComment(data)
  },

  toggleLike: async (commentId: string, liked: boolean) => {
    if (!shouldUseSupabase()) return { commentId, liked: !liked }
    const userId = await getCurrentProfileId()
    if (!userId) throw new Error('AUTH_REQUIRED')
    if (liked) {
      const { error } = await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', userId)
      if (error) throw error
      return { commentId, liked: false }
    }
    const { error } = await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: userId })
    if (error) throw error
    return { commentId, liked: true }
  },
}

export const adminService = {
  getOverview: async () => fallbackOnReadError((async () => {
    const [topics, users, submissions, comments] = await Promise.all([
      topicService.getTopics(),
      userService.getUsers(),
      submissionService.getSubmissions(),
      commentService.getAllComments(),
    ])
    return { topics, users, submissions, comments }
  })(), { topics: mockTopics, users: mockUsers, submissions: mockSubmissions, comments: mockComments }),

  getPendingTopics: async () => fallbackOnReadError(topicService.getTopics({ status: 'pending' }), mockTopics.filter((topic) => topic.status === 'pending')),

  getTopicDetail: async (id: string) =>
    fallbackOnReadError((async () => {
      const topic = await topicService.getTopicById(id)
      const submissions = await submissionService.getSubmissionsByTopic(id)
      const allComments = await commentService.getAllComments()
      const comments = allComments.filter((comment) => submissions.some((submission) => submission.id === comment.submissionId))
      return { topic, submissions, comments }
    })(), {
      topic: lookupService.getTopic(id),
      submissions: mockSubmissions.filter((submission) => submission.topicId === id),
      comments: mockComments.filter((comment) => mockSubmissions.some((submission) => submission.topicId === id && submission.id === comment.submissionId)),
    }),

  getUserDetail: async (id: string) =>
    fallbackOnReadError((async () => {
      const user = await userService.getProfile(id)
      const topics = (await topicService.getTopics()).filter((topic) => topic.proposedBy === id || topic.createdBy === id)
      const submissions = (await submissionService.getSubmissions()).filter((submission) => submission.userId === id)
      return { user, topics, submissions }
    })(), {
      user: lookupService.getUser(id),
      topics: mockTopics.filter((topic) => topic.proposedBy === id || topic.createdBy === id),
      submissions: mockSubmissions.filter((submission) => submission.userId === id),
    }),
}

export const userService = {
  getCurrentUser: async () => {
    if (!shouldUseSupabase()) return mockUsers.find((user) => user.id === currentUserId) ?? mockUsers[0]
    const userId = await getCurrentProfileId()
    if (!userId) throw new Error('AUTH_REQUIRED')
    return userService.getProfile(userId)
  },

  getCurrentAdmin: async () => {
    if (!shouldUseSupabase()) return mockUsers.find((user) => user.id === currentAdminId) ?? mockUsers[5]
    const userId = await getCurrentProfileId()
    if (!userId) throw new Error('AUTH_REQUIRED')
    return userService.getProfile(userId)
  },

  getUsers: async () =>
    fallbackOnReadError((async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: true })
      if (error) throw error
      const ids = (data ?? []).map((row) => String(row.id))
      const reputations = await fetchReputationMap(ids)
      const interests = await fetchInterestMap(ids)
      return (data ?? []).map((profile) => toUser(profile, reputations.get(String(profile.id)), interests.get(String(profile.id)) ?? []))
    })(), mockUsers),

  getProfile: async (id = currentUserId) => {
    if (!shouldUseSupabase()) return mockUsers.find((user) => user.id === id) ?? mockUsers[0]
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
    const profile = requireData(data, error)
    const [reputations, interests] = await Promise.all([fetchReputationMap([id]), fetchInterestMap([id])])
    return toUser(profile, reputations.get(id), interests.get(id) ?? [])
  },

  getProfileStats: async (id?: string): Promise<ProfileStats> => {
    if (!shouldUseSupabase()) {
      const userId = id ?? currentUserId
      const user = mockUsers.find((user) => user.id === userId) ?? mockUsers[0]
      const userSubmissions = mockSubmissions.filter((submission) => submission.userId === userId)
      return {
        joinedTopicCount: new Set(userSubmissions.map((submission) => submission.topicId)).size,
        submissionCount: userSubmissions.length,
        createdTopicCount: mockTopics.filter((topic) => topic.proposedBy === userId || topic.createdBy === userId).length,
        bookmarkCount: mockSubmissions.filter((submission) => submission.saved).length,
        submissionLikeCount: userSubmissions.reduce((sum, submission) => sum + submission.likeCount, 0),
        answerCount: user.badgeStats.answerCount,
        answerLikeCount: user.badgeStats.answerLikeCount,
      }
    }

    const userId = id ?? await getCurrentProfileId()
    if (!userId) throw new Error('AUTH_REQUIRED')
    const [
      submissionsResult,
      createdTopicsResult,
      bookmarksResult,
      commentsResult,
      reputationResult,
    ] = await Promise.all([
      supabase.from('submissions').select('id, topic_id').eq('user_id', userId),
      supabase.from('topics').select('id').or(`created_by.eq.${userId},proposed_by.eq.${userId}`),
      supabase.from('bookmarks').select('submission_id').eq('user_id', userId),
      supabase.from('comments').select('id').eq('user_id', userId),
      supabase.from('user_reputation_view').select('*').eq('user_id', userId).maybeSingle(),
    ])

    if (submissionsResult.error) throw submissionsResult.error
    if (createdTopicsResult.error) throw createdTopicsResult.error
    if (bookmarksResult.error) throw bookmarksResult.error
    if (commentsResult.error) throw commentsResult.error
    if (reputationResult.error) throw reputationResult.error

    const submissionIds = (submissionsResult.data ?? []).map((row) => String(row.id))
    const { data: submissionLikes, error: likesError } = submissionIds.length
      ? await supabase.from('submission_likes').select('submission_id').in('submission_id', submissionIds)
      : { data: [], error: null }
    if (likesError) throw likesError

    return {
      joinedTopicCount: new Set((submissionsResult.data ?? []).map((row) => String(row.topic_id))).size,
      submissionCount: submissionsResult.data?.length ?? 0,
      createdTopicCount: createdTopicsResult.data?.length ?? 0,
      bookmarkCount: bookmarksResult.data?.length ?? 0,
      submissionLikeCount: submissionLikes?.length ?? 0,
      answerCount: Number(reputationResult.data?.answer_count ?? commentsResult.data?.length ?? 0),
      answerLikeCount: Number(reputationResult.data?.answer_like_count ?? 0),
    }
  },

  lockUser: async (id: string, reason: string) => {
    if (!shouldUseSupabase()) return { id, reason, status: 'locked' as const }
    const { error } = await supabase.rpc('set_user_status', { p_user_id: id, p_status: 'locked', p_reason: reason })
    if (error) throw error
    return { id, reason, status: 'locked' as const }
  },

  unlockUser: async (id: string, reason: string) => {
    if (!shouldUseSupabase()) return { id, reason, status: 'active' as const }
    const { error } = await supabase.rpc('set_user_status', { p_user_id: id, p_status: 'active', p_reason: reason })
    if (error) throw error
    return { id, reason, status: 'active' as const }
  },
}

export const notificationService = {
  getNotifications: async () => {
    if (!shouldUseSupabase()) return mockNotifications
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return dedupeNotifications((data ?? []).map(toNotification))
  },

  getNotification: async (id: string) => {
    if (!shouldUseSupabase()) return mockNotifications.find((notification) => notification.id === id) ?? mockNotifications[0]
    const { data, error } = await supabase.from('notifications').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    if (!data) throw new Error('NOTIFICATION_NOT_FOUND')
    if (!data.read) await supabase.from('notifications').update({ read: true }).eq('id', id)
    return toNotification(data)
  },

  markAllRead: async () => {
    if (!shouldUseSupabase()) {
      mockNotifications.forEach((notification) => {
        notification.read = true
      })
      return
    }
    const { error } = await supabase.from('notifications').update({ read: true }).eq('read', false)
    if (error) throw error
  },
}

export const bookmarkService = {
  getBookmarks: async () => {
    if (!shouldUseSupabase()) return mockSubmissions.filter((submission) => submission.saved)
    const { data, error } = await supabase.from('bookmarks').select('submission_id')
    if (error) throw error
    const ids = (data ?? []).map((row) => String(row.submission_id))
    if (!ids.length) return []
    const rows = await Promise.all(ids.map(async (id) => {
      const { data, error } = await supabase.rpc('get_submission_detail', { p_submission_id: id })
      if (error) throw error
      return Array.isArray(data) ? data[0] : data
    }))
    return rows.filter(Boolean).map((row) => toSubmission({ ...row, saved: true }))
  },

  toggleBookmark: async (submissionId: string) => {
    if (!shouldUseSupabase()) return { submissionId, saved: true }
    const userId = await getCurrentProfileId()
    if (!userId) throw new Error('AUTH_REQUIRED')
    const { data } = await supabase.from('bookmarks').select('*').eq('submission_id', submissionId).eq('user_id', userId).maybeSingle()
    if (data) {
      const { error } = await supabase.from('bookmarks').delete().eq('submission_id', submissionId).eq('user_id', userId)
      if (error) throw error
      return { submissionId, saved: false }
    }
    const { error } = await supabase.from('bookmarks').insert({ submission_id: submissionId, user_id: userId })
    if (error) throw error
    return { submissionId, saved: true }
  },
}

export const insightService = {
  getCommunityInsight: async (topicId = 't1') => {
    if (!shouldUseSupabase()) return mockInsights.find((insight) => insight.topicId === topicId) ?? mockInsights[0]
    const { data, error } = await supabase.from('community_insights').select('*').eq('topic_id', topicId).maybeSingle()
    if (error) throw error
    if (!data) {
      return {
        topicId,
        understoodPoints: [],
        unclearPoints: [],
        commonQuestions: [],
        submissionCount: 0,
      }
    }
    const topic = topicCache.get(topicId) ?? await topicService.getTopicById(topicId)
    return {
      topicId: String(data.topic_id),
      understoodPoints: data.understood_points ?? [],
      unclearPoints: data.unclear_points ?? [],
      commonQuestions: data.common_questions ?? [],
      submissionCount: topic.submissionCount,
    } satisfies CommunityInsight
  },
}

export const deadlineService = {
  getDeadlines: async () => fallbackOnReadError((async () => {
    const topics = await topicService.getTopics()
    const currentUserId = await getCurrentProfileId()
    if (!currentUserId) return []
    const { data: submissions } = await supabase.from('submissions').select('topic_id').eq('user_id', currentUserId)
    const submittedTopicIds = new Set((submissions ?? []).map((row) => String(row.topic_id)))
    return topics
      .filter((topic) => topic.status === 'open' || topic.status === 'closed')
      .map((topic) => ({
        id: `deadline-${topic.id}`,
        topicId: topic.id,
        title: topic.title,
        dueAt: topic.closesAt ?? topic.createdAt,
        status: submittedTopicIds.has(topic.id) ? 'submitted' : topic.status === 'closed' || (topic.closesAt && new Date(topic.closesAt).getTime() < Date.now()) ? 'expired' : 'not_submitted',
      }) satisfies Deadline)
  })(), mockDeadlines),
}

export const lookupService = {
  getUser: (id: string) => {
    if (id?.startsWith('anonymous-')) return { ...anonymousUser, id }
    return userCache.get(id) ?? mockUsers.find((user) => user.id === id) ?? anonymousUser
  },
  getTopic: (id: string) => topicCache.get(id) ?? mockTopics.find((topic) => topic.id === id) ?? mockTopics[0],
}

void fetchProfiles([...new Set(mockTopics.flatMap((topic) => [topic.createdBy, topic.proposedBy, topic.approvedBy, topic.reviewedBy]).filter(Boolean) as string[])])
  .catch(() => undefined)

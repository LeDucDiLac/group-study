import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

function readSource(relativePath: string) {
  return readFileSync(join(process.cwd(), 'src', relativePath), 'utf8')
}

function readRepo(relativePath: string) {
  return readFileSync(join(process.cwd(), '..', relativePath), 'utf8')
}

function serviceMethodBody(source: string, methodName: string) {
  const start = source.indexOf(`${methodName}: async`)
  expect(start, `Missing service method ${methodName}`).toBeGreaterThanOrEqual(0)
  const nextMethod = source.indexOf('\n  ', start + methodName.length + 8)
  return source.slice(start, nextMethod === -1 ? undefined : nextMethod)
}

describe('P0 source guards for core learner workflow', () => {
  it('Topic detail must derive CTA from the current user submission state', () => {
    const source = readSource('pages/learner/TopicPages.tsx')

    expect(source).toContain('submissionService.getMySubmission')
    expect(source).toContain('Vào dạy chéo')
    expect(source).toContain('Xem bài của bạn')
    expect(source).toContain('Đã nộp bài')
  })

  it('Learn page countdown must update over time, not only at render time', () => {
    const source = readSource('pages/learner/LearnPages.tsx')

    expect(source).toContain('setInterval')
    expect(source).toMatch(/clearInterval|window\.clearInterval/)
    expect(source).toMatch(/remainingMs|remainingTime|now/)
  })

  it('Peer/community pages must call real comment and like services', () => {
    const source = readSource('pages/learner/CommunityPages.tsx')

    expect(source).toContain('commentService.getComments')
    expect(source).toContain('commentService.createComment')
    expect(source).toContain('commentService.createReply')
    expect(source).toContain('commentService.toggleLike')
    expect(source).toContain('submissionService.toggleLike')
  })

  it('Profile page must render dynamic stats from the Supabase service layer', () => {
    const pageSource = readSource('pages/learner/CommunityPages.tsx')
    const serviceSource = readSource('services/api.ts')

    expect(pageSource).toContain('userService.getProfileStats')
    expect(pageSource).toContain('stats.joinedTopicCount')
    expect(pageSource).toContain('stats.submissionCount')
    expect(pageSource).toContain('stats.answerLikeCount')
    expect(serviceSource).toContain('getProfileStats')
    expect(serviceSource).toContain("supabase.from('bookmarks')")
    expect(serviceSource).toContain("supabase.from('submission_likes')")
  })

  it('Admin user status changes must go through the audited RPC', () => {
    const serviceSource = readSource('services/api.ts')
    const adminSource = readSource('pages/admin/AdminPages.tsx')

    expect(serviceSource).toContain("supabase.rpc('set_user_status'")
    expect(serviceSource).toContain('unlockUser')
    expect(adminSource).toContain('userService.lockUser')
    expect(adminSource).toContain('userService.unlockUser')
  })

  it('Topic lifecycle mutations must use audited Supabase RPCs', () => {
    const serviceSource = readSource('services/api.ts')
    const adminSource = readSource('pages/admin/AdminPages.tsx')
    const learnerTopicSource = readSource('pages/learner/TopicPages.tsx')

    expect(serviceSource).toContain("supabase.rpc('approve_topic'")
    expect(serviceSource).toContain("supabase.rpc('reject_topic'")
    expect(serviceSource).toContain("supabase.rpc('close_topic'")
    expect(serviceSource).toContain("supabase.rpc('create_topic_proposal'")
    expect(serviceSource).toContain("supabase.rpc('resubmit_topic'")
    expect(adminSource).toContain('topicService.closeTopic')
    expect(learnerTopicSource).toContain('const [submitting, setSubmitting]')
    expect(learnerTopicSource).toContain('if (submitting) return')
    expect(learnerTopicSource).not.toContain('const editingTopic = id ? lookupService.getTopic(id) : undefined')
  })

  it('Topic proposal resources must use real storage instead of metadata-only mock rows', () => {
    const serviceSource = readSource('services/api.ts')
    const learnerTopicSource = readSource('pages/learner/TopicPages.tsx')

    expect(serviceSource).toContain("supabase.storage.from('topic-resources').upload")
    expect(serviceSource).toContain("supabase.from('topic_resources').insert")
    expect(serviceSource).toContain("supabase.from('topic_resources').delete")
    expect(learnerTopicSource).toContain('resourceFiles: uploadedFiles')
    expect(learnerTopicSource).toContain('.png,.jpg,.jpeg,.webp')
  })

  it('Database lifecycle migration must support resubmission and closed notifications', () => {
    const migrationSource = readRepo('supabase/migrations/202605240004_topic_lifecycle_resubmit_close.sql')
    const createMigrationSource = readRepo('supabase/migrations/202605240005_create_topic_proposal_dedup.sql')

    expect(migrationSource).toContain('create or replace function public.resubmit_topic')
    expect(migrationSource).toContain("status = 'pending'")
    expect(migrationSource).toContain('TOPIC_NOT_FOUND_OR_NOT_RESUBMITTABLE')
    expect(migrationSource).toContain("type in ('comment', 'deadline', 'approved', 'rejected', 'closed')")
    expect(migrationSource).toContain("'close_topic', 'topic'")
    expect(createMigrationSource).toContain('create or replace function public.create_topic_proposal')
    expect(createMigrationSource).toContain('pg_advisory_xact_lock')
    expect(createMigrationSource).toContain("and status = 'pending'")
  })

  it('Core Supabase-backed reads must not silently fall back to mock data', () => {
    const source = readSource('services/api.ts')
    const strictMethods = [
      'getCurrentUser',
      'getCurrentAdmin',
      'getProfile',
      'getDraft',
      'getSubmissionsByTopic',
      'getSubmission',
      'getComments',
      'getNotifications',
      'getNotification',
      'getBookmarks',
      'getCommunityInsight',
    ]

    for (const method of strictMethods) {
      expect(serviceMethodBody(source, method)).not.toContain('fallbackOnReadError')
    }

    expect(source).toContain("console.warn('[TimeBoxed API] Supabase read failed:', error)")
    expect(source).toContain('throw error')
    expect(source).not.toContain("console.warn('[TimeBoxed API] Falling back to mock data:'")
  })

  it('Hardened lifecycle migration must expose real admin metadata and avoid duplicate lifecycle actions', () => {
    const migrationSource = readRepo('supabase/migrations/202605250002_harden_topic_lifecycle_views.sql')
    const serviceSource = readSource('services/api.ts')
    const adminSource = readSource('pages/admin/AdminPages.tsx')

    expect(migrationSource).toContain('proposed_profile.display_name as proposed_by_name')
    expect(migrationSource).toContain('reviewed_profile.display_name as reviewed_by_name')
    expect(migrationSource).toContain("and status = 'pending'")
    expect(migrationSource).toContain('TOPIC_NOT_FOUND_OR_NOT_PENDING')
    expect(migrationSource).toContain("previous_topic.status not in ('open', 'closed')")
    expect(migrationSource).toContain('Người học ẩn danh')
    expect(serviceSource).toContain('proposedByName:')
    expect(serviceSource).toContain('reviewedByName:')
    expect(adminSource).toContain('getTopicProposerName')
    expect(adminSource).toContain('getTopicReviewerName')
  })
})

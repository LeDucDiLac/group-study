import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BadgeProgressCard, ContributionBadge } from '@/components/badge/ContributionBadge'
import { SubmissionCard } from '@/components/submission/SubmissionCard'
import { ActionLink, Avatar, Badge, Button, Card, EmptyState, Icon, Modal, PageHeader, Select, Textarea } from '@/components/ui'
import {
  authService,
  bookmarkService,
  commentService,
  notificationService,
  profileService,
  submissionService,
  topicFallback,
  topicService,
  userFallback,
} from '@/services/api'
import type { Comment, Deadline, Notification, ProfileStats, Submission, Topic, User } from '@/types/domain'
import { RANK_LABELS, getRankTier } from '@/utils/badges'
import { formatDateTime } from '@/utils/format'
import { useAsync } from '@/utils/hooks'

const fallbackProfileUser: User = {
  id: 'loading',
  displayName: 'Người học',
  email: '',
  role: 'learner',
  rank: 0,
}

const fallbackProfileStats: ProfileStats = {
  joinedTopicCount: 0,
  submissionCount: 0,
  createdTopicCount: 0,
  bookmarkCount: 0,
  submissionLikeCount: 0,
  answerCount: 0,
  answerLikeCount: 0,
}

export function PeerLearningPage() {
  const { id = 't1' } = useParams()
  const [sortBy, setSortBy] = useState('engagement')
  const { data: topic, loading: checkingAccess } = useAsync(() => topicService.getTopicById(id), topicFallback(id), [id])
  const mySubmission = topic.mySubmission
  const { data: submissions, loading } = useAsync(() => submissionService.getSubmissionsByTopic(id), [], [id])
  const accessDenied = !checkingAccess && !mySubmission

  const sortedSubmissions = [...submissions].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (sortBy === 'comments') return b.commentCount - a.commentCount
    if (sortBy === 'likes') return b.likeCount - a.likeCount
    return b.likeCount + b.commentCount - (a.likeCount + a.commentCount)
  })

  if (accessDenied) {
    return (
      <EmptyState
        title="Bạn cần nộp bài trước khi vào dạy chéo"
        description="Khu vực cộng đồng chỉ mở sau khi bạn hoàn thành bài tự học, để mọi người đều đóng góp trước khi đọc bài của nhau."
        actionLabel="Quay lại tự học"
        to={`/topics/${id}/learn`}
      />
    )
  }

  return (
    <div className="mx-auto max-w-[1160px]">
      <PeerPageHeader topicTitle={topic.title} />
      <SortBar count={submissions.length} sortBy={sortBy} onSortChange={setSortBy} />
      {mySubmission && <MySubmissionBlock submission={mySubmission} />}
      <div className="mt-5 grid gap-4">
        {loading ? (
          <>
            <PeerSubmissionSkeleton />
            <PeerSubmissionSkeleton />
          </>
        ) : sortedSubmissions.length ? (
          sortedSubmissions.map((submission) => {
            if (submission.user?.id === mySubmission?.user?.id) {
              return null
            }
            return (
              <PeerSubmissionCard
                key={submission._id}
                submission={submission}
                author={submission.user ?? fallbackProfileUser}
                to={`/topics/${id}/peer/${submission._id}`}
              />
            )
          })
        ) : (
          <EmptyState title="Chưa có bài cộng đồng nào" description="Hãy quay lại sau khi có thêm người học nộp bài." />
        )}
      </div>
    </div>
  )
}

function MySubmissionBlock({ submission }: { submission: Submission }) {
  const isPending = submission.status === 'Chưa duyệt'
  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm font-extrabold text-primary-container">Bài của bạn</span>
        {isPending && (
          <Badge tone="warning">Chờ duyệt</Badge>
        )}
        {submission.status === 'Đã duyệt' && (
          <Badge tone="success">Đã duyệt</Badge>
        )}
      </div>
      <Card className={`p-5 ${isPending ? 'border-amber bg-amber-light/30' : 'border-emerald-container'}`}>
        {isPending && (
          <div className="mb-4 flex items-start gap-2 rounded-md border border-amber bg-amber-light/50 px-3 py-2.5 text-sm font-semibold text-amber-900">
            <Icon name="clock" size={15} className="mt-0.5 shrink-0" />
            Bài nộp của bạn đang chờ admin duyệt trước khi hiển thị cho cộng đồng.
          </div>
        )}
        <div className="grid gap-3">
          <SubmissionContentBlock tone="understood" title="Đã hiểu" icon="check" content={submission.understood} />
          <SubmissionContentBlock tone="unclear" title="Chưa hiểu" icon="message" content={submission.notUnderstood} />
          {submission.resources.length > 0 && (
            <section className="rounded-md bg-surface-low p-5">
              <h2 className="text-lg font-extrabold text-primary-container">File đính kèm</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {submission.resources.map((file) => (
                  <div
                    key={file.id}
                    className="cursor-pointer rounded border border-border-subtle bg-white px-3 py-1.5 text-sm font-semibold text-ink-subtle hover:bg-surface-low"
                    onClick={() => {
                      if (!file.url) return
                      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
                      window.open(baseUrl + file.url, '_blank')
                    }}
                  >
                    {file.label}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between gap-4 border-t border-border-subtle pt-4 text-sm font-semibold text-ink-subtle">
          <span className="inline-flex items-center gap-1.5">
          </span>
          <Badge tone="neutral">{submission.isAnonymous ? 'Ẩn danh' : 'Công khai'}</Badge>
        </div>
      </Card>
    </div>
  )
}

function PeerPageHeader({ topicTitle }: { topicTitle: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-white p-6 shadow-card">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-[34px] font-extrabold leading-tight text-primary-container">Dạy chéo</h1>
          <p className="mt-2 text-base font-semibold text-ink-muted">{topicTitle}</p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-muted">
            Xem cách người khác giải thích lại kiến thức sau khi bạn đã hoàn thành bài của mình.
          </p>
        </div>
        <Badge tone="success">Đã nộp bài</Badge>
      </div>
    </div>
  )
}

function SortBar({ count, sortBy, onSortChange }: { count: number; sortBy: string; onSortChange: (value: string) => void }) {
  return (
    <div className="mt-5 flex flex-col gap-3 rounded-md border border-border-subtle bg-white px-4 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-bold text-ink-muted">{count} bài cộng đồng</p>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-ink-subtle">Sắp xếp theo</span>
        <Select
          aria-label="Sắp xếp bài cộng đồng"
          value={sortBy}
          onChange={(event) => onSortChange(event.target.value)}
          className="h-9 min-w-[190px] bg-white"
        >
          <option value="engagement">Tương tác cao nhất</option>
          <option value="newest">Mới nhất</option>
          <option value="comments">Nhiều bình luận</option>
          <option value="likes">Nhiều lượt thích</option>
        </Select>
      </div>
    </div>
  )
}

function PeerSubmissionCard({ submission, author, to }: { submission: Submission; author: User; to: string }) {
  const rankTier = getRankTier(author.rank)
  const roleLabel = RANK_LABELS[rankTier]
  const roleTone = rankTier >= 9 ? 'warning' : rankTier >= 7 ? 'brand' : rankTier >= 5 ? 'success' : rankTier >= 3 ? 'info' : 'neutral'
  const displayName = submission.isAnonymous ? 'Người học ẩn danh' : author.displayName
  const { data: currentUser } = useAsync(() => authService.getSessionUser().then(u => u ?? fallbackProfileUser), fallbackProfileUser)
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [likePending, setLikePending] = useState(false)
  const isOwnSubmission = currentUser.id === submission.user?.id
  const displayLikeCount = submission.likeCount + (liked ? 1 : 0)
  const displayDislikeCount = submission.dislikeCount + (disliked ? 1 : 0)

  async function toggleLike() {
    if (isOwnSubmission || likePending) return
    const nextLiked = !liked
    setLiked(nextLiked)
    if (nextLiked && disliked) setDisliked(false)
    setLikePending(true)
    try {
      await submissionService.toggleLike(submission._id, liked)
    } catch {
      setLiked(liked)
    } finally {
      setLikePending(false)
    }
  }

  async function toggleDislike() {
    if (isOwnSubmission || likePending) return
    const nextDisliked = !disliked
    setDisliked(nextDisliked)
    if (nextDisliked && liked) setLiked(false)
    setLikePending(true)
    try {
      await submissionService.toggleDislike(submission._id, disliked)
    } catch {
      setDisliked(disliked)
    } finally {
      setLikePending(false)
    }
  }

  const resources = submission.resources ?? submission.resources ?? []

  return (
    <Card className="group p-5 transition hover:border-secondary-fixed-dim hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={displayName} anonymous={submission.isAnonymous} userId={author.id} />
          <div className="min-w-0">
            <p className="truncate font-extrabold text-primary-container">{displayName}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge tone={roleTone}>{roleLabel}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <SubmissionContentBlock tone="understood" title="Đã hiểu" icon="check" content={submission.understood} />
        <SubmissionContentBlock tone="unclear" title="Chưa hiểu" icon="message" content={submission.notUnderstood} />
        {resources.length > 0 && (
          <section className="rounded-md bg-surface-low p-4">
            <p className="text-xs font-extrabold text-ink-muted">Tài liệu đính kèm</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {resources.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-ink transition hover:border-secondary-container hover:text-secondary-container"
                >
                  <Icon name="file" size={13} />
                  {r.label}
                </a>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-border-subtle pt-4">
        <button
          type="button"
          className={`inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold transition whitespace-nowrap ${liked
            ? 'border-secondary-container bg-secondary-fixed text-secondary-container'
            : 'border-border bg-white text-ink hover:border-secondary-container hover:bg-secondary-fixed hover:text-secondary-container'
            }`}
          onClick={toggleLike}
          disabled={isOwnSubmission || likePending}
          aria-pressed={liked}
          aria-label={isOwnSubmission ? 'Không thể thích bài của bạn' : liked ? 'Bỏ thích' : 'Thích'}
        >
          <Icon name="heart" size={15} />
          {isOwnSubmission ? 'Bài của bạn' : liked ? `Đã thích · ${displayLikeCount}` : `Thích · ${displayLikeCount}`}
        </button>
        {!isOwnSubmission && (
          <button
            type="button"
            className={`inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold transition whitespace-nowrap ${disliked
              ? 'border-error bg-error-container/40 text-error'
              : 'border-border bg-white text-ink hover:border-error hover:bg-error-container/30 hover:text-error'
              }`}
            onClick={toggleDislike}
            disabled={likePending}
            aria-pressed={disliked}
            aria-label={disliked ? 'Bỏ không thích' : 'Không thích'}
          >
            <Icon name="brokenHeart" size={15} />
            {disliked ? `Đã không thích · ${displayDislikeCount}` : `Không thích · ${displayDislikeCount}`}
          </button>
        )}
        <Link
          to={to}
          className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-white px-3 text-sm font-bold text-ink transition hover:border-secondary-container hover:bg-secondary-fixed hover:text-secondary-container whitespace-nowrap"
        >
          Xem {submission.commentCount} bình luận
        </Link>
      </div>
    </Card>
  )
}

function SubmissionContentBlock({
  title,
  icon,
  content,
  tone,
}: {
  title: string
  icon: 'check' | 'message'
  content: string
  tone: 'understood' | 'unclear'
}) {
  const toneClass = tone === 'understood' ? 'bg-emerald-container/55 text-emerald-dark' : 'bg-emerald-container/45 text-emerald-dark'
  return (
    <section className="rounded-md bg-surface-low p-4">
      <div className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-extrabold ${toneClass}`}>
        <Icon name={icon} size={14} />
        {title}
      </div>
      <p className="mt-3 text-sm leading-6 text-ink-muted">{content}</p>
    </section>
  )
}

function PeerSubmissionSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-surface-container" />
          <div>
            <div className="h-4 w-40 animate-pulse rounded bg-surface-container" />
            <div className="mt-2 h-4 w-28 animate-pulse rounded bg-surface-low" />
          </div>
        </div>
        <div className="h-6 w-20 animate-pulse rounded-full bg-surface-container" />
      </div>
      <div className="mt-5 grid gap-3">
        <div className="h-24 animate-pulse rounded-md bg-surface-low" />
        <div className="h-20 animate-pulse rounded-md bg-surface-low" />
      </div>
      <div className="mt-5 h-9 animate-pulse rounded-md bg-surface-container" />
    </Card>
  )
}

export function PeerDetailPage() {
  const { submissionId = 's1', id = 't1' } = useParams()
  const { data: submissions } = useAsync(() => submissionService.getSubmissionsByTopic(id), [], [id])
  const submission = submissions.find(s => s._id === submissionId) ?? null
  const author = userFallback(submission?.user?.id ?? 'u2')
  const topic = topicFallback(id)
  const [saved, setSaved] = useState(false)
  const [bookmarkPending, setBookmarkPending] = useState(false)

  useEffect(() => {
    setSaved(Boolean(submission?.saved))
  }, [submission?._id, submission?.saved])

  async function toggleBookmark() {
    if (!submission || bookmarkPending) return
    setBookmarkPending(true)
    try {
      const result = await bookmarkService.toggleBookmark(submission._id)
      setSaved(result.saved)
    } catch {
      setSaved(saved)
    } finally {
      setBookmarkPending(false)
    }
  }

  if (!submission) return null

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <Card className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={author.displayName} anonymous={submission.isAnonymous} userId={author.id} />
              <div>
                <p className="font-extrabold text-primary-container">{submission.isAnonymous ? 'Người học ẩn danh' : author.displayName}</p>
                <ContributionBadge rank={author.rank} compact anonymous={submission.isAnonymous} />
              </div>
            </div>
            <Button
              variant={saved ? 'secondary' : 'primary'}
              onClick={toggleBookmark}
              disabled={bookmarkPending}
              aria-pressed={saved}
              aria-label={saved ? 'Bỏ lưu bài này' : 'Lưu bài này'}
            >
              <Icon name="heart" size={15} />
              {saved ? 'Bỏ lưu' : 'Lưu bài'}
            </Button>
          </div>
          <div className="mt-6 grid gap-5 text-ink-muted">
            <section>
              <h2 className="font-extrabold text-primary-container">Điều đã hiểu</h2>
              <p className="mt-2">{submission.understood}</p>
            </section>
            <section>
              <h2 className="font-extrabold text-primary-container">Điều chưa hiểu</h2>
              <p className="mt-2">{submission.notUnderstood}</p>
            </section>
          </div>
        </Card>
        <CommentSection submission={submission} author={author} topicId={id} />
      </div>
      <aside className="space-y-4">
        <Card className="p-5">
          <p className="font-bold text-primary-container">{topic.title}</p>
          <p className="mt-2 text-sm text-ink-muted">{topic.description}</p>
        </Card>
        <ActionLink to={`/topics/${id}/peer`}>Quay lại dạy chéo</ActionLink>
      </aside>
    </div>
  )
}

type ThreadComment = Comment & {
  author: User
  role: 'Người học' | 'Dẫn Lối Tri Thức' | 'Bậc Thầy Cộng Đồng'
  replies: ThreadComment[]
}

function CommentSection({ submission, author, topicId }: { submission: Submission; author: User; topicId?: string }) {
  const [sortBy, setSortBy] = useState('newest')
  const { data: currentUser } = useAsync(() => authService.getSessionUser().then(u => u ?? fallbackProfileUser), fallbackProfileUser)
  const { data: flatComments, loading } = useAsync(() => commentService.getComments(submission._id, topicId), [], [submission._id, topicId])
  const [comments, setComments] = useState<ThreadComment[]>([])
  const [draft, setDraft] = useState('')
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([])

  useEffect(() => {
    setComments(buildCommentTree(flatComments, author))
  }, [flatComments, author.id])

  const totalCount = countThreadComments(comments)

  async function addRootComment() {
    const content = draft.trim()
    if (!content) return
    const created = await commentService.createComment(submission._id, content, topicId)
    setComments((current) => [{ ...created, author: currentUser, replies: [] }, ...current])
    setDraft('')
  }

  async function addReply(parentId: string, content: string) {
    const created = await commentService.createReply(submission._id, parentId, content, topicId)
    setComments((current) => addReplyToThread(current, parentId, { ...created, author: currentUser, replies: [] }))
  }

  async function toggleLike(comment: ThreadComment) {
    if (comment.userId === currentUser.id) return
    const commentId = comment.id
    const alreadyLiked = likedCommentIds.includes(commentId)
    setLikedCommentIds((current) => (alreadyLiked ? current.filter((id) => id !== commentId) : [...current, commentId]))
    setComments((current) =>
      updateThreadComment(current, commentId, (comment) => ({
        ...comment,
        likeCount: Math.max(0, comment.likeCount + (alreadyLiked ? -1 : 1)),
      })),
    )
    try {
      await commentService.toggleLike(commentId, alreadyLiked, submission._id)
    } catch {
      setLikedCommentIds((current) => (alreadyLiked ? [...current, commentId] : current.filter((id) => id !== commentId)))
      setComments((current) =>
        updateThreadComment(current, commentId, (comment) => ({
          ...comment,
          likeCount: Math.max(0, comment.likeCount + (alreadyLiked ? 1 : -1)),
        })),
      )
    }
  }

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'popular') return countCommentEngagement(b) - countCommentEngagement(a)
    if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-extrabold text-primary-container">Bình luận</h2>
          <Badge tone="neutral">{Math.max(totalCount, submission.commentCount)} thảo luận</Badge>
        </div>
        <Select aria-label="Sắp xếp bình luận" value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="h-9 bg-white sm:w-[170px]">
          <option value="newest">Mới nhất</option>
          <option value="popular">Nhiều tương tác</option>
          <option value="oldest">Cũ nhất</option>
        </Select>
      </div>

      <CommentComposer
        value={draft}
        onChange={setDraft}
        onSubmit={addRootComment}
        authorName={currentUser.displayName}
        authorId={currentUser.id}
        placeholder="Viết bình luận hoặc đặt câu hỏi..."
      />

      <div className="mt-5 grid gap-4">
        {sortedComments.length ? (
          sortedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              likedCommentIds={likedCommentIds}
              currentUserId={currentUser.id}
              onReply={addReply}
              onLike={toggleLike}
            />
          ))
        ) : loading || submission.commentCount > 0 ? (
          <CommentSkeleton />
        ) : (
          <EmptyState title="Chưa có bình luận" description="Hãy là người đầu tiên đặt câu hỏi hoặc bổ sung góc nhìn." />
        )}
      </div>
    </Card>
  )
}

function CommentComposer({
  value,
  onChange,
  onSubmit,
  authorName,
  authorId,
  placeholder,
  onCancel,
  compact = false,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void | Promise<void>
  authorName: string
  authorId?: string
  placeholder: string
  onCancel?: () => void
  compact?: boolean
}) {
  return (
    <div className={`mt-4 flex items-start gap-3 rounded-md border border-border-subtle bg-white p-3 ${compact ? 'ml-0' : ''}`}>
      <Avatar name={authorName} size="sm" userId={authorId} />
      <div className="min-w-0 flex-1">
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') onSubmit()
          }}
          placeholder={placeholder}
          className="min-h-[76px] bg-surface-low"
        />
        <div className="mt-2 flex justify-end gap-2">
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Hủy
            </Button>
          )}
          <Button size="sm" disabled={!value.trim()} onClick={onSubmit}>
            Gửi
          </Button>
        </div>
      </div>
    </div>
  )
}

function CommentItem({
  comment,
  likedCommentIds,
  currentUserId,
  onReply,
  onLike,
  depth = 0,
}: {
  comment: ThreadComment
  likedCommentIds: string[]
  currentUserId: string
  onReply: (parentId: string, content: string) => void | Promise<void>
  onLike: (comment: ThreadComment) => void | Promise<void>
  depth?: number
}) {
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyDraft, setReplyDraft] = useState('')
  const [repliesOpen, setRepliesOpen] = useState(true)
  const visibleReplies = repliesOpen ? comment.replies : comment.replies.slice(0, 0)
  const liked = likedCommentIds.includes(comment.id)
  const isOwnComment = currentUserId === comment.userId

  async function submitReply() {
    const content = replyDraft.trim()
    if (!content) return
    await onReply(comment.id, content)
    setReplyDraft('')
    setReplyOpen(false)
    setRepliesOpen(true)
  }

  return (
    <article className={depth ? 'ml-5 border-l border-border-subtle pl-4 md:ml-8' : ''}>
      <div className="rounded-md border border-border-subtle bg-white p-4">
        <div className="flex items-start gap-3">
          <Avatar name={comment.author.displayName} size="sm" userId={comment.author.id} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-ink">{comment.author.displayName}</p>
              <ContributionBadge rank={comment.author.rank} compact />
              <span className="text-xs font-semibold text-ink-subtle">{formatDateTime(comment.createdAt)}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-ink-muted">{comment.content}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-bold">
              <button
                type="button"
                className={`focus-ring rounded-sm ${liked ? 'text-secondary-container' : 'text-ink-muted hover:text-secondary-container'} disabled:cursor-not-allowed disabled:text-ink-subtle`}
                onClick={() => onLike(comment)}
                disabled={isOwnComment}
                aria-pressed={liked}
                aria-label={isOwnComment ? 'Không thể thích bình luận của bạn' : liked ? `Bỏ thích bình luận của ${comment.author.displayName}` : `Thích bình luận của ${comment.author.displayName}`}
              >
                {liked ? 'Đã thích' : 'Thích'}
              </button>
              <button type="button" className="text-ink-muted hover:text-secondary-container focus-ring rounded-sm" onClick={() => setReplyOpen(true)}>
                Trả lời
              </button>
              <button type="button" className="text-ink-muted hover:text-secondary-container focus-ring rounded-sm">
                Báo cáo
              </button>
              <span className="text-ink-subtle">{comment.likeCount} lượt thích</span>
            </div>
          </div>
        </div>
      </div>

      {replyOpen && (
        <CommentComposer
          compact
          value={replyDraft}
          onChange={setReplyDraft}
          onSubmit={submitReply}
          onCancel={() => setReplyOpen(false)}
          authorName={userFallback(currentUserId).displayName}
          authorId={currentUserId}
          placeholder={`Trả lời ${comment.author.displayName}...`}
        />
      )}

      {!!comment.replies.length && (
        <div className="mt-3 grid gap-3">
          <button
            type="button"
            className="w-fit text-sm font-bold text-secondary-container hover:text-secondary focus-ring rounded-sm"
            onClick={() => setRepliesOpen((value) => !value)}
          >
            {repliesOpen ? 'Ẩn phản hồi' : `Xem thêm ${comment.replies.length} phản hồi`}
          </button>
          {visibleReplies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              likedCommentIds={likedCommentIds}
              currentUserId={currentUserId}
              onReply={onReply}
              onLike={onLike}
              depth={Math.min(depth + 1, 2)}
            />
          ))}
        </div>
      )}
    </article>
  )
}

function RoleBadge({ role }: { role: ThreadComment['role'] }) {
  const tone = role === 'Bậc Thầy Cộng Đồng' ? 'brand' : role === 'Dẫn Lối Tri Thức' ? 'success' : 'neutral'
  return <Badge tone={tone}>{role}</Badge>
}

function CommentSkeleton() {
  return (
    <div className="grid gap-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="rounded-md border border-border-subtle bg-white p-4">
          <div className="flex gap-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-surface-container" />
            <div className="flex-1">
              <div className="h-4 w-40 animate-pulse rounded bg-surface-container" />
              <div className="mt-3 h-4 w-full animate-pulse rounded bg-surface-low" />
              <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-surface-low" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Local comment creation logic removed

function countThreadComments(comments: ThreadComment[]): number {
  return comments.reduce((sum, comment) => sum + 1 + countThreadComments(comment.replies), 0)
}

function countCommentEngagement(comment: ThreadComment): number {
  return comment.likeCount + countThreadComments(comment.replies)
}

function buildCommentTree(comments: Comment[], fallbackAuthor: User): ThreadComment[] {
  const nodes = comments.map((comment) => ({
    ...comment,
    author: userFallback(comment.userId) ?? fallbackAuthor,
    replies: [],
  })) as ThreadComment[]
  const byId = new Map(nodes.map((comment) => [comment.id, comment]))
  const roots: ThreadComment[] = []
  nodes.forEach((comment) => {
    if (comment.parentId && byId.has(comment.parentId)) {
      byId.get(comment.parentId)?.replies.push(comment)
      return
    }
    roots.push(comment)
  })
  return roots
}

function addReplyToThread(comments: ThreadComment[], parentId: string, reply: ThreadComment): ThreadComment[] {
  return comments.map((comment) => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [...comment.replies, reply],
      }
    }
    return { ...comment, replies: addReplyToThread(comment.replies, parentId, reply) }
  })
}

function updateThreadComment(comments: ThreadComment[], commentId: string, updater: (comment: ThreadComment) => ThreadComment): ThreadComment[] {
  return comments.map((comment) => {
    if (comment.id === commentId) return updater(comment)
    return { ...comment, replies: updateThreadComment(comment.replies, commentId, updater) }
  })
}

export function ProfilePage() {
  const { data: user } = useAsync(() => authService.getSessionUser().then(u => u ?? fallbackProfileUser), fallbackProfileUser)
  const { data: stats } = useAsync(
    () => user.id && user.id !== 'loading' ? profileService.getProfileStats(user.id) : Promise.resolve(fallbackProfileStats),
    fallbackProfileStats,
    [user.id],
  )
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <Card className="p-6">
        <Avatar name={user.displayName} size="lg" userId={user.id} />
        <h1 className="mt-4 text-2xl font-extrabold text-primary-container">{user.displayName}</h1>
        <p className="text-sm text-ink-muted">{user.email}</p>
        <div className="mt-4"><ContributionBadge rank={user.rank} /></div>
        <div className="mt-5 flex flex-wrap gap-2">{(user as any).interests?.map((interest: string) => <Badge key={interest}>{interest}</Badge>)}</div>
      </Card>
      <div className="space-y-5">
        <BadgeProgressCard rank={user.rank} />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="p-4"><p className="text-2xl font-extrabold">{stats.joinedTopicCount}</p><p className="text-sm text-ink-muted">chủ đề tham gia</p></Card>
          <Card className="p-4"><p className="text-2xl font-extrabold">{stats.submissionCount}</p><p className="text-sm text-ink-muted">bài đã nộp</p></Card>
          <Card className="p-4"><p className="text-2xl font-extrabold">{stats.submissionLikeCount}</p><p className="text-sm text-ink-muted">like bài nhận được</p></Card>
          <Card className="p-4"><p className="text-2xl font-extrabold">{stats.answerCount}</p><p className="text-sm text-ink-muted">câu trả lời</p></Card>
          <Card className="p-4"><p className="text-2xl font-extrabold">{stats.answerLikeCount}</p><p className="text-sm text-ink-muted">like câu trả lời</p></Card>
          <Card className="p-4"><p className="text-2xl font-extrabold">{stats.createdTopicCount}</p><p className="text-sm text-ink-muted">chủ đề đã tạo</p></Card>
          <Card className="p-4"><p className="text-2xl font-extrabold">{stats.bookmarkCount}</p><p className="text-sm text-ink-muted">bài đã lưu</p></Card>
        </div>
        <Card className="p-5">
          <h2 className="text-xl font-extrabold text-primary-container">Hoạt động gần đây</h2>
          <div className="mt-4 space-y-3 text-sm text-ink-muted">
            <p>Đã nộp bài Python Cơ Bản - List, Dict và Vòng lặp.</p>
            <p>Đã trả lời câu hỏi về epsilon-delta trong chủ đề Giải Tích 1.</p>
            <p>Đã lưu bài giải thích của Trần Quốc Hùng.</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export function NotificationsPage() {
  const { data: list, setData: setNotifications } = useAsync(() => notificationService.getNotifications(), [])
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const filtered = filterNotifications(list, filter)
  const groups = groupNotificationsByDate(filtered)

  async function markAllRead() {
    await notificationService.markAllRead()
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))
  }

  return (
    <div className="mx-auto max-w-[1160px]">
      <PageHeader
        title="Thông báo"
        description="Theo dõi bình luận, deadline và trạng thái duyệt chủ đề trong một nơi."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={markAllRead} disabled={!list.some((notification) => !notification.read)}>
              Đánh dấu tất cả đã đọc
            </Button>
          </div>
        }
      />

      <Card className="mt-6 overflow-x-auto border-border-subtle bg-white/75 p-2 shadow-none">
        <div className="flex min-w-max gap-1">
          {getNotificationFilters(list).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`h-9 rounded-full px-3.5 text-sm font-bold transition ${filter === item.value
                ? 'bg-secondary-container text-white'
                : 'bg-transparent text-ink-muted hover:bg-surface-low hover:text-ink'
                }`}
            >
              {item.label} <span className="opacity-75">({item.count})</span>
            </button>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid gap-7">
        {groups.map((group) => (
          <section key={group.title}>
            <div className="mb-3 flex items-center gap-3">
              <h2 className="text-sm font-extrabold uppercase tracking-[0.08em] text-ink-muted">{group.title}</h2>
              <span className="h-px flex-1 bg-border-subtle" />
              <span className="text-xs font-bold text-ink-subtle">{group.items.length} thông báo</span>
            </div>
            <div className="grid gap-3">
              {group.items.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
          </section>
        ))}
        {!filtered.length && <EmptyState title="Không có thông báo phù hợp" description="Thử đổi bộ lọc hoặc quay lại sau khi có hoạt động mới." />}
      </div>
    </div>
  )
}

function NotificationCard({ notification }: { notification: Notification }) {
  const config = getNotificationConfig(notification.type)
  const primaryAction = getPrimaryNotificationAction(notification)
  const actionStyle = getNotificationActionStyle(notification.type)
  return (
    <Card className={`group p-3.5 transition hover:-translate-y-0.5 hover:shadow-card-hover ${config.cardClass} ${!notification.read ? config.unreadClass : ''}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${config.iconClass}`}>
            <Icon name={config.icon} size={18} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={config.tone} className="px-2 py-0.5 text-[11px]">{config.label}</Badge>
              {!notification.read && <span className="h-2 w-2 rounded-full bg-error" aria-label="Thông báo chưa đọc" />}
            </div>
            <p className="mt-2 text-base font-extrabold leading-snug text-primary-container">{notification.title}</p>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-ink-muted">{notification.description}</p>
            <p className="mt-1.5 text-xs font-semibold text-ink-subtle">{formatDateTime(notification.createdAt)}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 lg:justify-end">
          <Link
            to={primaryAction.to}
            className={`inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-bold transition ${actionStyle}`}
          >
            {primaryAction.label}
          </Link>
          <Link
            to={`/notifications/${notification.id}`}
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-subtle transition hover:bg-surface-low hover:text-ink"
            aria-label="Mở tùy chọn thông báo"
          >
            <Icon name="more" size={17} />
          </Link>
        </div>
      </div>
    </Card>
  )
}

type NotificationFilter = 'all' | 'unread' | 'topic' | 'comment' | 'review' | 'deadline'

function getNotificationFilters(list: Notification[]): Array<{ label: string; value: NotificationFilter; count: number }> {
  return [
    { label: 'Tất cả', value: 'all', count: list.length },
    { label: 'Chưa đọc', value: 'unread', count: list.filter((item) => !item.read).length },
    { label: 'Chủ đề', value: 'topic', count: list.filter((item) => ['approved', 'rejected', 'closed'].includes(item.type)).length },
    { label: 'Bình luận', value: 'comment', count: list.filter((item) => item.type === 'comment').length },
    { label: 'Duyệt/Từ chối', value: 'review', count: list.filter((item) => item.type === 'approved' || item.type === 'rejected').length },
    { label: 'Deadline', value: 'deadline', count: list.filter((item) => item.type === 'deadline').length },
  ]
}

function filterNotifications(list: Notification[], filter: NotificationFilter) {
  if (filter === 'unread') return list.filter((item) => !item.read)
  if (filter === 'topic') return list.filter((item) => ['approved', 'rejected', 'closed'].includes(item.type))
  if (filter === 'comment') return list.filter((item) => item.type === 'comment')
  if (filter === 'review') return list.filter((item) => item.type === 'approved' || item.type === 'rejected')
  if (filter === 'deadline') return list.filter((item) => item.type === 'deadline')
  return list
}

function groupNotificationsByDate(list: Notification[]) {
  const today = startOfDay(new Date()).getTime()
  const yesterday = today - 24 * 60 * 60 * 1000
  const groups = [
    { title: 'Hôm nay', items: [] as Notification[] },
    { title: 'Hôm qua', items: [] as Notification[] },
    { title: 'Cũ hơn', items: [] as Notification[] },
  ]

  for (const notification of list) {
    const time = startOfDay(new Date(notification.createdAt)).getTime()
    if (time === today) groups[0].items.push(notification)
    else if (time === yesterday) groups[1].items.push(notification)
    else groups[2].items.push(notification)
  }

  return groups.filter((group) => group.items.length > 0)
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getPrimaryNotificationAction(notification: Notification) {
  if (notification.type === 'comment') return { label: 'Xem bình luận', to: notification.actionTo }
  if (notification.type === 'rejected') return { label: 'Chỉnh sửa lại', to: notification.actionTo }
  if (notification.type === 'deadline') return { label: notification.actionLabel || 'Vào học', to: notification.actionTo }
  return { label: notification.actionLabel || 'Xem chủ đề', to: notification.actionTo }
}

function getNotificationActionStyle(type: Notification['type']) {
  if (type === 'rejected' || type === 'deadline') {
    return 'bg-secondary-container text-white hover:bg-secondary'
  }
  return 'border border-border bg-white text-ink-muted hover:border-secondary-container hover:bg-surface-low hover:text-ink'
}

function getNotificationConfig(type: Notification['type']) {
  const configs: Record<Notification['type'], {
    label: string
    icon: Parameters<typeof Icon>[0]['name']
    tone: Parameters<typeof Badge>[0]['tone']
    iconClass: string
    cardClass: string
    unreadClass: string
  }> = {
    comment: {
      label: 'Bình luận',
      icon: 'message',
      tone: 'neutral',
      iconClass: 'bg-[#faf5ef] text-[#8a7463]',
      cardClass: 'border-border-subtle bg-white',
      unreadClass: 'bg-[#fffaf7]',
    },
    deadline: {
      label: 'Deadline',
      icon: 'clock',
      tone: 'warning',
      iconClass: 'bg-amber-light/60 text-amber-900',
      cardClass: 'border-border-subtle bg-white',
      unreadClass: 'bg-amber-light/15',
    },
    approved: {
      label: 'Đã duyệt',
      icon: 'check',
      tone: 'success',
      iconClass: 'bg-emerald-container/60 text-emerald-dark',
      cardClass: 'border-border-subtle bg-white',
      unreadClass: 'bg-emerald-container/15',
    },
    rejected: {
      label: 'Bị từ chối',
      icon: 'close',
      tone: 'danger',
      iconClass: 'bg-error-container/70 text-error',
      cardClass: 'border-l-4 border-l-error-container bg-error-container/10',
      unreadClass: 'bg-error-container/20',
    },
    closed: {
      label: 'Đã đóng',
      icon: 'lock',
      tone: 'neutral',
      iconClass: 'bg-surface-low text-ink-muted',
      cardClass: 'border-border-subtle bg-white',
      unreadClass: 'bg-surface-low/60',
    },
  }
  return configs[type] ?? configs.comment
}
export function NotificationDetailPage() {
  const { id = 'n1' } = useParams()
  const { data: notification } = useAsync(() => notificationService.getNotification(id), undefined as never, [id])
  if (!notification) return null
  const config = getNotificationConfig(notification.type)
  return (
    <Card className="mx-auto max-w-3xl p-7">
      <div className="flex items-center gap-3">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md ${config.iconClass}`}>
          <Icon name={config.icon} size={22} />
        </span>
        <div>
          <Badge tone={config.tone}>{config.label}</Badge>
          <p className="mt-1 text-xs font-semibold text-ink-subtle">Chi tiết thông báo</p>
        </div>
      </div>
      <h1 className="mt-5 text-3xl font-extrabold text-primary-container">{notification.title}</h1>
      <p className="mt-3 text-ink-muted">{notification.description}</p>
      <p className="mt-2 text-sm text-ink-subtle">{formatDateTime(notification.createdAt)}</p>
      <div className="mt-6"><ActionLink to={notification.actionTo} variant="primary">{notification.actionLabel}</ActionLink></div>
    </Card>
  )
}

export function CalendarPage() {
  const { data: topics } = useAsync(() => topicService.getParticipatedTopics(), [])
  const deadlines: Deadline[] = topics
    .map(t => ({
      id: `deadline-${t._id}`,
      topicId: t._id,
      title: t.title,
      dueAt: t.participationStartTime
        ? new Date(new Date(t.participationStartTime).getTime() + t.windowHours * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: t.mySubmission ? 'submitted' : 'not_submitted',
    }))
  const [filter, setFilter] = useState<Deadline['status'] | 'all'>('all')
  const filteredDeadlines = filter === 'all' ? deadlines : deadlines.filter((deadline) => deadline.status === filter)
  const summary = {
    all: deadlines.length,
    notSubmitted: deadlines.filter((deadline) => deadline.status === 'not_submitted').length,
    submitted: deadlines.filter((deadline) => deadline.status === 'submitted').length,
    expired: deadlines.filter((deadline) => deadline.status === 'expired').length,
  }

  return (
    <div className="mx-auto max-w-[1160px]">
      <CalendarPageHeader />
      <DeadlineSummary summary={summary} />
      <DeadlineTabs active={filter} onChange={setFilter} summary={summary} />
      <div className="mt-5 grid gap-4">
        {filteredDeadlines.length ? (
          filteredDeadlines.map((deadline) => <DeadlineCard key={deadline.id} deadline={deadline} />)
        ) : (
          <EmptyState title="Không có deadline phù hợp" description="Thử chọn trạng thái khác để xem thêm lịch học." />
        )}
      </div>
    </div>
  )
}

function CalendarPageHeader() {
  return (
    <div className="rounded-md border border-border-subtle bg-white p-6 shadow-card">
      <h1 className="text-[34px] font-extrabold leading-tight text-primary-container">Lịch học & hạn nộp</h1>
      <p className="mt-2 max-w-3xl text-base leading-7 text-ink-muted">
        Theo dõi các chủ đề đang học, đã nộp và những deadline sắp hết hạn.
      </p>
    </div>
  )
}

function DeadlineSummary({ summary }: { summary: { all: number; notSubmitted: number; submitted: number; expired: number } }) {
  const items = [
    { label: 'Tất cả', value: summary.all },
    { label: 'Chưa nộp', value: summary.notSubmitted },
    { label: 'Đã nộp', value: summary.submitted },
    { label: 'Hết hạn', value: summary.expired },
  ]
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="p-4">
          <p className="text-2xl font-extrabold leading-none text-primary-container">{item.value}</p>
          <p className="mt-1 text-xs font-semibold text-ink-subtle">{item.label}</p>
        </Card>
      ))}
    </div>
  )
}

function DeadlineTabs({
  active,
  onChange,
  summary,
}: {
  active: Deadline['status'] | 'all'
  onChange: (value: Deadline['status'] | 'all') => void
  summary: { all: number; notSubmitted: number; submitted: number; expired: number }
}) {
  const tabs: Array<{ label: string; value: Deadline['status'] | 'all'; count: number }> = [
    { label: 'Tất cả', value: 'all', count: summary.all },
    { label: 'Chưa nộp', value: 'not_submitted', count: summary.notSubmitted },
    { label: 'Đã nộp', value: 'submitted', count: summary.submitted },
    { label: 'Hết hạn', value: 'expired', count: summary.expired },
  ]
  return (
    <Card className="mt-4 p-3">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`h-9 rounded-full px-3.5 text-sm font-bold transition whitespace-nowrap ${active === tab.value
              ? 'bg-secondary-container text-white'
              : 'bg-transparent text-ink-muted hover:bg-surface-low hover:text-ink'
              }`}
            onClick={() => onChange(tab.value)}
          >
            {tab.label} <span className="opacity-75">({tab.count})</span>
          </button>
        ))}
      </div>
    </Card>
  )
}

function DeadlineCard({ deadline }: { deadline: Deadline }) {
  const config = getDeadlineConfig(deadline)
  return (
    <Link
      to={config.to}
      className={`group block rounded-md border border-border-subtle bg-white p-5 shadow-card outline-none transition hover:-translate-y-0.5 hover:border-secondary-fixed-dim hover:shadow-card-hover focus-visible:border-secondary-container focus-visible:ring-2 focus-visible:ring-secondary-container/20 ${config.cardClass}`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={config.badgeTone}>{config.statusLabel}</Badge>
            <span className={`text-sm font-bold ${config.relativeClass}`}>{config.relativeLabel}</span>
          </div>
          <h2 className="mt-3 text-xl font-extrabold leading-snug text-primary-container">{deadline.title}</h2>
          <p className="mt-1 text-sm font-semibold text-ink-muted">Hạn nộp: {formatDeadlineDisplay(deadline.dueAt)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-white px-4 text-sm font-bold text-ink transition group-hover:border-secondary-container group-hover:bg-secondary-fixed group-hover:text-secondary-container">
            {config.cta}
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-low text-ink-subtle transition group-hover:bg-secondary-fixed group-hover:text-secondary-container">
            <Icon name="arrowRight" size={16} />
          </span>
        </div>
      </div>
    </Link>
  )
}

function getDeadlineConfig(deadline: Deadline) {
  if (deadline.status === 'submitted') {
    return {
      badgeTone: 'success' as const,
      statusLabel: 'Đã nộp',
      relativeLabel: 'Đã nộp',
      relativeClass: 'text-emerald-dark',
      cta: 'Xem bài của tôi',
      to: `/topics/${deadline.topicId}/my-submission`,
      cardClass: 'bg-emerald-container/18',
    }
  }
  if (deadline.status === 'expired') {
    return {
      badgeTone: 'danger' as const,
      statusLabel: 'Hết hạn',
      relativeLabel: 'Đã hết hạn',
      relativeClass: 'text-error',
      cta: 'Xem kết quả',
      to: `/topics/${deadline.topicId}`,
      cardClass: 'bg-error-container/15',
    }
  }
  return {
    badgeTone: 'warning' as const,
    statusLabel: 'Chưa nộp',
    relativeLabel: deadline.topicId === 't1' ? 'Còn 18 giờ 32 phút' : 'Sắp đến hạn',
    relativeClass: 'text-amber-900',
    cta: 'Vào học / Nộp bài',
    to: `/topics/${deadline.topicId}/learn`,
    cardClass: 'bg-amber-light/30',
  }
}

function formatDeadlineDisplay(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export function BookmarkPage() {
  const { data: bookmarks, setData: setBookmarks } = useAsync(() => bookmarkService.getBookmarks(), [])

  async function removeBookmark(bookmarkId: string) {
    await bookmarkService.deleteBookmark(bookmarkId)
    setBookmarks((current) => current.filter((b) => b._id !== bookmarkId))
  }

  return (
    <div>
      <PageHeader title="Bookmark / Bài đã lưu" description="Những bài giải thích hay được lưu lại từ khu vực dạy chéo." />
      <div className="mt-6 grid gap-4">
        {bookmarks.length ? (
          bookmarks.map((bookmark) => (
            <Card key={bookmark._id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink-muted">
                  Bài nộp đã lưu
                </p>
                <Link
                  to={bookmark.target.topicId && bookmark.target.submissionId
                    ? `/topics/${bookmark.target.topicId}/peer/${bookmark.target.submissionId}`
                    : '#'}
                  className="mt-1 block text-sm font-bold text-secondary-container hover:underline truncate"
                >
                  Xem bài nộp →
                </Link>
                <p className="mt-1 text-xs text-ink-subtle">{formatDateTime(bookmark.createdAt)}</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => removeBookmark(bookmark._id)}>
                Bỏ lưu
              </Button>
            </Card>
          ))
        ) : (
          <EmptyState title="Chưa có bài đã lưu" description="Khi thấy một bài hay trong dạy chéo, hãy lưu lại để xem sau." />
        )}
      </div>
    </div>
  )
}

export function CommunityInsightPage() {
  const { id = '' } = useParams()
  const { data: submissions } = useAsync(
    () => id ? submissionService.getSubmissionsByTopic(id) : Promise.resolve([]),
    [],
    [id],
  )
  const insight = {
    understoodPoints: submissions.map(s => s.understood).filter(Boolean),
    unclearPoints: submissions.map(s => s.notUnderstood).filter(Boolean),
    submissionCount: submissions.length,
  }
  if (!submissions.length) return null
  return (
    <div>
      <PageHeader title="Community Insight" description="Tổng hợp điểm nhiều người đã hiểu, chưa hiểu và câu hỏi phổ biến từ bài nộp." />
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <InsightList title="Nhiều người đã hiểu" items={insight.understoodPoints} tone="success" />
        <InsightList title="Nhiều người chưa hiểu" items={insight.unclearPoints} tone="success" />
      </div>
      <Card className="mt-5 p-5 text-sm font-semibold text-ink-muted">Dữ liệu tổng hợp từ {insight.submissionCount} bài nộp.</Card>
    </div>
  )
}

function InsightList({ title, items, tone }: { title: string; items: string[]; tone: 'success' | 'warning' | 'brand' }) {
  return (
    <Card className="p-5">
      <Badge tone={tone}>{title}</Badge>
      <ul className="mt-4 space-y-3 text-sm text-ink-muted">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <Icon name="check" size={16} className="mt-0.5 shrink-0 text-secondary-container" />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  )
}

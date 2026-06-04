import { Link } from 'react-router-dom'
import { Avatar, Badge, Card, Icon } from '@/components/ui'
import { ContributionBadge } from '@/components/badge/ContributionBadge'
import type { Submission, User } from '@/types/domain'
import { minutesToReadable } from '@/utils/format'

export function SubmissionCard({
  submission,
  author,
  to,
  saved = false,
  onToggleBookmark,
}: {
  submission: Submission
  author: User
  to: string
  saved?: boolean
  onToggleBookmark?: () => void | Promise<void>
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={author.displayName} anonymous={submission.isAnonymous} userId={author.id} />
          <div>
            <p className="font-bold text-primary-container">{submission.isAnonymous ? 'Người học ẩn danh' : author.displayName}</p>
            <div className="mt-1">
              <ContributionBadge rank={author.rank} compact anonymous={submission.isAnonymous} />
            </div>
          </div>
        </div>
        {onToggleBookmark && (
          <button
            type="button"
            onClick={onToggleBookmark}
            aria-pressed={saved}
            aria-label={saved ? 'Bỏ lưu bài này' : 'Lưu bài này'}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold transition ${
              saved
                ? 'border-secondary-container bg-secondary-fixed text-secondary-container'
                : 'border-border-subtle bg-white text-ink-subtle hover:border-secondary-container hover:text-secondary-container'
            }`}
          >
            <Icon name={saved ? 'liked' : 'heart'} size={13} />
            {saved ? 'Đã lưu' : 'Lưu'}
          </button>
        )}
      </div>
      <div className="mt-4 grid gap-3 text-sm text-ink-muted">
        <p><span className="font-bold text-ink">Đã hiểu:</span> {submission.understood}</p>
        <p><span className="font-bold text-ink">Chưa hiểu:</span> {submission.notUnderstood}</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border-subtle pt-4 text-sm font-semibold text-ink-muted">
        <span className="inline-flex items-center gap-1"><Icon name="heart" size={15} /> {submission.likeCount}</span>
        <span className="inline-flex items-center gap-1"><Icon name="message" size={15} /> {submission.commentCount}</span>
        <Link className="ml-auto whitespace-nowrap font-bold text-secondary-container hover:text-secondary" to={to}>Xem bình luận</Link>
      </div>
    </Card>
  )
}

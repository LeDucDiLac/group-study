import { Link } from 'react-router-dom'
import { Avatar } from '@/components/ui'

interface UserLinkProps {
  userId?: string
  displayName: string
  anonymous?: boolean
  /** Kích thước avatar */
  size?: 'sm' | 'md' | 'lg'
  /** Class bổ sung cho wrapper */
  className?: string
  /** Ẩn tên, chỉ hiện avatar */
  avatarOnly?: boolean
}

/**
 * Avatar + tên người dùng. Nếu không ẩn danh và có userId thì bọc trong Link
 * dẫn đến /profile/:userId. Dùng chung ở TopicCard, SubmissionCard, CommentItem.
 */
export function UserLink({ userId, displayName, anonymous = false, size = 'md', className = '', avatarOnly = false }: UserLinkProps) {
  const isClickable = !anonymous && !!userId

  const content = (
    <span className={`inline-flex items-center gap-2 min-w-0 ${className}`}>
      <Avatar name={displayName} userId={isClickable ? userId : undefined} anonymous={anonymous} size={size} />
      {!avatarOnly && (
        <span className="min-w-0 truncate font-bold text-primary-container">
          {displayName}
        </span>
      )}
    </span>
  )

  if (!isClickable) return content

  return (
    <Link
      to={`/profile/${userId}`}
      className={`inline-flex items-center gap-2 min-w-0 rounded-sm transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <Avatar name={displayName} userId={userId} anonymous={anonymous} size={size} />
      {!avatarOnly && (
        <span className="min-w-0 truncate font-bold text-primary-container hover:underline">
          {displayName}
        </span>
      )}
    </Link>
  )
}

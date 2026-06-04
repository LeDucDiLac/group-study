import { useParams, Link } from 'react-router-dom'
import { BadgeProgressCard, ContributionBadge } from '@/components/badge/ContributionBadge'
import { Avatar, Badge, Card, EmptyState, Icon, PageHeader } from '@/components/ui'
import { profileService } from '@/services/api'
import { RANK_LABELS, getRankTier } from '@/utils/badges'
import { useAsync } from '@/utils/hooks'
import type { PublicProfile } from '@/types/domain'

export function PublicProfilePage() {
  const { userId = '' } = useParams()
  const { data: profile, loading, error } = useAsync(
    () => userId ? profileService.getPublicProfile(userId) : Promise.reject('no id'),
    null as PublicProfile | null,
    [userId],
  )

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="p-6">
          <div className="h-14 w-14 animate-pulse rounded-full bg-surface-container" />
          <div className="mt-4 h-6 w-40 animate-pulse rounded bg-surface-container" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded bg-surface-low" />
        </Card>
        <div className="space-y-5">
          <div className="h-24 animate-pulse rounded-md bg-surface-low" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-md bg-surface-low" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return <EmptyState title="Không tìm thấy người dùng" description="Hồ sơ này không tồn tại hoặc đã bị xóa." />
  }

  const rankTier = getRankTier(profile.rank)
  const roleLabel = RANK_LABELS[rankTier] || 'Tập sự'

  const statItems = [
    { value: profile.summary.topicsParticipated, label: 'Chủ đề tham gia', icon: 'users' as const },
    { value: profile.summary.submissions, label: 'Bài đã nộp', icon: 'file' as const },
    { value: profile.summary.topicsCreated, label: 'Chủ đề đã tạo', icon: 'check' as const },
    { value: profile.summary.likesReceived, label: 'Lượt thích nhận được', icon: 'heart' as const },
    { value: profile.summary.liked, label: 'Nội dung đã thích', icon: 'liked' as const },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      {/* Cột trái */}
      <div className="space-y-5">
        <Card className="p-6">
          <Avatar name={profile.displayName} size="lg" userId={profile.id} />
          <h1 className="mt-4 text-2xl font-extrabold text-primary-container">{profile.displayName}</h1>
          {profile.email && (
            <p className="mt-0.5 text-sm text-ink-muted">{profile.email}</p>
          )}
          {profile.bio && (
            <p className="mt-3 text-sm leading-6 text-ink-muted">{profile.bio}</p>
          )}
          <div className="mt-4">
            <ContributionBadge rank={profile.rank} />
          </div>
        </Card>

        <BadgeProgressCard rank={profile.rank} />
      </div>

      {/* Cột phải */}
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {statItems.map(({ value, label, icon }) => (
            <Card key={label} className="flex flex-col gap-1 p-4">
              <div className="flex items-center gap-2">
                <Icon name={icon} size={15} className="text-secondary-container" />
                <p className="text-2xl font-extrabold text-primary-container">{value}</p>
              </div>
              <p className="text-xs font-semibold text-ink-muted">{label}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

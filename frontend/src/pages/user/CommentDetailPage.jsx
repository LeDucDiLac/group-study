import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { submissions, comments, profiles, topics } from '@/data/mockData'
import { ShapeLock } from '@/shapes'
import { Card, Avatar, Badge, Button, Textarea, Divider, Icon } from '@/components/ui'

function Comment({ comment, allComments, depth = 0, onAddReply }) {
  const author = profiles.find(p => p.id === comment.user_id)
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const children = allComments.filter(c => c.parent_id === comment.id)

  return (
    <div className={depth > 0 ? 'ml-8 border-l-2 border-border-subtle pl-4' : ''}>
      <div className="py-3">
        <div className="flex items-center gap-2 mb-2">
          <Avatar name={author?.display_name} size="sm" />
          <div>
            <span className="text-sm font-medium text-ink">{author?.display_name ?? 'Unknown'}</span>
            <span className="text-xs text-ink-muted ml-2">
              {new Date(comment.created_at).toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
            </span>
          </div>
        </div>
        <p className="text-sm text-ink leading-relaxed pl-8">{comment.content}</p>
        <div className="pl-8 mt-1.5">
          <button onClick={() => setShowReply(v => !v)}
            className="text-xs text-ink-muted hover:text-secondary-container transition-colors">
            {showReply ? 'Huỷ' : 'Trả lời'}
          </button>
        </div>

        {showReply && (
          <div className="pl-8 mt-2 space-y-2">
            <Textarea
              id={`reply-${comment.id}`}
              rows={2} value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Viết phản hồi..."
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowReply(false)}>Huỷ</Button>
              <Button
                size="sm"
                disabled={!replyText.trim()}
                onClick={() => {
                  onAddReply(comment.id, replyText)
                  setShowReply(false)
                  setReplyText('')
                }}
              >
                Gửi
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      {children.map(child => (
        <Comment
          key={child.id}
          comment={child}
          allComments={allComments}
          depth={depth + 1}
          onAddReply={onAddReply}
        />
      ))}
    </div>
  )
}

export default function CommentDetailPage() {
  const { id: topicId, sid } = useParams()
  const navigate = useNavigate()
  const sub = submissions.find(s => s.id === sid) ?? submissions[0]
  const author = profiles.find(p => p.id === sub?.user_id)
  const topic = topics.find(t => t.id === topicId) ?? topics[0]

  const [newComment, setNewComment] = useState('')
  const [localComments, setLocalComments] = useState(() =>
    comments.filter(c => c.submission_id === sub?.id)
  )
  const subComments = localComments.filter(c => !c.parent_id)

  const addComment = (content, parentId = null) => {
    const text = content.trim()
    if (!text) return
    setLocalComments(prev => [
      ...prev,
      {
        id: `local-${Date.now()}-${prev.length}`,
        submission_id: sub.id,
        user_id: 'u1',
        parent_id: parentId,
        content: text,
        created_at: new Date().toISOString(),
      },
    ])
  }

  return (
    <div className="content-max py-8">
      {/* Back */}
      <button onClick={() => navigate(`/topics/${topicId}/peer`)}
        className="text-sm text-ink-muted hover:text-ink mb-6 flex items-center gap-1.5 transition-colors">
        ← Quay lại dạy chéo
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main — Submission content */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6">
            {/* Author header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Avatar
                  name={sub.is_anonymous ? '?' : author?.display_name}
                  anonymous={sub.is_anonymous}
                  size="lg"
                />
                <div>
                  <p className="font-semibold text-ink">
                    {sub.is_anonymous ? 'Người dùng ẩn danh' : author?.display_name}
                  </p>
                  <p className="text-xs text-ink-muted">
                    Nộp lúc {new Date(sub.created_at).toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {sub.is_anonymous && <Badge variant="neutral">Ẩn danh</Badge>}
                <div className="flex items-center gap-1 text-xs text-ink-muted">
                  <ShapeLock size={14} variant="primary" className="opacity-50" />
                  <span>Đã khóa</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-5">
              <div>
              <p className="text-xs font-semibold text-emerald uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Icon name="check" size={14} /> Những gì tôi hiểu
              </p>
                <div className="bg-emerald/5 border border-emerald/20 rounded-md p-4">
                  <p className="text-sm text-ink leading-relaxed whitespace-pre-line">{sub.understood}</p>
                </div>
              </div>
              <Divider />
              <div>
              <p className="text-xs font-semibold text-amber uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Icon name="question" size={14} /> Những gì tôi chưa hiểu
              </p>
                <div className="bg-amber/5 border border-amber/20 rounded-md p-4">
                  <p className="text-sm text-ink-muted leading-relaxed whitespace-pre-line">{sub.not_understood}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Comments section */}
          <Card className="p-6">
            <h3 className="font-semibold text-primary-container mb-4">
              <span className="inline-flex items-center gap-2"><Icon name="message" size={18} /> Bình luận ({subComments.length})</span>
            </h3>

            {/* Comment list */}
            {subComments.length > 0 ? (
              <div className="divide-y divide-border-subtle">
                {subComments.map(c => (
                  <Comment
                    key={c.id}
                    comment={c}
                    allComments={localComments}
                    onAddReply={(parentId, content) => addComment(content, parentId)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted text-center py-6">
                Chưa có bình luận nào. Hãy là người đầu tiên!
              </p>
            )}

            <Divider className="my-4" />

            {/* New comment input */}
            <div className="space-y-2">
              <Textarea
                id="new-comment" rows={3} value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Viết bình luận, đặt câu hỏi, hoặc chia sẻ quan điểm của bạn..."
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  disabled={!newComment.trim()}
                  onClick={() => {
                    addComment(newComment)
                    setNewComment('')
                  }}
                >
                  Đăng bình luận
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="p-5">
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-3">Chủ đề</p>
            <p className="font-semibold text-primary-container text-sm leading-snug mb-2">{topic.title}</p>
            <Badge variant="neutral">{topic.category}</Badge>
            <div className="mt-4 space-y-2 text-xs text-ink-muted">
              <div className="flex justify-between">
                <span>Tổng bài nộp</span>
                <span className="font-medium text-ink">{topic.submission_count}</span>
              </div>
              <div className="flex justify-between">
                <span>Window</span>
                <span className="font-medium text-ink">{topic.window_days} ngày</span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/topics/${topicId}/peer`)}
              className="mt-4 text-sm text-secondary-container hover:underline block">
              ← Xem tất cả bài nộp
            </button>
          </Card>

          <Card className="p-5 bg-surface-low">
            <p className="text-xs text-ink-muted mb-2">Gợi ý khi bình luận</p>
            <ul className="space-y-1.5">
              {[
                'Trả lời câu hỏi mà người viết chưa hiểu',
                'Chia sẻ cách tiếp cận khác',
                'Đặt câu hỏi để hiểu sâu hơn',
                'Đừng phê phán, hãy xây dựng',
              ].map(tip => (
                <li key={tip} className="text-xs text-ink-muted flex gap-1.5">
                  <span className="shrink-0">•</span>{tip}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

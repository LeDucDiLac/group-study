// Simplified Admin Review Page
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Badge, Button, Card, Modal, Textarea, Icon } from '@/components/ui'
import { authService, topicService, submissionService } from '@/services/api'
import type { Topic, Submission } from '@/types/domain'
import { formatDate } from '@/utils/format'

import { ResourceList } from '@/components/topic/TopicCard'

/**
 * Single admin page that allows reviewing pending topics and submissions.
 * It shows a preview pane on the left and a combined table of pending items on the right.
 */
export function AdminPage() {
  const navigate = useNavigate()

  // Fetch both datasets once on mount – combobox only switches display, never re-fetches
  const [topics, setTopics] = useState<Topic[]>([])
  const [submissions, setSubmissions] = useState<Array<{ topicId: string; topicTitle: string; submission: Submission }>>([])
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await authService.logout()
      navigate('/login', { replace: true })
    } catch (e) {
      console.error('Logout failed', e)
    } finally {
      setLoggingOut(false)
    }
  }

  useEffect(() => {
    let mounted = true
    setLoading(true)
    Promise.all([
      topicService.getUnapprovedTopics(),
      submissionService.getUnapprovedSubmissions(),
    ])
      .then(([topicsData, subsData]) => {
        if (mounted) {
          setTopics(topicsData)
          setSubmissions(subsData)
        }
      })
      .catch((err) => console.error('Failed to load admin data', err))
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, []) // empty deps → runs exactly once on page load

  const [viewMode, setViewMode] = useState<'topics' | 'submissions'>('topics');
  
  // State for the previewed item – either a topic or a submission
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  // State for Rejection Modal
  const [rejectTarget, setRejectTarget] = useState<{ type: 'topic' | 'submission'; id: string } | null>(null)
  const [rejectionReasonInput, setRejectionReasonInput] = useState('')

  // Handlers for approving/rejecting topics
  const handleApproveTopic = async (id: string) => {
    try {
      await topicService.approveTopic(id);
      setTopics((prev) => prev.filter((t) => t._id !== id));
      setSelectedTopic(null);
    } catch (e) {
      console.error('Approve topic failed', e);
    }
  };

  const handleRejectTopic = async (id: string, reasonText: string) => {
    try {
      await topicService.rejectTopic(id, { rejectionReason: reasonText });
      setTopics((prev) => prev.filter((t) => t._id !== id));
      setSelectedTopic(null);
    } catch (e) {
      console.error('Reject topic failed', e);
    }
  };

  // Handlers for approving/rejecting submissions
  const handleApproveSubmission = async (submissionId: string) => {
    try {
      await submissionService.approveSubmission(submissionId);
      setSubmissions((prev) => prev.filter((s) => s.submission._id !== submissionId));
      setSelectedSubmission(null);
    } catch (e) {
      console.error('Approve submission failed', e);
    }
  };

  const handleRejectSubmission = async (submissionId: string, reasonText: string) => {
    try {
      await submissionService.rejectSubmission(submissionId, reasonText);
      setSubmissions((prev) => prev.filter((s) => s.submission._id !== submissionId));
      setSelectedSubmission(null);
    } catch (e) {
      console.error('Reject submission failed', e);
    }
  };

  // Handlers to select an item
  const selectTopic = (topic: Topic) => {
    setSelectedTopic(topic)
    setSelectedSubmission(null)
  }

  const selectSubmission = (sub: Submission) => {
    setSelectedSubmission(sub)
    setSelectedTopic(null)
  }

  const handleViewModeChange = (mode: 'topics' | 'submissions') => {
    setViewMode(mode)
    setSelectedTopic(null)
    setSelectedSubmission(null)
  }

  // Render preview based on selection
  const renderPreview = () => {
    if (selectedTopic) {
      return (
        <Card className="p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-primary-container">Xem trước chủ đề</h2>
              <Badge tone="warning">Chưa duyệt</Badge>
            </div>
            <p className="mt-3 text-base font-bold text-primary-container">{selectedTopic.title}</p>
            <p className="mt-2 text-sm leading-6 text-ink-muted">{selectedTopic.description}</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {selectedTopic.tags.map((t) => (
              <Badge key={t} tone="neutral">{t}</Badge>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md bg-surface-low p-3">
              <p className="text-xs font-semibold text-ink-muted">Window học</p>
              <p className="mt-1 text-lg font-extrabold text-primary-container">{selectedTopic.windowHours} giờ</p>
            </div>
            <div className="rounded-md bg-surface-low p-3">
              <p className="text-xs font-semibold text-ink-muted">Lý do đề xuất</p>
              <p className="mt-1 text-sm font-bold text-ink truncate" title={selectedTopic.proposalReason}>
                {selectedTopic.proposalReason || 'Không có'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-ink-muted mb-2">Tài liệu tham khảo:</p>
            <ResourceList resources={selectedTopic.resources} />
          </div>

          <div className="flex gap-2 pt-2 border-t border-border-subtle">
            <Button onClick={() => handleApproveTopic(selectedTopic._id)} variant="primary">
              Duyệt Topic
            </Button>
            <Button
              onClick={() => {
                setRejectTarget({ type: 'topic', id: selectedTopic._id })
                setRejectionReasonInput('')
              }}
              variant="secondary"
            >
              Từ chối Topic
            </Button>
          </div>
        </Card>
      )
    }

    if (selectedSubmission) {
      const user = selectedSubmission.user
      const userName = user?.displayName || 'Người học'
      return (
        <Card className="p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-primary-container">Xem trước bài nộp</h2>
              <Badge tone="success">Submission</Badge>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={userName} size="sm" />
              <div>
                <p className="text-sm font-extrabold text-primary-container">{userName}</p>
                <p className="text-xs text-ink-muted">Gửi lúc {formatDate(selectedSubmission.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-md bg-surface-low p-4">
            <div>
              <p className="text-xs font-semibold text-emerald-dark">Đã học được</p>
              <p className="mt-1 text-sm font-bold text-ink leading-relaxed">{selectedSubmission.understood}</p>
            </div>
            <div className="mt-3 pt-3 border-t border-border-subtle">
              <p className="text-xs font-semibold text-error">Còn thắc mắc</p>
              <p className="mt-1 text-sm font-bold text-ink leading-relaxed">{selectedSubmission.notUnderstood}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-ink-muted mb-2">Tài liệu đính kèm:</p>
            <ResourceList resources={selectedSubmission.resources} />
          </div>

          <div className="flex gap-2 pt-2 border-t border-border-subtle">
            <Button onClick={() => handleApproveSubmission(selectedSubmission._id)} variant="primary">
              Duyệt Bài Nộp
            </Button>
            <Button
              onClick={() => {
                setRejectTarget({ type: 'submission', id: selectedSubmission._id })
                setRejectionReasonInput('')
              }}
              variant="secondary"
            >
              Từ chối Bài Nộp
            </Button>
          </div>
        </Card>
      )
    }

    return (
      <Card className="p-6 text-center text-ink-muted">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-low text-ink-subtle">
          <Icon name="search" size={20} />
        </div>
        <p className="text-sm font-medium">Chọn một chủ đề hoặc bài nộp từ danh sách để xem trước chi tiết.</p>
      </Card>
    )
  }

  const renderTopicTable = () => (
    <table key="topics-table" className="w-full table-fixed text-left text-sm">
      <thead className="bg-surface-low text-xs uppercase text-ink-muted">
        <tr>
          <th className="px-4 py-3 w-[80px]">Loại</th>
          <th className="px-4 py-3">Tiêu đề</th>
          <th className="px-4 py-3">Mô tả</th>
          <th className="px-4 py-3">Lý do đề xuất</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border-subtle">
        {topics.length === 0 ? (
          <tr>
            <td colSpan={4} className="px-4 py-8 text-center text-ink-muted">
              Không có chủ đề nào đang chờ duyệt.
            </td>
          </tr>
        ) : (
          topics.map((topic) => (
            <tr
              key={`topic-${topic._id}`}
              className={`cursor-pointer hover:bg-surface-low transition-colors ${
                selectedTopic?._id === topic._id ? 'bg-surface-low' : ''
              }`}
              onClick={() => selectTopic(topic)}
            >
              <td className="px-4 py-3"><Badge tone="brand">Topic</Badge></td>
              <td className="px-4 py-3 font-bold text-primary-container truncate">{topic.title}</td>
              <td className="px-4 py-3 text-ink-muted truncate">{topic.description}</td>
              <td className="px-4 py-3 text-ink-muted truncate">{topic.proposalReason}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )

  const renderSubmissionTable = () => (
    <table key="submissions-table" className="w-full table-fixed text-left text-sm">
      <thead className="bg-surface-low text-xs uppercase text-ink-muted">
        <tr>
          <th className="px-4 py-3 w-[100px]">Loại</th>
          <th className="px-4 py-3">Người gửi</th>
          <th className="px-4 py-3">Thời gian</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border-subtle">
        {submissions.length === 0 ? (
          <tr>
            <td colSpan={3} className="px-4 py-8 text-center text-ink-muted">
              Không có bài nộp nào đang chờ duyệt.
            </td>
          </tr>
        ) : (
          submissions.map(({ submission }) => {
            const user = submission.user
            return (
              <tr
                key={`sub-${submission._id}`}
                className={`cursor-pointer hover:bg-surface-low transition-colors ${
                  selectedSubmission?._id === submission._id ? 'bg-surface-low' : ''
                }`}
                onClick={() => selectSubmission(submission)}
              >
                <td className="px-4 py-3"><Badge tone="success">Submission</Badge></td>
                <td className="px-4 py-3 font-bold text-primary-container">{user?.displayName ?? 'Người học'}</td>
                <td className="px-4 py-3 text-ink-muted">{formatDate(submission.createdAt)}</td>
              </tr>
            )
          })
        )}
      </tbody>
    </table>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 p-6 min-h-screen bg-surface-low">
      {/* Preview Pane */}
      <section className="space-y-4">
        {renderPreview()}
      </section>

      {/* Pending List */}
      <section className="space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-4">
            <h2 className="text-xl font-extrabold text-primary-container">Danh sách chờ duyệt</h2>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-bold text-ink-muted">Hiển thị:</label>
                <select
                  value={viewMode}
                  onChange={e => handleViewModeChange(e.target.value as 'topics' | 'submissions')}
                  className="rounded-md border border-border bg-white px-3 py-1.5 text-sm font-semibold outline-none focus:border-secondary-container"
                >
                  <option value="topics">Chủ đề đề xuất</option>
                  <option value="submissions">Bài nộp</option>
                </select>
              </div>
              <Button
                variant="secondary"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                <span className="flex items-center gap-1.5">
                  <Icon name="arrowLeft" size={15} />
                  {loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                </span>
              </Button>
            </div>
          </div>

          <div className="overflow-auto max-h-[75vh]">
            {viewMode === 'topics' ? renderTopicTable() : renderSubmissionTable()}
          </div>
        </Card>
      </section>

      {/* Rejection Reason Modal */}
      <Modal
        open={rejectTarget !== null}
        title={rejectTarget?.type === 'topic' ? 'Từ chối chủ đề đề xuất' : 'Từ chối bài nộp'}
        onClose={() => setRejectTarget(null)}
      >
        <div className="space-y-4">
          <p className="text-sm text-ink-muted leading-relaxed">
            Vui lòng nhập lý do từ chối cụ thể để người học biết lý do và có hướng chỉnh sửa phù hợp.
          </p>
          <Textarea
            label="Lý do từ chối"
            value={rejectionReasonInput}
            onChange={(e) => setRejectionReasonInput(e.target.value)}
            placeholder="Ví dụ: Tài liệu đính kèm không truy cập được / Phạm vi chủ đề quá rộng..."
            required
          />
          <div className="flex justify-end gap-3 pt-2 border-t border-border-subtle">
            <Button variant="secondary" onClick={() => setRejectTarget(null)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              disabled={!rejectionReasonInput.trim()}
              onClick={async () => {
                if (!rejectTarget) return
                const reason = rejectionReasonInput.trim()
                if (rejectTarget.type === 'topic') {
                  await handleRejectTopic(rejectTarget.id, reason)
                } else {
                  await handleRejectSubmission(rejectTarget.id, reason)
                }
                setRejectTarget(null)
              }}
            >
              Xác nhận từ chối
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// Simple guard component – redirect non‑admin users to learner view if needed
export function AdminRedirect() {
  return null
}

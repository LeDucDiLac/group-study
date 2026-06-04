import { useState } from 'react'
import { Badge, Icon } from '@/components/ui'
import type { ResourceFile } from '@/types/domain'

export function FileUploadBox({
  state = 'ready',
  uploadedFiles = [],
  disabled = false,
  onUpload,
  onRemove,
}: {
  state?: 'ready' | 'dragging' | 'error' | 'limit'
  uploadedFiles?: ResourceFile[]
  disabled?: boolean
  /** Gọi với File khi user chọn — component cha tự upload và cập nhật uploadedFiles */
  onUpload?: (file: File) => Promise<void>
  onRemove?: (index: number) => void
}) {
  const [uploading, setUploading] = useState(false)

  const displayState = uploading ? 'ready' : state

  const copy = {
    ready: ['Kéo thả tài liệu vào đây', 'Hỗ trợ PDF, ảnh, Markdown, text và DOCX. Tối đa 10 file, 20MB/file.'],
    dragging: ['Thả file để thêm vào bài nộp', 'File sẽ được kiểm tra dung lượng trước khi gửi.'],
    error: ['File không hợp lệ', 'Mỗi file tối đa 20MB và chỉ hỗ trợ PDF, ảnh, Markdown, text hoặc DOCX.'],
    limit: ['Đã đạt giới hạn 10 file', 'Xóa bớt file nếu muốn tải lên thêm.'],
  }[displayState]

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? [])
    event.currentTarget.value = ''
    if (!selected.length || !onUpload) return

    setUploading(true)
    try {
      for (const file of selected) {
        await onUpload(file)
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <label
      className={`block rounded-md border border-dashed p-5 text-center ${
        disabled || uploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
      } ${
        displayState === 'error'
          ? 'border-error bg-error-container text-error'
          : 'border-border bg-surface-low text-ink-muted'
      }`}
    >
      <input
        className="sr-only"
        type="file"
        multiple
        disabled={disabled || uploading}
        accept=".pdf,.png,.jpg,.jpeg,.webp,.md,.txt,.docx,application/pdf,image/png,image/jpeg,image/webp,text/markdown,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleChange}
      />
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-secondary-container">
        {uploading ? (
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        ) : (
          <Icon name="upload" />
        )}
      </div>
      <p className="mt-3 font-bold">{uploading ? 'Đang tải lên...' : copy[0]}</p>
      <p className="text-sm">{copy[1]}</p>

      {uploadedFiles.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {uploadedFiles.map((file, index) => (
            <button
              key={`${file.url}-${index}`}
              type="button"
              onClick={(event) => {
                event.preventDefault()
                onRemove?.(index)
              }}
            >
              <Badge tone="success" className="flex items-center gap-1">
                <Icon name="check" size={11} />
                {file.label}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </label>
  )
}

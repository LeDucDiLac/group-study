import { Badge, Icon } from '@/components/ui'

export function FileUploadBox({
  state = 'ready',
  files = [],
  disabled = false,
  onFilesChange,
}: {
  state?: 'ready' | 'dragging' | 'error' | 'limit'
  files?: File[]
  disabled?: boolean
  onFilesChange?: (files: File[]) => void
}) {
  const copy = {
    ready: ['Kéo thả tài liệu vào đây', 'Hỗ trợ PDF, ảnh, Markdown, text và DOCX. Tối đa 10 file, 20MB/file.'],
    dragging: ['Thả file để thêm vào bài nộp', 'File sẽ được kiểm tra dung lượng trước khi gửi.'],
    error: ['File không hợp lệ', 'Mỗi file tối đa 20MB và chỉ hỗ trợ PDF, ảnh, Markdown, text hoặc DOCX.'],
    limit: ['Đã đạt giới hạn 10 file', 'Xóa bớt file nếu muốn tải lên thêm.'],
  }[state]

  return (
    <label className={`block rounded-md border border-dashed p-5 text-center ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${state === 'error' ? 'border-error bg-error-container text-error' : 'border-border bg-surface-low text-ink-muted'}`}>
      <input
        className="sr-only"
        type="file"
        multiple
        disabled={disabled}
        accept=".pdf,.png,.jpg,.jpeg,.webp,.md,.txt,.docx,application/pdf,image/png,image/jpeg,image/webp,text/markdown,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={(event) => {
          const selected = Array.from(event.target.files ?? [])
          onFilesChange?.([...files, ...selected].slice(0, 10))
          event.currentTarget.value = ''
        }}
      />
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-secondary-container">
        <Icon name="upload" />
      </div>
      <p className="mt-3 font-bold">{copy[0]}</p>
      <p className="text-sm">{copy[1]}</p>
      {files.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {files.map((file, index) => (
            <button
              key={`${file.name}-${index}`}
              type="button"
              onClick={(event) => {
                event.preventDefault()
                onFilesChange?.(files.filter((_, fileIndex) => fileIndex !== index))
              }}
            >
              <Badge tone="neutral">{file.name}</Badge>
            </button>
          ))}
        </div>
      )}
    </label>
  )
}

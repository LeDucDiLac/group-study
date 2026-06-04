import type { ResourceFile } from '@/types/domain';

export const uploadService = {
  /** POST /api/upload — upload file tài liệu (PDF, ảnh, docx, ...) */
  uploadFile: async (file: File): Promise<ResourceFile> => {
    const form = new FormData();
    form.append('file', file);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: form,
      credentials: 'include',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Upload thất bại (${response.status})`);
    }
    const data = await response.json();
    return { id: data.url, label: data.label, type: data.type, url: data.url };
  },
};

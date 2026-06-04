export interface RequestOptions extends RequestInit {
  errorHandle?: boolean;
}

/**
 * Hiển thị một Dialog thông báo lỗi tự thiết kế (Premium Custom Dialog)
 * Sử dụng thuần HTML/CSS chèn động vào DOM, đảm bảo UX mượt mà có animation.
 */
export function showCustomErrorDialog(message: string) {
  // Tránh hiển thị đè nhiều dialog cùng lúc
  const existing = document.getElementById('custom-error-dialog');
  if (existing) existing.remove();

  const dialog = document.createElement('div');
  dialog.id = 'custom-error-dialog';
  // CSS: backdrop tối mờ, căn giữa
  dialog.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300';
  dialog.innerHTML = `
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl transform transition-all duration-300 scale-95 opacity-0 flex flex-col items-center text-center">
      <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 animate-pulse">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Đã xảy ra lỗi</h3>
      <p class="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">${message}</p>
      <button id="close-error-dialog-btn" class="w-full py-2.5 px-4 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500">
        Đồng ý
      </button>
    </div>
  `;

  document.body.appendChild(dialog);

  // Kích hoạt animation khi chèn thành công
  requestAnimationFrame(() => {
    const content = dialog.firstElementChild as HTMLElement;
    if (content) {
      content.classList.replace('scale-95', 'scale-100');
      content.classList.replace('opacity-0', 'opacity-100');
    }
  });

  const close = () => {
    const content = dialog.firstElementChild as HTMLElement;
    if (content) {
      content.classList.replace('scale-100', 'scale-95');
      content.classList.replace('opacity-100', 'opacity-0');
    }
    dialog.classList.add('opacity-0');
    setTimeout(() => dialog.remove(), 250);
  };

  dialog.querySelector('#close-error-dialog-btn')?.addEventListener('click', close);
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) close();
  });
}

/**
 * Trình gửi yêu cầu API tổng quát kết nối qua proxy cục bộ /api
 */
export async function apiRequest<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { errorHandle = true, ...fetchOptions } = options;
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `Lỗi hệ thống (${response.status})`;
      if (errorHandle) {
        showCustomErrorDialog(errorMessage);
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    if (errorHandle && !error.message.includes('Lỗi hệ thống')) {
      showCustomErrorDialog(error.message || 'Không thể kết nối tới server.');
    }
    throw error;
  }
}

// Re-export tất cả services (mỗi file tương ứng 1 router backend)
export * from './auth';
export * from './topics';
export * from './submissions';
export * from './bookmarks';
export * from './comments';
export * from './notifications';
export * from './profiles';
export * from './reactions';
export * from './upload';

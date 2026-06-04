import { apiRequest } from './api';
import type { User } from '@/types/domain';

export const authService = {
  getSessionUser: async (): Promise<User | null> => {
    try {
      const res = await apiRequest<{ user: User }>('/api/auth/me', { errorHandle: false });
      return res.user ?? null;
    } catch {
      return null;
    }
  },

  login: async (email: string, password = 'timeboxed', remember = false) => {
    return apiRequest<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, remember }),
    });
  },

  register: async (name: string, email: string, password = 'timeboxed') => {
    return apiRequest<{ user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  forgotPassword: async (email: string) => {
    return apiRequest<{ email: string; sent: boolean }>('/api/auth/forgot', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  logout: async () => {
    await apiRequest<void>('/api/auth/logout', { method: 'POST' });
  },

  loginWithGoogle: async () => {
    try {
      const res = await apiRequest<{ url: string }>('/api/auth/google', { method: 'POST' });
      if (res.url) {
        window.location.href = res.url;
      }
    } catch {
      // handled by caller
    }
    return null;
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    return apiRequest<void>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },
};

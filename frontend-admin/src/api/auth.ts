import { api } from '../lib/apiClient';

export interface LoginResponse {
  accessToken: string;
  admin: {
    id: number;
    fullName: string;
    username: string;
    email: string;
    role: 'ADMIN' | 'SUPER_ADMIN';
  };
}

export function login(username: string, password: string) {
  return api.post<LoginResponse>('/auth/login', { username, password });
}

export function changePassword(currentPassword: string, newPassword: string) {
  return api.patch<{ message: string }>('/auth/change-password', { currentPassword, newPassword });
}

export function activateAccount(token: string, password: string) {
  return api.post<{ message: string }>('/admin-accounts/activate', { token, password });
}

export function forgotPassword(email: string) {
  return api.post<{ message: string }>('/auth/forgot-password', { email });
}

export function resetPassword(token: string, newPassword: string) {
  return api.post<{ message: string }>('/auth/reset-password', { token, newPassword });
}
import { api } from '../lib/apiClient';

export interface NotificationItem {
  id: number;
  message: string;
  isActive: boolean;
  createdByAdminId: number;
  createdAt: string;
}

export function getNotifications() {
  return api.get<NotificationItem[]>('/notifications');
}
export function createNotification(message: string) {
  return api.post<NotificationItem>('/notifications', { message });
}
export function updateNotification(id: number, data: { message?: string; isActive?: boolean }) {
  return api.patch<NotificationItem>(`/notifications/${id}`, data);
}
export function deleteNotification(id: number) {
  return api.delete<NotificationItem>(`/notifications/${id}`);
}
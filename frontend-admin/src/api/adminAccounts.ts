import { api } from '../lib/apiClient';

export interface AdminAccount {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'DEACTIVATED';
  createdAt: string;
}

export interface PendingRequest {
  id: number;
  requesterId: number;
  requestedFullName: string;
  requestedEmail: string;
  reason: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  requester: { id: number; fullName: string; username: string; email: string };
}

export function getAdminAccounts() {
  return api.get<AdminAccount[]>('/admin-accounts');
}
export function createAdminAccount(data: { fullName: string; username: string; email: string; role: 'ADMIN' | 'SUPER_ADMIN' }) {
  return api.post<{ admin: AdminAccount; activationLink: string }>('/admin-accounts', data);
}
export function updateAdminAccount(id: number, data: { fullName?: string; email?: string }) {
  return api.patch<AdminAccount>(`/admin-accounts/${id}`, data);
}
export function updateAdminRole(id: number, role: 'ADMIN' | 'SUPER_ADMIN') {
  return api.patch<AdminAccount>(`/admin-accounts/${id}/role`, { role });
}
export function deactivateAccount(id: number) {
  return api.patch<AdminAccount>(`/admin-accounts/${id}/deactivate`, {});
}
export function reactivateAccount(id: number) {
  return api.patch<AdminAccount>(`/admin-accounts/${id}/reactivate`, {});
}

export function submitProfileChangeRequest(data: { requestedFullName: string; requestedEmail: string; reason?: string }) {
  return api.post<PendingRequest>('/admin-accounts/profile-change-requests', data);
}
export function getPendingRequests() {
  return api.get<PendingRequest[]>('/admin-accounts/profile-change-requests');
}
export function approveRequest(id: number) {
  return api.patch<PendingRequest>(`/admin-accounts/profile-change-requests/${id}/approve`, {});
}
export function rejectRequest(id: number, rejectionReason?: string) {
  return api.patch<PendingRequest>(`/admin-accounts/profile-change-requests/${id}/reject`, { rejectionReason });
}
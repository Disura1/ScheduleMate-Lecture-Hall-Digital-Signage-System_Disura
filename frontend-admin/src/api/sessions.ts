import { api } from '../lib/apiClient';

export type SessionStatus = 'SCHEDULED' | 'CANCELLED' | 'RESCHEDULED' | 'COMPLETED' | 'SUPERSEDED';

export interface SessionItem {
  id: number;
  roomId: number;
  moduleId: number;
  lecturerId: number;
  originalSessionId: number | null;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  cancellationReason: string | null;
  rescheduleReason: string | null;
  room: { id: number; code: string; side: { id: number; sideCode: string; floor: { id: number; floorNumber: number; building: { id: number; name: string; code: string } } } };
  module: { id: number; code: string; name: string };
  lecturer: { id: number; name: string };
}

export interface CreateSessionInput {
  roomId: number;
  moduleId: number;
  lecturerId: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
}

function formatTime(isoString: string): string {
  return isoString.substring(11, 16); // "HH:mm" from the ISO timestamp
}
function formatDate(isoString: string): string {
  return isoString.substring(0, 10); // "YYYY-MM-DD"
}

export function getSessions(filters: {
  roomId?: number; status?: string; date?: string; timeFrom?: string; timeTo?: string;
  buildingId?: number; floorId?: number; sideId?: number; moduleId?: number; lecturerId?: number;
} = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  return api.get<SessionItem[]>(`/sessions?${params.toString()}`);
}

export function createSession(data: CreateSessionInput) {
  return api.post<SessionItem>('/sessions', data);
}

export function updateSession(id: number, data: Partial<CreateSessionInput>) {
  return api.patch<SessionItem>(`/sessions/${id}`, data);
}

export function cancelSession(id: number, reason?: string) {
  return api.patch<SessionItem>(`/sessions/${id}/cancel`, { reason });
}

export function reopenSession(id: number) {
  return api.patch<SessionItem>(`/sessions/${id}/reopen`, {});
}

export function rescheduleSession(id: number, data: { roomId?: number; sessionDate: string; startTime: string; endTime: string; reason?: string }) {
  return api.patch<SessionItem>(`/sessions/${id}/reschedule`, data);
}

export function getSessionHistory(id: number) {
  return api.get<SessionItem[]>(`/sessions/${id}/history`);
}

export function isSessionPast(session: SessionItem): boolean {
  const datePart = session.sessionDate.substring(0, 10);
  const timePart = session.endTime.substring(11, 16);
  const endDateTime = new Date(`${datePart}T${timePart}:00`); // interpreted as local time, matching the backend's own logic
  return endDateTime < new Date();
}

export { formatTime, formatDate };
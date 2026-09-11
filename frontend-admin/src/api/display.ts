import { api } from '../lib/apiClient';

export interface DisplayItem {
  id: number;
  deviceIdentifier: string;
  sideId: number;
  lastSeenAt: string | null;
  slideDurationSeconds: number;
  side: { id: number; sideCode: string; floor: { id: number; floorNumber: number; building: { id: number; name: string; code: string } } };
}

export interface RegisterDisplayInput {
  deviceIdentifier: string;
  sideId: number;
  slideDurationSeconds?: number;
}

export function getDisplays() {
  return api.get<DisplayItem[]>('/displays');
}
export function registerDisplay(data: RegisterDisplayInput) {
  return api.post<DisplayItem>('/displays', data);
}
export function updateDisplay(id: number, data: { sideId?: number; slideDurationSeconds?: number }) {
  return api.patch<DisplayItem>(`/displays/${id}`, data);
}
export function removeDisplay(id: number) {
  return api.delete<DisplayItem>(`/displays/${id}`);
}
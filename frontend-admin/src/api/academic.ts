import { api } from '../lib/apiClient';

export interface ModuleItem {
  id: number;
  code: string;
  name: string;
  _count: { sessions: number };
}

export interface LecturerItem {
  id: number;
  name: string;
  email: string;
  _count: { sessions: number };
}

export function getModules() {
  return api.get<ModuleItem[]>('/academic/modules');
}
export function createModule(data: { code: string; name: string }) {
  return api.post<ModuleItem>('/academic/modules', data);
}
export function updateModule(id: number, data: { code?: string; name?: string }) {
  return api.patch<ModuleItem>(`/academic/modules/${id}`, data);
}
export function deleteModule(id: number) {
  return api.delete<ModuleItem>(`/academic/modules/${id}`);
}

export function getLecturers() {
  return api.get<LecturerItem[]>('/academic/lecturers');
}
export function createLecturer(data: { name: string; email: string }) {
  return api.post<LecturerItem>('/academic/lecturers', data);
}
export function updateLecturer(id: number, data: { name?: string; email?: string }) {
  return api.patch<LecturerItem>(`/academic/lecturers/${id}`, data);
}
export function deleteLecturer(id: number) {
  return api.delete<LecturerItem>(`/academic/lecturers/${id}`);
}
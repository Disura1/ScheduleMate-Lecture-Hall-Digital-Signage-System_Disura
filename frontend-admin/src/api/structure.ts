import { api } from '../lib/apiClient';

export interface Side {
  id: number;
  sideCode: string;
}

export interface Floor {
  id: number;
  floorNumber: number;
  sides: Side[];
}

export interface Building {
  id: number;
  name: string;
  code: string;
  floors: Floor[];
}

export type RoomStatusValue = 'ONGOING_NOW' | 'AVAILABLE' | 'UPCOMING_SOON' | 'TEMPORARILY_UNAVAILABLE';

export interface RoomStatus {
  room: {
    id: number;
    code: string;
    type: 'LECTURE' | 'LAB' | 'LARGE_LECTURE_HALL';
    side: {
      id: number;
      sideCode: string;
      floor: {
        id: number;
        floorNumber: number;
        building: { id: number; name: string; code: string };
      };
    };
  };
  status: RoomStatusValue;
  currentSession: {
    module: { code: string; name: string };
    lecturer: { name: string };
    status: string;
  } | null;
}

export function getBuildings() {
  return api.get<Building[]>('/structure/buildings');
}

export function getRoomStatus(filters: { buildingId?: number; floorId?: number; sideId?: number; search?: string }) {
  const params = new URLSearchParams();
  if (filters.buildingId) params.set('buildingId', String(filters.buildingId));
  if (filters.floorId) params.set('floorId', String(filters.floorId));
  if (filters.sideId) params.set('sideId', String(filters.sideId));
  if (filters.search) params.set('search', filters.search);
  return api.get<RoomStatus[]>(`/structure/rooms/status?${params.toString()}`);
}

export interface RoomListItem {
  id: number;
  code: string;
  type: 'LECTURE' | 'LAB' | 'LARGE_LECTURE_HALL';
  sideId: number;
  side: { id: number; sideCode: string; floor: { id: number; floorNumber: number; building: { id: number; name: string; code: string } } };
}

export interface CreateRoomInput {
  sideId: number;
  code: string;
  type: 'LECTURE' | 'LAB' | 'LARGE_LECTURE_HALL';
}

export function getRooms(filters: { buildingId?: number; floorId?: number; sideId?: number }) {
  const params = new URLSearchParams();
  if (filters.buildingId) params.set('buildingId', String(filters.buildingId));
  if (filters.floorId) params.set('floorId', String(filters.floorId));
  if (filters.sideId) params.set('sideId', String(filters.sideId));
  return api.get<RoomListItem[]>(`/structure/rooms?${params.toString()}`);
}

export function createRoom(data: CreateRoomInput) {
  return api.post<RoomListItem>('/structure/rooms', data);
}

export function updateRoom(id: number, data: Partial<CreateRoomInput>) {
  return api.patch<RoomListItem>(`/structure/rooms/${id}`, data);
}

export function deleteRoom(id: number) {
  return api.delete<RoomListItem>(`/structure/rooms/${id}`);
}
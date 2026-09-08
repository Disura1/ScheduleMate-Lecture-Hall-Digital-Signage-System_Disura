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
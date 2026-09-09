const API_URL = import.meta.env.VITE_API_URL;
const DEVICE_ID = import.meta.env.VITE_DEVICE_IDENTIFIER;

export interface SessionData {
  id: number;
  room: { id: number; code: string };
  module: { code: string; name: string };
  lecturer: { name: string };
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: string;
  cancellationReason: string | null;
  rescheduleReason: string | null;
  originalSession?: { sessionDate: string; startTime: string; endTime: string } | null;
}

export interface SlideData {
  location: { building: string; floor: number; side: string };
  currentTime: string;
  ongoing: SessionData[];
  upcoming: SessionData[];
  cancelled: SessionData[];
  rescheduled: SessionData[];
}

export async function getSlideData(): Promise<SlideData> {
  const response = await fetch(`${API_URL}/signage/${DEVICE_ID}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch signage data: ${response.status}`);
  }
  return response.json();
}
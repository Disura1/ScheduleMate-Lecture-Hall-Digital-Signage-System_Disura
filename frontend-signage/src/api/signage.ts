const API_URL = import.meta.env.VITE_API_URL;

// A real physical display would be pointed at a URL like:
//   https://your-domain.com/?device=DSP-0012
// so each screen just needs its own bookmark/kiosk-mode URL — no rebuild needed per device.
// The .env value only exists as a convenience fallback for local development.
export function getDeviceId(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('device') ?? import.meta.env.VITE_DEVICE_IDENTIFIER ?? null;
}

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

export async function getSlideData(deviceId: string): Promise<SlideData> {
  const response = await fetch(`${API_URL}/signage/${deviceId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch signage data: ${response.status}`);
  }
  return response.json();
}
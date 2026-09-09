export function formatTime(isoTime: string): string {
  return isoTime.substring(11, 16);
}

export function formatDate(isoDate: string): string {
  return isoDate.substring(0, 10);
}

// Builds a real Date from our stored date+time-of-day fields, treating both as local wall-clock time
// (matches how the backend already treats them — see backend's combineDateAndTime util)
export function combineDateTime(sessionDate: string, time: string): Date {
  const datePart = sessionDate.substring(0, 10);
  const timePart = time.substring(11, 16);
  return new Date(`${datePart}T${timePart}:00`);
}

export function minutesUntil(now: Date, sessionDate: string, startTime: string): number {
  const start = combineDateTime(sessionDate, startTime);
  return Math.round((start.getTime() - now.getTime()) / 60000);
}
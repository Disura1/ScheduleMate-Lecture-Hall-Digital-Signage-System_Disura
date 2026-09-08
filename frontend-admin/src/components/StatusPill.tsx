import type { RoomStatusValue } from '../api/structure';

const STATUS_CONFIG: Record<RoomStatusValue, { label: string; bg: string; text: string }> = {
  ONGOING_NOW: { label: 'Ongoing Now', bg: 'bg-status-green-bg', text: 'text-status-green' },
  AVAILABLE: { label: 'Available', bg: 'bg-status-gray-bg', text: 'text-status-gray' },
  UPCOMING_SOON: { label: 'Upcoming Soon', bg: 'bg-status-amber-bg', text: 'text-status-amber' },
  TEMPORARILY_UNAVAILABLE: { label: 'Temporarily Unavailable', bg: 'bg-status-red-bg', text: 'text-status-red' },
};

export function StatusPill({ status }: { status: RoomStatusValue }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
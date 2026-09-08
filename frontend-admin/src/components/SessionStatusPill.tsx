import type { SessionStatus } from '../api/sessions';

const CONFIG: Partial<Record<SessionStatus, { label: string; bg: string; text: string }>> = {
  SCHEDULED: { label: 'Scheduled', bg: 'bg-status-gray-bg', text: 'text-brand-blue' },
  RESCHEDULED: { label: 'Rescheduled', bg: 'bg-status-amber-bg', text: 'text-status-amber' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-status-red-bg', text: 'text-status-red' },
  COMPLETED: { label: 'Completed', bg: 'bg-status-gray-bg', text: 'text-status-gray' },
};

export function SessionStatusPill({ status }: { status: SessionStatus }) {
  const config = CONFIG[status] ?? { label: status, bg: 'bg-status-gray-bg', text: 'text-status-gray' };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
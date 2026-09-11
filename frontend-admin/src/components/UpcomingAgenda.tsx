import type { SessionItem } from '../api/sessions';
import { formatTime } from '../api/sessions';

export function UpcomingAgenda({ sessions }: { sessions: SessionItem[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="text-sm font-bold text-navy mb-3">Next Up, Campus-Wide</div>
      {sessions.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-status-gray text-sm">Nothing else starting today</div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center gap-3 text-xs border-b border-gray-50 pb-2 last:border-0">
              <div className="bg-brand-blue/10 text-brand-blue font-bold rounded px-2 py-1 shrink-0">{formatTime(s.startTime)}</div>
              <div className="min-w-0">
                <div className="font-semibold text-navy truncate">{s.room.code} — {s.module.code}</div>
                <div className="text-status-gray truncate">{s.lecturer.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
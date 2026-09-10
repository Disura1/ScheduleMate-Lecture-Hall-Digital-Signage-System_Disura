import type { SessionData } from '../api/signage';
import { formatTime, formatDate } from '../lib/timeUtils';
import { EmptySlideCard } from '../components/EmptySlideCard';

export function RescheduledSlide({ sessions }: { sessions: SessionData[] }) {
  return (
    <div className="px-12 w-full">
      <h1 className="text-signage-text text-3xl font-bold mb-5">
        Rescheduled <span className="text-signage-amber">Lectures / Labs</span>
      </h1>
      <div className="grid grid-cols-3 gap-7">
        {sessions.length === 0 ? (
          <EmptySlideCard message="No reschedules on this floor/side today." />
        ) : (
          sessions.map((s) => (
            <div key={s.id} className="bg-signage-card rounded-2xl p-7 border-l-4 border-signage-amber">
              <div className="bg-signage-amber-bg text-signage-amber text-xs font-bold px-3 py-1.5 rounded-full inline-block mb-4">
                MOVED
              </div>
              <div className="text-signage-text text-2xl font-bold mb-1">{s.room.code}</div>
              <div className="text-signage-text-dim text-base mb-4">{s.module.code} — {s.module.name}</div>
              {s.originalSession && (
                <div className="text-signage-text-faint text-xs line-through mb-1">
                  Was: {formatDate(s.originalSession.sessionDate)}, {formatTime(s.originalSession.startTime)}–{formatTime(s.originalSession.endTime)}
                </div>
              )}
              <div className="text-signage-text-dim text-sm mb-2">
                <b className="text-signage-text">Now: {formatDate(s.sessionDate)}, {formatTime(s.startTime)}–{formatTime(s.endTime)}</b>
              </div>
              <div className="text-signage-text-dim text-sm">Lecturer: <b className="text-signage-text">{s.lecturer.name}</b></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
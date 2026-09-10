import type { SessionData } from '../api/signage';
import { formatTime, minutesUntil } from '../lib/timeUtils';
import { EmptySlideCard } from '../components/EmptySlideCard';

function startsInLabel(minutes: number): string {
  if (minutes < 60) return `STARTS IN ${minutes} MIN`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `STARTS IN ${hours} HR${hours === 1 ? '' : 'S'}${rest > 0 ? ` ${rest} MIN` : ''}`;
}

export function UpcomingSlide({ sessions, now }: { sessions: SessionData[]; now: Date }) {
  return (
    <div className="px-12 w-full">
      <h1 className="text-signage-text text-3xl font-bold mb-5">
        Upcoming <span className="text-signage-blue">Lectures / Labs</span>
      </h1>
      <div className="grid grid-cols-3 gap-7">
        {sessions.length === 0 ? (
          <EmptySlideCard message="No upcoming sessions on this floor/side today." />
        ) : (
          sessions.map((s) => (
            <div key={s.id} className="bg-signage-card rounded-2xl p-7 border-l-4 border-signage-blue">
              <div className="bg-signage-blue-bg text-signage-blue text-xs font-bold px-3 py-1.5 rounded-full inline-block mb-4">
                {startsInLabel(minutesUntil(now, s.sessionDate, s.startTime))}
              </div>
              <div className="text-signage-text text-2xl font-bold mb-1">{s.room.code}</div>
              <div className="text-signage-text-dim text-base mb-4">{s.module.code} — {s.module.name}</div>
              <div className="text-signage-text-dim text-sm mb-2"><b className="text-signage-text">{formatTime(s.startTime)} – {formatTime(s.endTime)}</b></div>
              <div className="text-signage-text-dim text-sm">Lecturer: <b className="text-signage-text">{s.lecturer.name}</b></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
import type { SessionData } from '../api/signage';
import { formatTime, minutesUntil } from '../lib/timeUtils';
import { paginate, pageCount } from '../lib/paginate';
import { EmptySlideCard } from '../components/EmptySlideCard';
import { SlideShell } from '../components/SlideShell';

function startsInLabel(minutes: number): string {
  if (minutes < 60) return `STARTS IN ${minutes} MIN`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `STARTS IN ${hours} HR${hours === 1 ? '' : 'S'}${rest > 0 ? ` ${rest} MIN` : ''}`;
}

export function UpcomingSlide({ sessions, now, page }: { sessions: SessionData[]; now: Date; page: number }) {
  const visible = paginate(sessions, page);
  const totalPages = pageCount(sessions.length);
  const dense = visible.length > 3;

  return (
    <SlideShell
      title={<>Upcoming <span className="text-signage-blue">Lectures / Labs</span></>}
      pageLabel={totalPages > 1 ? `Page ${page + 1} of ${totalPages}` : undefined}
      dense={dense}
    >
      {sessions.length === 0 ? (
        <EmptySlideCard message="No upcoming sessions on this floor/side today." />
      ) : (
        visible.map((s) => (
          <div key={s.id} className={`bg-signage-card rounded-2xl border-l-4 border-signage-blue ${dense ? 'p-4' : 'p-7'}`}>
            <div className={`bg-signage-blue-bg text-signage-blue text-xs font-bold px-3 py-1.5 rounded-full inline-block ${dense ? 'mb-2' : 'mb-4'}`}>
              {startsInLabel(minutesUntil(now, s.sessionDate, s.startTime))}
            </div>
            <div className={`text-signage-text font-bold mb-1 ${dense ? 'text-xl' : 'text-2xl'}`}>{s.room.code}</div>
            <div className={`text-signage-text-dim ${dense ? 'text-sm mb-2' : 'text-base mb-4'}`}>{s.module.code} — {s.module.name}</div>
            <div className={`text-signage-text-dim text-sm ${dense ? 'mb-1' : 'mb-2'}`}><b className="text-signage-text">{formatTime(s.startTime)} – {formatTime(s.endTime)}</b></div>
            <div className="text-signage-text-dim text-sm">Lecturer: <b className="text-signage-text">{s.lecturer.name}</b></div>
          </div>
        ))
      )}
    </SlideShell>
  );
}
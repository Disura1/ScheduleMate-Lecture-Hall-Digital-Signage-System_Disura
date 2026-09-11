import type { SessionData } from '../api/signage';
import { formatTime } from '../lib/timeUtils';
import { paginate, pageCount } from '../lib/paginate';
import { EmptySlideCard } from '../components/EmptySlideCard';
import { SlideShell } from '../components/SlideShell';

export function OngoingSlide({ sessions, page }: { sessions: SessionData[]; page: number }) {
  const visible = paginate(sessions, page);
  const totalPages = pageCount(sessions.length);
  const dense = visible.length > 3;

  return (
    <SlideShell
      title={<>Ongoing <span className="text-signage-green">Lectures / Labs</span></>}
      pageLabel={totalPages > 1 ? `Page ${page + 1} of ${totalPages}` : undefined}
      dense={dense}
    >
      {sessions.length === 0 ? (
        <EmptySlideCard message="No ongoing sessions right now." />
      ) : (
        visible.map((s) => (
          <div key={s.id} className={`bg-signage-card rounded-2xl border-l-4 border-signage-green ${dense ? 'p-4' : 'p-7'}`}>
            <div className={`bg-signage-green-bg text-signage-green text-xs font-bold px-3 py-1.5 rounded-full inline-block ${dense ? 'mb-2' : 'mb-4'}`}>
              ONGOING NOW
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
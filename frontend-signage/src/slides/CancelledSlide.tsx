import type { SessionData } from '../api/signage';
import { formatTime } from '../lib/timeUtils';
import { EmptySlideCard } from '../components/EmptySlideCard';

export function CancelledSlide({ sessions }: { sessions: SessionData[] }) {
  return (
    <div className="px-12 pt-8">
      <h1 className="text-signage-text text-3xl font-bold mb-5">
        Cancelled <span className="text-signage-red">Lectures / Labs</span>
      </h1>
      <div className="grid grid-cols-3 gap-7">
        {sessions.length === 0 ? (
          <EmptySlideCard message="No cancellations on this floor/side today." />
        ) : (
          sessions.map((s) => (
            <div key={s.id} className="bg-signage-card rounded-2xl p-7 border-l-4 border-signage-red">
              <div className="bg-signage-red-bg text-signage-red text-xs font-bold px-3 py-1.5 rounded-full inline-block mb-4">
                CANCELLED
              </div>
              <div className="text-signage-text text-2xl font-bold mb-1 line-through decoration-signage-text-faint">{s.room.code}</div>
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
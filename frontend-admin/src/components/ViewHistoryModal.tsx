import { useEffect, useState } from 'react';
import { getSessionHistory, formatDate, formatTime, type SessionItem } from '../api/sessions';
import { SessionStatusPill } from './SessionStatusPill';
import { Modal } from './Modal';

export function ViewHistoryModal({ sessionId, onClose }: { sessionId: number; onClose: () => void }) {
  const [chain, setChain] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSessionHistory(sessionId).then(setChain).finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <Modal title="Reschedule History" subtitle="Full chain from the original booking to today." onClose={onClose}>
      {loading ? (
        <p className="text-status-gray text-sm">Loading…</p>
      ) : (
        <div className="flex flex-col gap-1 max-h-96 overflow-y-auto pr-1">
          {chain.map((s, i) => (
            <div key={s.id}>
              <div className={`rounded-lg p-3 ${s.status === 'SUPERSEDED' ? 'bg-gray-50' : 'bg-status-green-bg'}`}>
                <div className={`text-xs font-bold uppercase mb-1 ${s.status === 'SUPERSEDED' ? 'text-status-gray' : 'text-status-green'}`}>
                  {i === 0 ? 'Original' : i === chain.length - 1 ? 'Current' : `Version ${i + 1}`} — <SessionStatusPill status={s.status} />
                </div>
                <div className="text-sm text-navy">{s.room.code}</div>
                <div className="text-sm text-status-gray">{formatDate(s.sessionDate)} · {formatTime(s.startTime)}–{formatTime(s.endTime)}</div>
              </div>
              {i < chain.length - 1 && (
                <div className="text-xs text-status-gray text-center py-2">
                  ↓ rescheduled{chain[i + 1].rescheduleReason ? ` — ${chain[i + 1].rescheduleReason}` : ''}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <button onClick={onClose} className="w-full h-10 border border-gray-200 rounded-lg text-sm font-semibold mt-4">Close</button>
    </Modal>
  );
}
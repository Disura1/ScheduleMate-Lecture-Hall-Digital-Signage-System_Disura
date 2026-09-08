import { useEffect, useState } from 'react';
import { getSessions, formatDate, formatTime, type SessionItem } from '../api/sessions';
import { SessionStatusPill } from '../components/SessionStatusPill';
import { NewSessionModal } from '../components/NewSessionModal';
import { EditSessionModal } from '../components/EditSessionModal';

export function SessionsPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionItem | null>(null);

  function reload() {
    setLoading(true);
    getSessions({ status: status || undefined }).then(setSessions).finally(() => setLoading(false));
  }
  useEffect(reload, [status]);

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-bold text-navy">Session Management</h1>
        <button onClick={() => setShowNewModal(true)} className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-semibold">
          + New Session
        </button>
      </div>

      <div className="flex gap-2.5 mb-4">
        <select className="h-9 border border-gray-200 rounded-lg px-3 text-sm bg-white" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Status: All</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="RESCHEDULED">Rescheduled</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-semibold text-status-gray uppercase">
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Module</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-status-gray">Loading…</td></tr>
            ) : sessions.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-status-gray">No sessions found</td></tr>
            ) : (
              sessions.map((s) => (
                <tr key={s.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{s.room.code}</td>
                  <td className="px-4 py-3">{s.module.code}</td>
                  <td className="px-4 py-3">{formatDate(s.sessionDate)}</td>
                  <td className="px-4 py-3">{formatTime(s.startTime)}–{formatTime(s.endTime)}</td>
                  <td className="px-4 py-3"><SessionStatusPill status={s.status} /></td>
                  <td className="px-4 py-3 space-x-3">
                    <SessionActions session={s} onEdit={() => setEditingSession(s)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-status-gray mt-3">Showing {sessions.length} session(s)</p>

      {showNewModal && (
        <NewSessionModal onClose={() => setShowNewModal(false)} onCreated={() => { setShowNewModal(false); reload(); }} />
      )}
      {editingSession && (
        <EditSessionModal session={editingSession} onClose={() => setEditingSession(null)} onSaved={() => { setEditingSession(null); reload(); }} />
      )}
    </div>
  );
}

function SessionActions({ session, onEdit }: { session: SessionItem; onEdit: () => void }) {
  switch (session.status) {
    case 'SCHEDULED':
    case 'RESCHEDULED':
      return (
        <>
          <button onClick={onEdit} className="text-brand-blue font-semibold">Edit</button>
          <button className="text-brand-blue font-semibold">Reschedule</button>
          <button className="text-status-red font-semibold">Cancel</button>
          {session.status === 'RESCHEDULED' && <button className="text-brand-blue font-semibold">View History</button>}
        </>
      );
    case 'CANCELLED':
      return <button className="text-status-green font-semibold">Reopen</button>;
    default:
      return <span className="text-gray-300 text-xs">No actions</span>;
  }
}
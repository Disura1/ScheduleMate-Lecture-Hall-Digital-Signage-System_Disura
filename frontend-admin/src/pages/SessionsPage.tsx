import { useEffect, useState } from 'react';
import { getSessions, formatDate, formatTime, type SessionItem, reopenSession } from '../api/sessions';
import { SessionStatusPill } from '../components/SessionStatusPill';
import { NewSessionModal } from '../components/NewSessionModal';
import { EditSessionModal } from '../components/EditSessionModal';
import { CancelSessionModal } from '../components/CancelSessionModal';
import { RescheduleSessionModal } from '../components/RescheduleSessionModal';
import { ViewHistoryModal } from '../components/ViewHistoryModal';
import { TableCard } from '../components/TableCard';
import { ConfirmModal } from '../components/ConfirmModal';
import { isSessionPast } from '../api/sessions';
import { getBuildings, type Building } from '../api/structure';
import { getModules, getLecturers, type ModuleItem, type LecturerItem } from '../api/academic';

export function SessionsPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionItem | null>(null);
  const [cancellingSession, setCancellingSession] = useState<SessionItem | null>(null);
  const [reschedulingSession, setReschedulingSession] = useState<SessionItem | null>(null);
  const [viewingHistoryId, setViewingHistoryId] = useState<number | null>(null);
  const [reopeningSession, setReopeningSession] = useState<SessionItem | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [modulesList, setModulesList] = useState<ModuleItem[]>([]);
  const [lecturersList, setLecturersList] = useState<LecturerItem[]>([]);
  const [buildingId, setBuildingId] = useState<number | ''>('');
  const [floorId, setFloorId] = useState<number | ''>('');
  const [sideId, setSideId] = useState<number | ''>('');
  const [moduleId, setModuleId] = useState<number | ''>('');
  const [lecturerId, setLecturerId] = useState<number | ''>('');
  const [date, setDate] = useState('');
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');

  useEffect(() => {
    getBuildings().then(setBuildings);
    getModules().then(setModulesList);
    getLecturers().then(setLecturersList);
  }, []);

  const selectedBuilding = buildings.find((b) => b.id === buildingId);
  const floors = selectedBuilding?.floors ?? [];
  const selectedFloor = floors.find((f) => f.id === floorId);
  const sides = selectedFloor?.sides ?? [];

  const hasActiveFilters = status || buildingId || floorId || sideId || moduleId || lecturerId || date || timeFrom || timeTo;
  function clearAllFilters() {
    setStatus(''); setBuildingId(''); setFloorId(''); setSideId('');
    setModuleId(''); setLecturerId(''); setDate(''); setTimeFrom(''); setTimeTo('');
  }

  function reload() {
    setLoading(true);
    getSessions({
      status: status || undefined,
      buildingId: buildingId || undefined,
      floorId: floorId || undefined,
      sideId: sideId || undefined,
      moduleId: moduleId || undefined,
      lecturerId: lecturerId || undefined,
      date: date || undefined,
      timeFrom: timeFrom || undefined,
      timeTo: timeTo || undefined,
    }).then(setSessions).finally(() => setLoading(false));
  }
  useEffect(reload, [status, buildingId, floorId, sideId, moduleId, lecturerId, date, timeFrom, timeTo]);

  const [reopenError, setReopenError] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-bold text-navy">Session Management</h1>
        <button onClick={() => setShowNewModal(true)} className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-semibold">
          + New Session
        </button>
      </div>

      <div className="mb-4">
        <div className="flex gap-2.5 mb-2 flex-wrap">
          <select className="h-9 border border-gray-200 rounded-lg px-3 text-sm bg-white" value={buildingId}
            onChange={(e) => { setBuildingId(e.target.value ? Number(e.target.value) : ''); setFloorId(''); setSideId(''); }}>
            <option value="">Building: All</option>
            {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select className="h-9 border border-gray-200 rounded-lg px-3 text-sm bg-white" value={floorId} disabled={!buildingId}
            onChange={(e) => { setFloorId(e.target.value ? Number(e.target.value) : ''); setSideId(''); }}>
            <option value="">Floor: All</option>
            {floors.map((f) => <option key={f.id} value={f.id}>Floor {f.floorNumber}</option>)}
          </select>
          <select className="h-9 border border-gray-200 rounded-lg px-3 text-sm bg-white" value={sideId} disabled={!floorId}
            onChange={(e) => setSideId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Side: All</option>
            {sides.map((s) => <option key={s.id} value={s.id}>Side {s.sideCode}</option>)}
          </select>
          <select className="h-9 border border-gray-200 rounded-lg px-3 text-sm bg-white" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Status: All</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="RESCHEDULED">Rescheduled</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <div className="flex gap-2.5 items-center flex-wrap">
          <select className="h-9 border border-gray-200 rounded-lg px-3 text-sm bg-white" value={moduleId} onChange={(e) => setModuleId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Module: All</option>
            {modulesList.map((m) => <option key={m.id} value={m.id}>{m.code}</option>)}
          </select>
          <select className="h-9 border border-gray-200 rounded-lg px-3 text-sm bg-white" value={lecturerId} onChange={(e) => setLecturerId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Lecturer: All</option>
            {lecturersList.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <input type="date" className="h-9 border border-gray-200 rounded-lg px-3 text-sm" value={date} onChange={(e) => setDate(e.target.value)} />
          <span className="text-sm text-status-gray">Time:</span>
          <input type="time" className="h-9 border border-gray-200 rounded-lg px-2 text-sm" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} />
          <span className="text-sm text-status-gray">to</span>
          <input type="time" className="h-9 border border-gray-200 rounded-lg px-2 text-sm" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} />
          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="text-sm text-brand-blue font-semibold">Clear Filters</button>
          )}
        </div>
      </div>

      <TableCard>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr className="text-left text-xs font-semibold text-status-gray uppercase">
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Module</th>
              <th className="px-4 py-3">Lecturer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-status-gray">Loading…</td></tr>
            ) : sessions.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-status-gray">No sessions found</td></tr>
            ) : (
              sessions.map((s) => (
                <tr key={s.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{s.room.code}</td>
                  <td className="px-4 py-3">{s.module.code}</td>
                  <td className="px-4 py-3">{s.lecturer.name}</td>
                  <td className="px-4 py-3">{formatDate(s.sessionDate)}</td>
                  <td className="px-4 py-3">{formatTime(s.startTime)}–{formatTime(s.endTime)}</td>
                  <td className="px-4 py-3"><SessionStatusPill status={s.status} /></td>
                  <td className="px-4 py-3 space-x-3">
                    <SessionActions
                      session={s}
                      onEdit={() => setEditingSession(s)}
                      onCancel={() => setCancellingSession(s)}
                      onReopen={() => setReopeningSession(s)}
                      onReschedule={() => setReschedulingSession(s)}
                      onViewHistory={() => setViewingHistoryId(s.id)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableCard>
      <p className="text-sm text-status-gray mt-3">Showing {sessions.length} session(s)</p>

      {showNewModal && (
        <NewSessionModal onClose={() => setShowNewModal(false)} onCreated={() => { setShowNewModal(false); reload(); }} />
      )}
      {editingSession && (
        <EditSessionModal session={editingSession} onClose={() => setEditingSession(null)} onSaved={() => { setEditingSession(null); reload(); }} />
      )}
      {reopenError && (
        <div className="fixed bottom-6 right-6 bg-status-red-bg text-status-red text-sm rounded-lg p-4 shadow-lg max-w-sm">
          {reopenError}
          <button onClick={() => setReopenError(null)} className="ml-3 font-semibold">Dismiss</button>
        </div>
      )}
      {cancellingSession && (
        <CancelSessionModal session={cancellingSession} onClose={() => setCancellingSession(null)} onCancelled={() => { setCancellingSession(null); reload(); }} />
      )}
      {reschedulingSession && (
        <RescheduleSessionModal session={reschedulingSession} onClose={() => setReschedulingSession(null)} onRescheduled={() => { setReschedulingSession(null); reload(); }} />
      )}
      {viewingHistoryId && (
        <ViewHistoryModal sessionId={viewingHistoryId} onClose={() => setViewingHistoryId(null)} />
      )}
      {reopeningSession && (
        <ConfirmModal
          title="Reopen this session?"
          subtitle={`${reopeningSession.room.code} · ${reopeningSession.module.code} · ${formatDate(reopeningSession.sessionDate)}, ${formatTime(reopeningSession.startTime)}–${formatTime(reopeningSession.endTime)}`}
          bodyText="This sets the session back to Scheduled. The system re-checks the room for conflicts before reopening."
          confirmLabel="Reopen Session"
          danger={false}
          onClose={() => setReopeningSession(null)}
          onConfirm={async () => { await reopenSession(reopeningSession.id); setReopeningSession(null); reload(); }}
        />
      )}
    </div>
  );
}

function SessionActions({ session, onEdit, onCancel, onReopen, onReschedule, onViewHistory }: {
  session: SessionItem; onEdit: () => void; onCancel: () => void; onReopen: () => void; onReschedule: () => void; onViewHistory: () => void;
}) {
  switch (session.status) {
    case 'SCHEDULED':
    case 'RESCHEDULED':
      return (
        <>
          <button onClick={onEdit} className="text-brand-blue font-semibold">Edit</button>
          <button onClick={onReschedule} className="text-brand-blue font-semibold">Reschedule</button>
          <button onClick={onCancel} className="text-status-red font-semibold">Cancel</button>
          {session.status === 'RESCHEDULED' && <button onClick={onViewHistory} className="text-brand-blue font-semibold">View History</button>}
        </>
      );
    case 'CANCELLED':
      return isSessionPast(session)
        ? <span className="text-gray-300 text-xs">No actions</span>
        : <button onClick={onReopen} className="text-status-green font-semibold">Reopen</button>;
    default:
      return <span className="text-gray-300 text-xs">No actions</span>;
  }
}
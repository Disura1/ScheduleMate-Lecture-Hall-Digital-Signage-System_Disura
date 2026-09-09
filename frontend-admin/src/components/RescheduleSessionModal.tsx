import { useEffect, useState } from 'react';
import { getBuildings, getRooms, type Building } from '../api/structure';
import { rescheduleSession, formatDate, formatTime, type SessionItem } from '../api/sessions';
import { Modal } from './Modal';
import { ApiError } from '../lib/apiClient';

export function RescheduleSessionModal({ session, onClose, onRescheduled }: { session: SessionItem; onClose: () => void; onRescheduled: () => void }) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<{ id: number; code: string }[]>([]);
  const [buildingId, setBuildingId] = useState<number | ''>('');
  const [floorId, setFloorId] = useState<number | ''>('');
  const [sideId, setSideId] = useState<number | ''>('');
  const [roomId, setRoomId] = useState<number | ''>(session.roomId);
  const [sessionDate, setSessionDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getBuildings().then(setBuildings);
  }, []);

  useEffect(() => {
    if (sideId) getRooms({ sideId }).then(setRooms);
  }, [sideId]);

  async function handleSave() {
    if (!sessionDate || !startTime || !endTime) {
      setError('Please fill in the new date and time.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await rescheduleSession(session.id, {
        roomId: roomId || undefined,
        sessionDate,
        startTime,
        endTime,
        reason: reason || undefined,
      });
      onRescheduled();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  const selectedBuilding = buildings.find((b) => b.id === buildingId);
  const floors = selectedBuilding?.floors ?? [];
  const selectedFloor = floors.find((f) => f.id === floorId);
  const sides = selectedFloor?.sides ?? [];

  return (
    <Modal
      title="Reschedule Session"
      subtitle={`${session.room.code} · ${session.module.code} · ${session.lecturer.name} (original: ${formatDate(session.sessionDate)}, ${formatTime(session.startTime)}–${formatTime(session.endTime)})`}
      onClose={onClose}
    >
      <p className="text-xs text-status-gray mb-3">Leave the room fields blank to keep the same room ({session.room.code}).</p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-sm font-semibold text-navy block mb-1">Building (optional)</label>
          <select className="w-full h-10 border border-gray-200 rounded-lg px-2 text-sm bg-white" value={buildingId}
            onChange={(e) => { setBuildingId(e.target.value ? Number(e.target.value) : ''); setFloorId(''); setSideId(''); }}>
            <option value="">Keep same room</option>
            {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-navy block mb-1">Floor</label>
          <select className="w-full h-10 border border-gray-200 rounded-lg px-2 text-sm bg-white" value={floorId} disabled={!buildingId}
            onChange={(e) => { setFloorId(e.target.value ? Number(e.target.value) : ''); setSideId(''); }}>
            <option value="">Select...</option>
            {floors.map((f) => <option key={f.id} value={f.id}>Floor {f.floorNumber}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-navy block mb-1">Side</label>
          <select className="w-full h-10 border border-gray-200 rounded-lg px-2 text-sm bg-white" value={sideId} disabled={!floorId}
            onChange={(e) => setSideId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Select...</option>
            {sides.map((s) => <option key={s.id} value={s.id}>Side {s.sideCode}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-navy block mb-1">New Room</label>
          <select className="w-full h-10 border border-gray-200 rounded-lg px-2 text-sm bg-white" value={roomId} disabled={!sideId}
            onChange={(e) => setRoomId(e.target.value ? Number(e.target.value) : '')}>
            <option value={session.roomId}>{session.room.code} (same)</option>
            {rooms.map((r) => <option key={r.id} value={r.id}>{r.code}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <label className="text-sm font-semibold text-navy block mb-1">New Date</label>
          <input type="date" className="w-full h-10 border border-gray-200 rounded-lg px-2 text-sm" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-semibold text-navy block mb-1">Start Time</label>
          <input type="time" className="w-full h-10 border border-gray-200 rounded-lg px-2 text-sm" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-semibold text-navy block mb-1">End Time</label>
          <input type="time" className="w-full h-10 border border-gray-200 rounded-lg px-2 text-sm" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
      </div>

      <label className="text-sm font-semibold text-navy block mb-1">Reason (optional, shown to viewers)</label>
      <input className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-4 text-sm" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Lecturer unavailable" />

      {error && <div className="bg-status-red-bg text-status-red text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="flex gap-2.5">
        <button onClick={onClose} className="flex-1 h-10 border border-gray-200 rounded-lg text-sm font-semibold">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="flex-1 h-10 bg-brand-blue text-white rounded-lg text-sm font-semibold disabled:opacity-60">
          {saving ? 'Saving…' : 'Confirm Reschedule'}
        </button>
      </div>
    </Modal>
  );
}
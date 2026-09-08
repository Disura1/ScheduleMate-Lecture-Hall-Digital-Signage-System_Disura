import { useEffect, useState } from 'react';
import { getBuildings, getRooms, type Building } from '../api/structure';
import { getModules, getLecturers, type ModuleItem, type LecturerItem } from '../api/academic';
import { createSession } from '../api/sessions';
import { Modal } from './Modal';
import { ApiError } from '../lib/apiClient';

export function NewSessionModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [lecturers, setLecturers] = useState<LecturerItem[]>([]);
  const [rooms, setRooms] = useState<{ id: number; code: string }[]>([]);

  const [buildingId, setBuildingId] = useState<number | ''>('');
  const [floorId, setFloorId] = useState<number | ''>('');
  const [sideId, setSideId] = useState<number | ''>('');
  const [roomId, setRoomId] = useState<number | ''>('');
  const [moduleId, setModuleId] = useState<number | ''>('');
  const [lecturerId, setLecturerId] = useState<number | ''>('');
  const [sessionDate, setSessionDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getBuildings().then(setBuildings);
    getModules().then(setModules);
    getLecturers().then(setLecturers);
  }, []);

  useEffect(() => {
    if (sideId) getRooms({ sideId }).then(setRooms);
    else setRooms([]);
    setRoomId('');
  }, [sideId]);

  const selectedBuilding = buildings.find((b) => b.id === buildingId);
  const floors = selectedBuilding?.floors ?? [];
  const selectedFloor = floors.find((f) => f.id === floorId);
  const sides = selectedFloor?.sides ?? [];

  async function handleSave() {
    if (!roomId || !moduleId || !lecturerId || !sessionDate || !startTime || !endTime) {
      setError('Please fill in every field.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await createSession({ roomId, moduleId, lecturerId, sessionDate, startTime, endTime });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="New Session" subtitle="The system checks for room conflicts before saving." onClose={onClose}>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Select label="Building" value={buildingId} onChange={(v) => { setBuildingId(v); setFloorId(''); setSideId(''); }}
          options={buildings.map((b) => ({ value: b.id, label: b.name }))} />
        <Select label="Floor" value={floorId} onChange={(v) => { setFloorId(v); setSideId(''); }} disabled={!buildingId}
          options={floors.map((f) => ({ value: f.id, label: `Floor ${f.floorNumber}` }))} />
        <Select label="Side" value={sideId} onChange={setSideId} disabled={!floorId}
          options={sides.map((s) => ({ value: s.id, label: `Side ${s.sideCode}` }))} />
        <Select label="Room" value={roomId} onChange={setRoomId} disabled={!sideId}
          options={rooms.map((r) => ({ value: r.id, label: r.code }))} />
      </div>

      <Select label="Module" value={moduleId} onChange={setModuleId}
        options={modules.map((m) => ({ value: m.id, label: `${m.code} — ${m.name}` }))} full />
      <Select label="Lecturer" value={lecturerId} onChange={setLecturerId}
        options={lecturers.map((l) => ({ value: l.id, label: l.name }))} full />

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label className="text-sm font-semibold text-navy block mb-1">Date</label>
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

      {error && <div className="bg-status-red-bg text-status-red text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="flex gap-2.5">
        <button onClick={onClose} className="flex-1 h-10 border border-gray-200 rounded-lg text-sm font-semibold">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="flex-1 h-10 bg-brand-blue text-white rounded-lg text-sm font-semibold disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Session'}
        </button>
      </div>
    </Modal>
  );
}

function Select({ label, value, onChange, options, disabled, full }: {
  label: string; value: number | ''; onChange: (v: number | '') => void;
  options: { value: number; label: string }[]; disabled?: boolean; full?: boolean;
}) {
  return (
    <div className={full ? 'mb-3' : ''}>
      <label className="text-sm font-semibold text-navy block mb-1">{label}</label>
      <select
        className="w-full h-10 border border-gray-200 rounded-lg px-2 text-sm bg-white disabled:bg-gray-50"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
      >
        <option value="">Select...</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
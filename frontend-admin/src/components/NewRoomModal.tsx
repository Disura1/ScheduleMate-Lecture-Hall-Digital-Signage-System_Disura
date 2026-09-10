import { useEffect, useState } from 'react';
import { getRooms, createRoom, type Building, type CreateRoomInput } from '../api/structure';
import { generateNextRoomCode } from '../lib/roomCode';
import { Modal } from './Modal';
import { ApiError } from '../lib/apiClient';

const ROOM_TYPES: CreateRoomInput['type'][] = ['LECTURE', 'LAB', 'LARGE_LECTURE_HALL'];
const ROOM_TYPE_LABELS: Record<CreateRoomInput['type'], string> = {
  LECTURE: 'Lecture', LAB: 'Lab', LARGE_LECTURE_HALL: 'Large Lecture Hall',
};

export function NewRoomModal({ buildings, onClose, onCreated }: { buildings: Building[]; onClose: () => void; onCreated: () => void }) {
  const [buildingId, setBuildingId] = useState<number | ''>('');
  const [floorId, setFloorId] = useState<number | ''>('');
  const [sideId, setSideId] = useState<number | ''>('');
  const [type, setType] = useState<CreateRoomInput['type']>('LECTURE');
  const [existingCodes, setExistingCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sideId) {
      getRooms({ sideId }).then((rooms) => setExistingCodes(rooms.map((r) => r.code)));
    } else {
      setExistingCodes([]);
    }
  }, [sideId]);

  const selectedBuilding = buildings.find((b) => b.id === buildingId);
  const floors = selectedBuilding?.floors ?? [];
  const selectedFloor = floors.find((f) => f.id === floorId);
  const sides = selectedFloor?.sides ?? [];
  const selectedSideObj = sides.find((s) => s.id === sideId);

  const generatedCode = (selectedBuilding && selectedSideObj)
    ? generateNextRoomCode(selectedBuilding.code, selectedFloor?.floorNumber ?? 0, selectedSideObj.sideCode, type, existingCodes)
    : '';

  async function handleSave() {
    if (!sideId) { setError('Please select a building, floor, and side.'); return; }
    setError(null);
    setSaving(true);
    try {
      await createRoom({ sideId, code: generatedCode, type });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="New Room" subtitle="A room must be explicitly assigned to a building, floor, and side." onClose={onClose}>
      <label className="text-sm font-semibold text-navy block mb-1">Building</label>
      <select className="w-full h-10 border border-gray-200 rounded-lg px-2 mb-3 text-sm bg-white" value={buildingId}
        onChange={(e) => { setBuildingId(e.target.value ? Number(e.target.value) : ''); setFloorId(''); setSideId(''); }}>
        <option value="">Select building...</option>
        {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>

      <label className="text-sm font-semibold text-navy block mb-1">Floor</label>
      <select className="w-full h-10 border border-gray-200 rounded-lg px-2 mb-3 text-sm bg-white" value={floorId} disabled={!buildingId}
        onChange={(e) => { setFloorId(e.target.value ? Number(e.target.value) : ''); setSideId(''); }}>
        <option value="">Select floor...</option>
        {floors.map((f) => <option key={f.id} value={f.id}>Floor {f.floorNumber}</option>)}
      </select>

      <label className="text-sm font-semibold text-navy block mb-1">Side</label>
      <select className="w-full h-10 border border-gray-200 rounded-lg px-2 mb-3 text-sm bg-white" value={sideId} disabled={!floorId}
        onChange={(e) => setSideId(e.target.value ? Number(e.target.value) : '')}>
        <option value="">Select side...</option>
        {sides.map((s) => <option key={s.id} value={s.id}>Side {s.sideCode}</option>)}
      </select>

      <label className="text-sm font-semibold text-navy block mb-1">Room Type</label>
      <select className="w-full h-10 border border-gray-200 rounded-lg px-2 mb-3 text-sm bg-white" value={type} onChange={(e) => setType(e.target.value as CreateRoomInput['type'])}>
        {ROOM_TYPES.map((t) => <option key={t} value={t}>{ROOM_TYPE_LABELS[t]}</option>)}
      </select>

      <label className="text-sm font-semibold text-navy block mb-1">Room Code <span className="font-normal text-gray-400">(auto-generated)</span></label>
      <div className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-4 text-sm bg-gray-50 flex items-center text-navy font-semibold">
        {generatedCode || 'Select building/floor/side first'}
      </div>

      {error && <div className="bg-status-red-bg text-status-red text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="flex gap-2.5">
        <button onClick={onClose} className="flex-1 h-10 border border-gray-200 rounded-lg text-sm font-semibold">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="flex-1 h-10 bg-brand-blue text-white rounded-lg text-sm font-semibold disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Room'}
        </button>
      </div>
    </Modal>
  );
}
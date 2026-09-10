import { useState } from 'react';
import { updateRoom, type RoomListItem, type CreateRoomInput, type Building } from '../api/structure';
import { Modal } from './Modal';
import { ApiError } from '../lib/apiClient';

const ROOM_TYPES: CreateRoomInput['type'][] = ['LECTURE', 'LAB', 'LARGE_LECTURE_HALL'];
const ROOM_TYPE_LABELS: Record<CreateRoomInput['type'], string> = {
  LECTURE: 'Lecture', LAB: 'Lab', LARGE_LECTURE_HALL: 'Large Lecture Hall',
};

export function EditRoomModal({ room, buildings, onClose, onSaved }: { room: RoomListItem; buildings: Building[]; onClose: () => void; onSaved: () => void }) {
  const [buildingId, setBuildingId] = useState<number | ''>(room.side.floor.building.id);
  const [floorId, setFloorId] = useState<number | ''>(room.side.floor.id);
  const [sideId, setSideId] = useState<number | ''>(room.sideId);
  const [code, setCode] = useState(room.code);
  const [type, setType] = useState<CreateRoomInput['type']>(room.type);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedBuilding = buildings.find((b) => b.id === buildingId);
  const floors = selectedBuilding?.floors ?? [];
  const selectedFloor = floors.find((f) => f.id === floorId);
  const sides = selectedFloor?.sides ?? [];

  async function handleSave() {
    if (!sideId) { setError('Please select a building, floor, and side.'); return; }
    setError(null);
    setSaving(true);
    try {
      await updateRoom(room.id, { sideId, code, type });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Edit Room" subtitle={`Editing ${room.code}.`} onClose={onClose}>
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

      <label className="text-sm font-semibold text-navy block mb-1">Room Code</label>
      <input className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-3 text-sm" value={code} onChange={(e) => setCode(e.target.value)} />

      <label className="text-sm font-semibold text-navy block mb-1">Room Type</label>
      <select className="w-full h-10 border border-gray-200 rounded-lg px-2 mb-4 text-sm bg-white" value={type} onChange={(e) => setType(e.target.value as CreateRoomInput['type'])}>
        {ROOM_TYPES.map((t) => <option key={t} value={t}>{ROOM_TYPE_LABELS[t]}</option>)}
      </select>

      {error && <div className="bg-status-red-bg text-status-red text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="flex gap-2.5">
        <button onClick={onClose} className="flex-1 h-10 border border-gray-200 rounded-lg text-sm font-semibold">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="flex-1 h-10 bg-brand-blue text-white rounded-lg text-sm font-semibold disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </Modal>
  );
}
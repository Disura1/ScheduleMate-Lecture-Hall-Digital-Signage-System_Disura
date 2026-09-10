import { useEffect, useState } from 'react';
import {
  getBuildings, getRooms, createRoom, deleteRoom,
  type Building, type RoomListItem, type CreateRoomInput,
} from '../api/structure';
import { Modal } from '../components/Modal';
import { ApiError } from '../lib/apiClient';

const ROOM_TYPES: CreateRoomInput['type'][] = ['LECTURE', 'LAB', 'LARGE_LECTURE_HALL'];
const ROOM_TYPE_LABELS: Record<CreateRoomInput['type'], string> = {
  LECTURE: 'Lecture',
  LAB: 'Lab',
  LARGE_LECTURE_HALL: 'Large Lecture Hall',
};

export function StructurePage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [buildingId, setBuildingId] = useState<number | ''>('');
  const [floorId, setFloorId] = useState<number | ''>('');
  const [sideId, setSideId] = useState<number | ''>('');
  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    getBuildings().then((data) => {
      setBuildings(data);
      if (data.length > 0) setBuildingId(data[0].id); // default to first building's tab
    });
  }, []);

  useEffect(() => {
    if (!buildingId) return;
    setLoading(true);
    getRooms({ buildingId, floorId: floorId || undefined, sideId: sideId || undefined })
      .then(setRooms)
      .finally(() => setLoading(false));
  }, [buildingId, floorId, sideId]);

  async function handleDelete(id: number) {
    if (!confirm('Delete this room?')) return;
    try {
      await deleteRoom(id);
      setRooms((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Something went wrong');
    }
  }

  function reload() {
    getRooms({ buildingId: buildingId || undefined, floorId: floorId || undefined, sideId: sideId || undefined }).then(setRooms);
  }

  const selectedBuilding = buildings.find((b) => b.id === buildingId);
  const floors = selectedBuilding?.floors ?? [];
  const selectedFloor = floors.find((f) => f.id === floorId);
  const sides = selectedFloor?.sides ?? [];

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-bold text-navy">Campus Structure</h1>
        <button onClick={() => setShowNewModal(true)} className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-semibold">
          + New Room
        </button>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-4">
        {buildings.map((b) => (
          <button
            key={b.id}
            onClick={() => { setBuildingId(b.id); setFloorId(''); setSideId(''); }}
            className={`px-4 py-2 text-sm font-semibold border-b-2 ${
              buildingId === b.id ? 'text-brand-blue border-brand-blue' : 'text-status-gray border-transparent'
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      <div className="flex gap-2.5 mb-4">
        <select
          className="h-9 border border-gray-200 rounded-lg px-3 text-sm bg-white"
          value={floorId}
          onChange={(e) => { setFloorId(e.target.value ? Number(e.target.value) : ''); setSideId(''); }}
        >
          <option value="">Floor: All</option>
          {floors.map((f) => <option key={f.id} value={f.id}>Floor {f.floorNumber}</option>)}
        </select>

        <select
          className="h-9 border border-gray-200 rounded-lg px-3 text-sm bg-white"
          value={sideId}
          onChange={(e) => setSideId(e.target.value ? Number(e.target.value) : '')}
          disabled={!floorId}
        >
          <option value="">Side: All</option>
          {sides.map((s) => <option key={s.id} value={s.id}>Side {s.sideCode}</option>)}
        </select>

        {(floorId || sideId) && (
          <button onClick={() => { setFloorId(''); setSideId(''); }} className="text-sm text-brand-blue font-semibold">
            Clear Filters
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-semibold text-status-gray uppercase">
              <th className="px-4 py-3">Room Code</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Floor</th>
              <th className="px-4 py-3">Side</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-status-gray">Loading…</td></tr>
            ) : rooms.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-status-gray">No rooms found</td></tr>
            ) : (
              rooms.map((r) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{r.code}</td>
                  <td className="px-4 py-3">{ROOM_TYPE_LABELS[r.type]}</td>
                  <td className="px-4 py-3">{r.side.floor.floorNumber}</td>
                  <td className="px-4 py-3">{r.side.sideCode}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(r.id)} className="text-status-red font-semibold">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showNewModal && (
        <NewRoomModal
          buildings={buildings}
          onClose={() => setShowNewModal(false)}
          onCreated={() => { setShowNewModal(false); reload(); }}
        />
      )}
    </div>
  );
}

function NewRoomModal({ buildings, onClose, onCreated }: { buildings: Building[]; onClose: () => void; onCreated: () => void }) {
  const [buildingId, setBuildingId] = useState<number | ''>('');
  const [floorId, setFloorId] = useState<number | ''>('');
  const [sideId, setSideId] = useState<number | ''>('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<CreateRoomInput['type']>('LECTURE');
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
      await createRoom({ sideId, code, type });
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
      <select className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-3 text-sm" value={buildingId}
        onChange={(e) => { setBuildingId(e.target.value ? Number(e.target.value) : ''); setFloorId(''); setSideId(''); }}>
        <option value="">Select building...</option>
        {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>

      <label className="text-sm font-semibold text-navy block mb-1">Floor</label>
      <select className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-3 text-sm" value={floorId}
        onChange={(e) => { setFloorId(e.target.value ? Number(e.target.value) : ''); setSideId(''); }} disabled={!buildingId}>
        <option value="">Select floor...</option>
        {floors.map((f) => <option key={f.id} value={f.id}>Floor {f.floorNumber}</option>)}
      </select>

      <label className="text-sm font-semibold text-navy block mb-1">Side</label>
      <select className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-3 text-sm" value={sideId}
        onChange={(e) => setSideId(e.target.value ? Number(e.target.value) : '')} disabled={!floorId}>
        <option value="">Select side...</option>
        {sides.map((s) => <option key={s.id} value={s.id}>Side {s.sideCode}</option>)}
      </select>

      <label className="text-sm font-semibold text-navy block mb-1">Room Code</label>
      <input className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-3 text-sm" placeholder="e.g. M-05A-L04" value={code} onChange={(e) => setCode(e.target.value)} />

      <label className="text-sm font-semibold text-navy block mb-1">Room Type</label>
      <select className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-4 text-sm" value={type} onChange={(e) => setType(e.target.value as CreateRoomInput['type'])}>
        {ROOM_TYPES.map((t) => <option key={t} value={t}>{ROOM_TYPE_LABELS[t]}</option>)}
      </select>

      {error && <p className="text-status-red text-sm mb-3">{error}</p>}

      <div className="flex gap-2.5">
        <button onClick={onClose} className="flex-1 h-10 border border-gray-200 rounded-lg text-sm font-semibold">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="flex-1 h-10 bg-brand-blue text-white rounded-lg text-sm font-semibold disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Room'}
        </button>
      </div>
    </Modal>
  );
}
import { useEffect, useState } from 'react';
import {
  getBuildings, getRooms, deleteRoom,
  type Building, type RoomListItem, type CreateRoomInput,
} from '../api/structure';
import { TableCard } from '../components/TableCard';
import { EditRoomModal } from '../components/EditRoomModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { NewRoomModal } from '../components/NewRoomModal';
import { useToast } from '../context/ToastContext';

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
  const [editingRoom, setEditingRoom] = useState<RoomListItem | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<RoomListItem | null>(null);
  const { showSuccess } = useToast();

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

  function reload() {
    getRooms({ buildingId: buildingId || undefined, floorId: floorId || undefined, sideId: sideId || undefined }).then(setRooms);
  }

  const selectedBuilding = buildings.find((b) => b.id === buildingId);
  const floors = selectedBuilding?.floors ?? [];
  const selectedFloor = floors.find((f) => f.id === floorId);
  const sides = selectedFloor?.sides ?? [];

  return (
    <div className="h-full flex flex-col">
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

      <TableCard>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
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
                    <button onClick={() => setEditingRoom(r)} className="text-brand-blue font-semibold mr-3">Edit</button>
                    <button onClick={() => setDeletingRoom(r)} className="text-status-red font-semibold">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableCard>

      {showNewModal && (
        <NewRoomModal buildings={buildings} onClose={() => setShowNewModal(false)} onCreated={() => { setShowNewModal(false); reload(); showSuccess('Room created successfully.'); }} />
      )}
      {editingRoom && (
        <EditRoomModal room={editingRoom} buildings={buildings} onClose={() => setEditingRoom(null)} onSaved={() => { setEditingRoom(null); reload(); showSuccess('Room updated successfully.'); }} />
      )}
      {deletingRoom && (
        <ConfirmModal
          title="Delete this room?"
          subtitle={deletingRoom.code}
          confirmLabel="Delete Room"
          onClose={() => setDeletingRoom(null)}
          onConfirm={async () => { await deleteRoom(deletingRoom.id); setDeletingRoom(null); reload(); showSuccess('Room deleted successfully.'); }}
        />
      )}
    </div>
  );
}
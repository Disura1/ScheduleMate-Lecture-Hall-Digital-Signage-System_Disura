import { useEffect, useState } from 'react';
import { getBuildings, getRoomStatus, type Building, type RoomStatus } from '../api/structure';
import { StatusPill } from '../components/StatusPill';
import { TableCard } from '../components/TableCard';

export function DashboardPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [buildingId, setBuildingId] = useState<number | ''>('');
  const [floorId, setFloorId] = useState<number | ''>('');
  const [sideId, setSideId] = useState<number | ''>('');
  const [search, setSearch] = useState('');
  const [rooms, setRooms] = useState<RoomStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    getBuildings().then(setBuildings);
  }, []);

  useEffect(() => {
    setLoading(true);
    getRoomStatus({
      buildingId: buildingId || undefined,
      floorId: floorId || undefined,
      sideId: sideId || undefined,
      search: search || undefined,
      status: statusFilter || undefined,
    })
      .then(setRooms)
      .finally(() => setLoading(false));
  }, [buildingId, floorId, sideId, search, statusFilter]);

  const selectedBuilding = buildings.find((b) => b.id === buildingId);
  const floors = selectedBuilding?.floors ?? [];
  const selectedFloor = floors.find((f) => f.id === floorId);
  const sides = selectedFloor?.sides ?? [];

  const counts = {
    ONGOING_NOW: rooms.filter((r) => r.status === 'ONGOING_NOW').length,
    AVAILABLE: rooms.filter((r) => r.status === 'AVAILABLE').length,
    UPCOMING_SOON: rooms.filter((r) => r.status === 'UPCOMING_SOON').length,
    TEMPORARILY_UNAVAILABLE: rooms.filter((r) => r.status === 'TEMPORARILY_UNAVAILABLE').length,
  };

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-xl font-bold text-navy mb-5">Live Room Status Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Ongoing Now" value={counts.ONGOING_NOW} accent="border-status-green" />
        <SummaryCard label="Available Rooms" value={counts.AVAILABLE} accent="border-status-gray" />
        <SummaryCard label="Upcoming Soon" value={counts.UPCOMING_SOON} accent="border-status-amber" />
        <SummaryCard label="Temporarily Unavailable" value={counts.TEMPORARILY_UNAVAILABLE} accent="border-status-red" />
      </div>

      <div className="flex gap-2.5 mb-4 items-center">
        <select
          className="h-9 border border-gray-200 rounded-lg px-3 text-sm bg-white"
          value={buildingId}
          onChange={(e) => {
            setBuildingId(e.target.value ? Number(e.target.value) : '');
            setFloorId('');
            setSideId('');
          }}
        >
          <option value="">Building</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <select
          className="h-9 border border-gray-200 rounded-lg px-3 text-sm bg-white"
          value={floorId}
          onChange={(e) => {
            setFloorId(e.target.value ? Number(e.target.value) : '');
            setSideId('');
          }}
          disabled={!buildingId}
        >
          <option value="">Floor</option>
          {floors.map((f) => (
            <option key={f.id} value={f.id}>{f.floorNumber}</option>
          ))}
        </select>

        <select
          className="h-9 border border-gray-200 rounded-lg px-3 text-sm bg-white"
          value={sideId}
          onChange={(e) => setSideId(e.target.value ? Number(e.target.value) : '')}
          disabled={!floorId}
        >
          <option value="">Side</option>
          {sides.map((s) => (
            <option key={s.id} value={s.id}>{s.sideCode}</option>
          ))}
        </select>

        <select className="h-9 border border-gray-200 rounded-lg px-3 text-sm bg-white" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Status: All</option>
          <option value="ONGOING_NOW">Ongoing Now</option>
          <option value="AVAILABLE">Available</option>
          <option value="UPCOMING_SOON">Upcoming Soon</option>
          <option value="TEMPORARILY_UNAVAILABLE">Temporarily Unavailable</option>
        </select>

        <div className="relative flex-1 max-w-70">
          <input
            className="w-full h-9 border border-gray-200 rounded-lg pl-3 pr-8 text-sm"
            placeholder="Search by module or lecturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-status-gray text-sm"
            >
              ✕
            </button>
          )}
        </div>
        
        {(buildingId || floorId || sideId || search || statusFilter) && (
          <button
            onClick={() => { setBuildingId(''); setFloorId(''); setSideId(''); setSearch(''); setStatusFilter(''); }}
            className="text-sm text-brand-blue font-semibold"
          >
            Clear Filters
          </button>
        )}
      </div>

      <TableCard>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr className="text-left text-xs font-semibold text-status-gray uppercase">
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Building / Floor / Side</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Current Session</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-status-gray">Loading…</td></tr>
            ) : rooms.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-status-gray">No rooms match these filters</td></tr>
            ) : (
              rooms.map((r) => (
                <tr key={r.room.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{r.room.code}</td>
                  <td className="px-4 py-3">
                    {r.room.side.floor.building.name} / {r.room.side.floor.floorNumber} / {r.room.side.sideCode}
                  </td>
                  <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                  <td className="px-4 py-3">
                    {r.currentSession ? (
                      <div>
                        <div>{r.currentSession.module.code} — {r.currentSession.module.name}</div>
                        <div className="text-xs text-status-gray">Lecturer: {r.currentSession.lecturer.name}</div>
                      </div>
                    ) : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableCard>

      <p className="text-sm text-status-gray mt-3">Showing {rooms.length} room(s)</p>
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${accent}`}>
      <div className="text-xs font-semibold text-status-gray uppercase mb-2">{label}</div>
      <div className="text-2xl font-bold text-navy">{value}</div>
    </div>
  );
}
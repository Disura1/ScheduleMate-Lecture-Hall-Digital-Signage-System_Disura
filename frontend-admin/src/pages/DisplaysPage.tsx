import { useEffect, useState } from 'react';
import { getDisplays, registerDisplay, reassignDisplay, removeDisplay, type DisplayItem } from '../api/display';
import { getBuildings, type Building } from '../api/structure';
import { DisplayStatusPill, formatLastSeen } from '../components/DisplayStatusPill';
import { Modal } from '../components/Modal';
import { ApiError } from '../lib/apiClient';

export function DisplaysPage() {
  const [displays, setDisplays] = useState<DisplayItem[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [reassigningDisplay, setReassigningDisplay] = useState<DisplayItem | null>(null);

  function reload() {
    setLoading(true);
    getDisplays().then(setDisplays).finally(() => setLoading(false));
  }
  useEffect(() => {
    reload();
    getBuildings().then(setBuildings);
  }, []);

  async function handleRemove(id: number) {
    if (!confirm('Remove this display? The physical device will stop being able to fetch signage data.')) return;
    try {
      await removeDisplay(id);
      reload();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Something went wrong');
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-bold text-navy">Digital Signage Displays</h1>
        <button onClick={() => setShowNewModal(true)} className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-semibold">
          + Register Display
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-semibold text-status-gray uppercase">
              <th className="px-4 py-3">Device ID</th>
              <th className="px-4 py-3">Assigned Location</th>
              <th className="px-4 py-3">Last Seen</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-status-gray">Loading…</td></tr>
            ) : displays.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-status-gray">No displays registered</td></tr>
            ) : (
              displays.map((d) => (
                <tr key={d.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{d.deviceIdentifier}</td>
                  <td className="px-4 py-3">
                    {d.side.floor.building.name} / Floor {d.side.floor.floorNumber} / {d.side.sideCode}
                  </td>
                  <td className="px-4 py-3">{formatLastSeen(d.lastSeenAt)}</td>
                  <td className="px-4 py-3"><DisplayStatusPill lastSeenAt={d.lastSeenAt} /></td>
                  <td className="px-4 py-3 space-x-3">
                    <button onClick={() => setReassigningDisplay(d)} className="text-brand-blue font-semibold">Reassign</button>
                    <button onClick={() => handleRemove(d.id)} className="text-status-red font-semibold">Remove</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-status-gray mt-3">
        "Last Seen" reflects the display's most recent ~60s poll to the signage API — a device offline for over 5 minutes is flagged for a maintenance check.
      </p>

      {showNewModal && (
        <RegisterDisplayModal buildings={buildings} onClose={() => setShowNewModal(false)} onCreated={() => { setShowNewModal(false); reload(); }} />
      )}
      {reassigningDisplay && (
        <ReassignDisplayModal display={reassigningDisplay} buildings={buildings} onClose={() => setReassigningDisplay(null)} onSaved={() => { setReassigningDisplay(null); reload(); }} />
      )}
    </div>
  );
}

function LocationPicker({ buildings, buildingId, setBuildingId, floorId, setFloorId, sideId, setSideId }: {
  buildings: Building[];
  buildingId: number | ''; setBuildingId: (v: number | '') => void;
  floorId: number | ''; setFloorId: (v: number | '') => void;
  sideId: number | ''; setSideId: (v: number | '') => void;
}) {
  const selectedBuilding = buildings.find((b) => b.id === buildingId);
  const floors = selectedBuilding?.floors ?? [];
  const selectedFloor = floors.find((f) => f.id === floorId);
  const sides = selectedFloor?.sides ?? [];

  return (
    <>
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
      <select className="w-full h-10 border border-gray-200 rounded-lg px-2 mb-4 text-sm bg-white" value={sideId} disabled={!floorId}
        onChange={(e) => setSideId(e.target.value ? Number(e.target.value) : '')}>
        <option value="">Select side...</option>
        {sides.map((s) => <option key={s.id} value={s.id}>Side {s.sideCode}</option>)}
      </select>
    </>
  );
}

function RegisterDisplayModal({ buildings, onClose, onCreated }: { buildings: Building[]; onClose: () => void; onCreated: () => void }) {
  const [buildingId, setBuildingId] = useState<number | ''>('');
  const [floorId, setFloorId] = useState<number | ''>('');
  const [sideId, setSideId] = useState<number | ''>('');
  const [deviceIdentifier, setDeviceIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!sideId || !deviceIdentifier) { setError('Please fill in every field.'); return; }
    setError(null);
    setSaving(true);
    try {
      await registerDisplay({ deviceIdentifier, sideId });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Register Display" subtitle="Register a new signage device and assign its location." onClose={onClose}>
      <label className="text-sm font-semibold text-navy block mb-1">Device ID</label>
      <input className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-3 text-sm" placeholder="e.g. DSP-0042" value={deviceIdentifier} onChange={(e) => setDeviceIdentifier(e.target.value)} />

      <LocationPicker buildings={buildings} buildingId={buildingId} setBuildingId={setBuildingId} floorId={floorId} setFloorId={setFloorId} sideId={sideId} setSideId={setSideId} />

      {error && <div className="bg-status-red-bg text-status-red text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="flex gap-2.5">
        <button onClick={onClose} className="flex-1 h-10 border border-gray-200 rounded-lg text-sm font-semibold">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="flex-1 h-10 bg-brand-blue text-white rounded-lg text-sm font-semibold disabled:opacity-60">
          {saving ? 'Saving…' : 'Register Display'}
        </button>
      </div>
    </Modal>
  );
}

function ReassignDisplayModal({ display, buildings, onClose, onSaved }: { display: DisplayItem; buildings: Building[]; onClose: () => void; onSaved: () => void }) {
  const [buildingId, setBuildingId] = useState<number | ''>(display.side.floor.building.id);
  const [floorId, setFloorId] = useState<number | ''>(display.side.floor.id);
  const [sideId, setSideId] = useState<number | ''>(display.sideId);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!sideId) { setError('Please select a side.'); return; }
    setError(null);
    setSaving(true);
    try {
      await reassignDisplay(display.id, sideId);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Reassign Display" subtitle={`${display.deviceIdentifier} is currently assigned to ${display.side.floor.building.name} / Floor ${display.side.floor.floorNumber} / ${display.side.sideCode}.`} onClose={onClose}>
      <LocationPicker buildings={buildings} buildingId={buildingId} setBuildingId={setBuildingId} floorId={floorId} setFloorId={setFloorId} sideId={sideId} setSideId={setSideId} />

      {error && <div className="bg-status-red-bg text-status-red text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="flex gap-2.5">
        <button onClick={onClose} className="flex-1 h-10 border border-gray-200 rounded-lg text-sm font-semibold">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="flex-1 h-10 bg-brand-blue text-white rounded-lg text-sm font-semibold disabled:opacity-60">
          {saving ? 'Saving…' : 'Save New Assignment'}
        </button>
      </div>
    </Modal>
  );
}